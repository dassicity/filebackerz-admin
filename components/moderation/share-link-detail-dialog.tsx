"use client";

import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/status-badges";
import { useShareLink, useRevokeShareLink } from "@/lib/hooks/use-content";
import { formatRelative } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface Props {
  linkId: string | null;
  onClose: () => void;
}

export function ShareLinkDetailDialog({ linkId, onClose }: Props) {
  const open = !!linkId;
  const { data, isLoading } = useShareLink(linkId ?? undefined);
  const revoke = useRevokeShareLink();

  const doRevoke = () => {
    if (!linkId) return;
    revoke.mutate(linkId, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share link detail</DialogTitle>
          <DialogDescription>
            {data?.organization?.name ?? "—"}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto scrollbar-thin pr-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Status">
                <StatusBadge status={data.isActive ? "active" : "inactive"} />
              </Field>
              <Field label="Resource">
                <Badge variant="outline" className="text-[10px] uppercase">
                  {data.resourceType}
                </Badge>
              </Field>
              <Field label="Access count">
                <span className="text-sm font-semibold">
                  {data.accessCount}
                  {data.maxAccessCount ? ` / ${data.maxAccessCount}` : ""}
                </span>
              </Field>
              <Field label="Permission preset">
                <span className="text-xs capitalize">
                  {data.permissionPreset}
                </span>
              </Field>
              <Field label="Created">
                <span className="text-xs text-muted-foreground">
                  {formatRelative(data.createdAt)}
                </span>
              </Field>
              <Field label="Expires">
                <span className="text-xs text-muted-foreground">
                  {data.expiresAt ? formatRelative(data.expiresAt) : "Never"}
                </span>
              </Field>
            </div>

            {data.shareUrl && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Share URL
                </div>
                <div className="rounded-md border border-border bg-muted/40 p-2 text-xs font-mono text-foreground break-all">
                  {data.shareUrl}
                </div>
              </div>
            )}

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Permissions
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <Perm label="Download" enabled={data.settings.allowDownload} />
                <Perm label="Upload" enabled={data.settings.allowUpload} />
                <Perm label="Delete" enabled={data.settings.allowDelete} />
                <Perm label="Move" enabled={data.settings.allowMove} />
                <Perm label="Rename" enabled={data.settings.allowRename} />
                <Perm
                  label="Require email"
                  enabled={data.settings.requireEmail}
                />
              </div>
            </div>

            {data.accessLog && data.accessLog.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Recent accesses
                </div>
                <div className="rounded-md border border-border divide-y divide-border">
                  {data.accessLog.slice(0, 10).map((log, i) => (
                    <div key={i} className="p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-muted-foreground">
                          {log.ipAddress}
                        </span>
                        <span className="text-muted-foreground">
                          {formatRelative(log.accessedAt)}
                        </span>
                      </div>
                      {log.email && (
                        <div className="text-muted-foreground mt-0.5">
                          {log.email}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {data?.isActive && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Revoke link</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revoke this share link?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Anyone with this link will immediately lose access. This
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={cn(buttonVariants({ variant: "destructive" }))}
                    onClick={doRevoke}
                    disabled={revoke.isPending}
                  >
                    {revoke.isPending ? "Revoking…" : "Revoke"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

function Perm({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-success" : "bg-muted-foreground"}`}
      />
      <span className={enabled ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}
