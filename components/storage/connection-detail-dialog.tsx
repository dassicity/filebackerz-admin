"use client";

import { Loader2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/status-badges";
import { ErrorState } from "@/components/common/error-state";
import {
  useStorageConnection,
  useTriggerHealthCheck,
} from "@/lib/hooks/use-storage";
import { formatRelative } from "@/lib/formatters";

interface Props {
  connectionId: string | null;
  onClose: () => void;
}

export function ConnectionDetailDialog({ connectionId, onClose }: Props) {
  const open = !!connectionId;
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useStorageConnection(connectionId ?? undefined);
  const trigger = useTriggerHealthCheck();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {data?.name ?? "Storage connection"}
            {data?.isDefault && (
              <Badge
                variant="secondary"
                className="ml-2 text-[9px] uppercase align-middle"
              >
                Default
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {data?.organization?.name
              ? `${data.organization.name} · ${data.provider.toUpperCase()}`
              : data?.provider?.toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        {error && !data ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading || !data ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Status">
                <StatusBadge status={data.status} />
              </Field>
              <Field label="Provider">
                <span className="uppercase text-xs font-mono">
                  {data.provider}
                </span>
              </Field>
              <Field label="Last health check">
                <span className="text-xs text-muted-foreground">
                  {data.lastHealthCheck
                    ? formatRelative(data.lastHealthCheck)
                    : "Never"}
                </span>
              </Field>
              <Field label="Created">
                <span className="text-xs text-muted-foreground">
                  {formatRelative(data.createdAt)}
                </span>
              </Field>
            </div>

            {data.lastError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
                <div className="text-xs font-semibold text-destructive uppercase tracking-wider mb-1">
                  Last error
                </div>
                <div className="text-xs font-mono text-destructive break-words">
                  {data.lastError}
                </div>
              </div>
            )}

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Connection config (sensitive fields redacted)
              </div>
              <pre className="rounded-md border border-border bg-muted/40 p-3 text-xs font-mono text-foreground overflow-x-auto scrollbar-thin">
                {JSON.stringify(data.config, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => connectionId && trigger.mutate(connectionId)}
            disabled={trigger.isPending || !connectionId}
          >
            <RefreshCw
              className={`w-4 h-4 mr-1.5 ${trigger.isPending ? "animate-spin" : ""}`}
            />
            {trigger.isPending ? "Running…" : "Run health check"}
          </Button>
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
