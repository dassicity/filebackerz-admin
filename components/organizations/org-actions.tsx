"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pause,
  Play,
  CalendarPlus,
  CreditCard,
  Gauge,
  HardDrive,
  Link2,
  Trash2,
  Users,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useUpdateOrgStatus,
  useUpdateOrgPlan,
  useUpdateOrgQuota,
  useUpdateOrgSubdomain,
  useExtendOrgTrial,
  useUpdateOrgOverage,
  useUpdateOrgSeatCap,
  useDeleteOrganization,
} from "@/lib/hooks/use-organizations";
import type {
  AdminListedOrganization,
  OrgPlan,
  OrgStatus,
} from "@/lib/api/organizations";
import { cn } from "@/lib/utils";
import { formatBytes, formatRelative } from "@/lib/formatters";

interface OrgActionsProps {
  org: Pick<
    AdminListedOrganization,
    | "_id"
    | "name"
    | "plan"
    | "status"
    | "subdomain"
    | "storageQuota"
    | "billing"
    | "softSeatCap"
  >;
}

type DialogKind =
  | "status"
  | "plan"
  | "trial"
  | "quota"
  | "overage"
  | "seat-cap"
  | "subdomain"
  | "delete"
  | null;

const GB = 1024 * 1024 * 1024;

export function OrgActions({ org }: OrgActionsProps) {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogKind>(null);

  const [statusValue, setStatusValue] = useState<OrgStatus>(
    org.status as OrgStatus,
  );
  const [planValue, setPlanValue] = useState<OrgPlan>(org.plan as OrgPlan);
  const [quotaGB, setQuotaGB] = useState<string>(
    String(Math.round(org.storageQuota / GB)),
  );
  const [subdomainValue, setSubdomainValue] = useState<string>(
    org.subdomain ?? "",
  );
  const [extendDays, setExtendDays] = useState("30");
  const [overageValue, setOverageValue] = useState<"authorized" | "revoked">(
    org.billing?.overageAuthorized ? "authorized" : "revoked",
  );
  const [seatCapValue, setSeatCapValue] = useState<string>(
    org.softSeatCap != null ? String(org.softSeatCap) : "",
  );
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const updateStatus = useUpdateOrgStatus();
  const updatePlan = useUpdateOrgPlan();
  const updateQuota = useUpdateOrgQuota();
  const updateSub = useUpdateOrgSubdomain();
  const extendTrial = useExtendOrgTrial();
  const updateOverage = useUpdateOrgOverage();
  const updateSeatCap = useUpdateOrgSeatCap();
  const deleteOrg = useDeleteOrganization();

  const close = () => setDialog(null);

  const submitStatus = () =>
    updateStatus.mutate(
      { orgId: org._id, args: [statusValue] },
      { onSuccess: close },
    );

  const submitPlan = () =>
    updatePlan.mutate(
      { orgId: org._id, args: [planValue] },
      { onSuccess: close },
    );

  const submitQuota = () => {
    const gb = Number(quotaGB);
    if (!Number.isFinite(gb) || gb <= 0) return;
    updateQuota.mutate(
      { orgId: org._id, args: [Math.round(gb * GB)] },
      { onSuccess: close },
    );
  };

  const submitTrial = () => {
    const days = Number(extendDays);
    if (!Number.isInteger(days) || days < 1) return;
    extendTrial.mutate(
      { orgId: org._id, args: [{ extendDays: days }] },
      { onSuccess: close },
    );
  };

  const submitOverage = () =>
    updateOverage.mutate(
      { orgId: org._id, args: [overageValue === "authorized"] },
      { onSuccess: close },
    );

  const submitSeatCap = () => {
    const trimmed = seatCapValue.trim();
    const cap = trimmed === "" ? null : Number(trimmed);
    if (cap !== null && (!Number.isInteger(cap) || cap < 1)) return;
    updateSeatCap.mutate(
      { orgId: org._id, args: [cap] },
      { onSuccess: close },
    );
  };

  const submitSubdomain = () => {
    const v = subdomainValue.trim();
    if (!v) return;
    updateSub.mutate(
      { orgId: org._id, args: [v] },
      { onSuccess: close },
    );
  };

  const submitDelete = () => {
    if (deleteConfirm !== org.name) return;
    deleteOrg.mutate(org._id, {
      onSuccess: () => {
        close();
        router.replace("/organizations");
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="w-4 h-4 mr-1.5" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[220px]">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Manage organization
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setStatusValue(org.status as OrgStatus);
              setDialog("status");
            }}
          >
            {org.status === "suspended" ? (
              <Play className="w-4 h-4 mr-2" />
            ) : (
              <Pause className="w-4 h-4 mr-2" />
            )}
            Change status
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setPlanValue(org.plan as OrgPlan);
              setDialog("plan");
            }}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Change plan
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setExtendDays("30");
              setDialog("trial");
            }}
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Extend trial
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setQuotaGB(String(Math.round(org.storageQuota / GB)));
              setDialog("quota");
            }}
          >
            <HardDrive className="w-4 h-4 mr-2" />
            Adjust quota
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setOverageValue(
                org.billing?.overageAuthorized ? "authorized" : "revoked",
              );
              setDialog("overage");
            }}
          >
            <Gauge className="w-4 h-4 mr-2" />
            Overage authorization
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setSeatCapValue(
                org.softSeatCap != null ? String(org.softSeatCap) : "",
              );
              setDialog("seat-cap");
            }}
          >
            <Users className="w-4 h-4 mr-2" />
            Seat cap
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setSubdomainValue(org.subdomain ?? "");
              setDialog("subdomain");
            }}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Change subdomain
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setDeleteConfirm("");
              setDialog("delete");
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete permanently
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status */}
      <Dialog open={dialog === "status"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change organization status</DialogTitle>
            <DialogDescription>{org.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              New status
            </Label>
            <Select value={statusValue} onValueChange={(v) => setStatusValue(v as OrgStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Expired and Suspended both make the org read-only — uploads
              blocked, existing data untouched. Expired shows an upgrade CTA,
              Suspended points to support. Deleted hides the org but preserves
              data.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button onClick={submitStatus} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? "Saving…" : "Save status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan */}
      <Dialog open={dialog === "plan"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change plan</DialogTitle>
            <DialogDescription>{org.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              New plan
            </Label>
            <Select value={planValue} onValueChange={(v) => setPlanValue(v as OrgPlan)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Changes our records only — nothing is created, cancelled, or
              modified in Stripe. Use it to comp an org onto the paid plan. The
              storage quota is recomputed from plan defaults. If the org has a
              live subscription, the nightly reconcile pulls Stripe&apos;s view
              back over the top.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button onClick={submitPlan} disabled={updatePlan.isPending}>
              {updatePlan.isPending ? "Saving…" : "Save plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend trial */}
      <Dialog open={dialog === "trial"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend trial</DialogTitle>
            <DialogDescription>
              {org.name}
              {org.billing?.trialEndsAt
                ? ` · current trial ends ${formatRelative(org.billing.trialEndsAt)}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label
              htmlFor="extend-days"
              className="text-xs text-muted-foreground uppercase tracking-wider"
            >
              Extra free days
            </Label>
            <Input
              id="extend-days"
              type="number"
              min={1}
              value={extendDays}
              onChange={(e) => setExtendDays(e.target.value)}
              placeholder="30"
            />
            <p className="text-xs text-muted-foreground">
              Days count from the later of now and the current end date, so
              extending an already-expired org grants real time. An expired org
              is revived — uploads resume immediately — and the countdown
              reminder emails fire again for the new window. Actively paying
              orgs are never demoted. The owner is emailed about the extension.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={submitTrial}
              disabled={
                extendTrial.isPending ||
                !Number.isInteger(Number(extendDays)) ||
                Number(extendDays) < 1
              }
            >
              {extendTrial.isPending ? "Extending…" : "Extend trial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quota */}
      <Dialog open={dialog === "quota"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust storage quota</DialogTitle>
            <DialogDescription>
              Current: {formatBytes(org.storageQuota)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label
              htmlFor="quota-input"
              className="text-xs text-muted-foreground uppercase tracking-wider"
            >
              New quota (GB)
            </Label>
            <Input
              id="quota-input"
              type="number"
              min={1}
              value={quotaGB}
              onChange={(e) => setQuotaGB(e.target.value)}
              placeholder="10"
            />
            <p className="text-xs text-muted-foreground">
              {quotaGB && Number(quotaGB) > 0
                ? `= ${formatBytes(Number(quotaGB) * GB)}`
                : "Enter a value in gigabytes"}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={submitQuota}
              disabled={
                updateQuota.isPending ||
                !quotaGB ||
                Number(quotaGB) <= 0
              }
            >
              {updateQuota.isPending ? "Saving…" : "Save quota"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Overage authorization */}
      <Dialog open={dialog === "overage"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Overage authorization</DialogTitle>
            <DialogDescription>{org.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Storage overage
            </Label>
            <Select
              value={overageValue}
              onValueChange={(v) =>
                setOverageValue(v as "authorized" | "revoked")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="authorized">Authorized</SelectItem>
                <SelectItem value="revoked">Not authorized</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {overageValue === "authorized" ? (
                <>
                  The organization{" "}
                  <span className="text-warning font-medium">
                    will be charged
                  </span>{" "}
                  for storage above its allowance on its next invoice. Use this
                  to unblock a customer mid-migration who cannot reach the
                  checkbox themselves. Logged as a WARNING audit event.
                </>
              ) : (
                <>
                  While over quota without authorization, the organization
                  cannot upload at all — it is blocked rather than billed.
                </>
              )}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button onClick={submitOverage} disabled={updateOverage.isPending}>
              {updateOverage.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Seat cap */}
      <Dialog open={dialog === "seat-cap"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fair-use seat cap</DialogTitle>
            <DialogDescription>{org.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label
              htmlFor="seat-cap-input"
              className="text-xs text-muted-foreground uppercase tracking-wider"
            >
              Soft seat cap
            </Label>
            <Input
              id="seat-cap-input"
              type="number"
              min={1}
              value={seatCapValue}
              onChange={(e) => setSeatCapValue(e.target.value)}
              placeholder="Platform default"
            />
            <p className="text-xs text-muted-foreground">
              An alerting threshold only — it never blocks an invite, since all
              plans include unlimited users. Crossing it raises an audit event
              and emails the platform admin. Leave blank to restore the
              platform default.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={submitSeatCap}
              disabled={
                updateSeatCap.isPending ||
                (seatCapValue.trim() !== "" &&
                  (!Number.isInteger(Number(seatCapValue)) ||
                    Number(seatCapValue) < 1))
              }
            >
              {updateSeatCap.isPending ? "Saving…" : "Save seat cap"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subdomain */}
      <Dialog open={dialog === "subdomain"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change subdomain</DialogTitle>
            <DialogDescription>
              3–63 chars, lowercase letters, digits, and hyphens only.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label
              htmlFor="subdomain-input"
              className="text-xs text-muted-foreground uppercase tracking-wider"
            >
              Subdomain
            </Label>
            <Input
              id="subdomain-input"
              value={subdomainValue}
              onChange={(e) => setSubdomainValue(e.target.value.toLowerCase())}
              placeholder="my-company"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={submitSubdomain}
              disabled={updateSub.isPending || !subdomainValue.trim()}
            >
              {updateSub.isPending ? "Saving…" : "Save subdomain"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={dialog === "delete"} onOpenChange={(o) => !o && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete {org.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the organization and all associated files, folders,
              members, storage connections, share links, and audit logs.{" "}
              <span className="text-destructive font-medium">
                This cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label
              htmlFor="delete-confirm"
              className="text-xs text-muted-foreground"
            >
              Type <span className="font-mono text-foreground">{org.name}</span>{" "}
              to confirm
            </Label>
            <Input
              id="delete-confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={submitDelete}
              disabled={deleteOrg.isPending || deleteConfirm !== org.name}
            >
              {deleteOrg.isPending ? "Deleting…" : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
