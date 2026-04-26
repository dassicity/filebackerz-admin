"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pause,
  Play,
  CreditCard,
  HardDrive,
  Link2,
  Trash2,
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
  useDeleteOrganization,
} from "@/lib/hooks/use-organizations";
import type {
  AdminListedOrganization,
  OrgPlan,
  OrgStatus,
} from "@/lib/api/organizations";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/formatters";

interface OrgActionsProps {
  org: Pick<
    AdminListedOrganization,
    "_id" | "name" | "plan" | "status" | "subdomain" | "storageQuota"
  >;
}

type DialogKind =
  | "status"
  | "plan"
  | "quota"
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
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const updateStatus = useUpdateOrgStatus();
  const updatePlan = useUpdateOrgPlan();
  const updateQuota = useUpdateOrgQuota();
  const updateSub = useUpdateOrgSubdomain();
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
              setQuotaGB(String(Math.round(org.storageQuota / GB)));
              setDialog("quota");
            }}
          >
            <HardDrive className="w-4 h-4 mr-2" />
            Adjust quota
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
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Suspending blocks all user access immediately. Deleted hides the org but preserves data.
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
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
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
