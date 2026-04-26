"use client";

import { useState } from "react";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivity, type ActivityParams } from "@/lib/hooks/use-dashboard";
import type {
  AuditCategory,
  AuditSeverity,
  AuditLogEntry,
} from "@/lib/api/dashboard";
import { formatRelative } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const SEVERITIES: AuditSeverity[] = ["INFO", "WARNING", "ERROR", "CRITICAL"];
const CATEGORIES: AuditCategory[] = [
  "AUTH",
  "FILE",
  "FOLDER",
  "ORGANIZATION",
  "PERMISSION",
  "GROUP",
  "SETTINGS",
  "SECURITY",
  "API",
  "ACTIVITY",
  "STORAGE",
];

const ALL = "__all__";

function severityBadgeClass(sev: string): string {
  switch (sev) {
    case "CRITICAL":
      return "bg-destructive text-destructive-foreground border-destructive";
    case "ERROR":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "WARNING":
      return "bg-warning/15 text-warning border-warning/30";
    case "INFO":
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function statusBadgeClass(status: string): string {
  if (status === "success") {
    return "bg-success/15 text-success border-success/30";
  }
  if (status === "failure") {
    return "bg-destructive/15 text-destructive border-destructive/30";
  }
  return "bg-muted text-muted-foreground border-border";
}

export function ActivityFeed() {
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(ALL);

  const params: ActivityParams = {
    page,
    limit: 15,
    severity: severity === ALL ? undefined : (severity as AuditSeverity),
    category: category === ALL ? undefined : (category as AuditCategory),
  };

  const { data, isLoading, isFetching } = useActivity(params);

  const logs = data?.logs ?? [];
  const pagination = data?.pagination;

  const reset = () => {
    setSeverity(ALL);
    setCategory(ALL);
    setPage(1);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 space-y-0">
        <div>
          <CardTitle className="text-lg font-semibold">
            Recent activity
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Platform audit log · newest first
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={severity}
            onValueChange={(v) => {
              setSeverity(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All severities</SelectItem>
              {SEVERITIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-8 text-xs"
          >
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/30">
                <Th>Time</Th>
                <Th>Event</Th>
                <Th>User</Th>
                <Th>Severity</Th>
                <Th>Status</Th>
                <Th>IP</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={6} className="px-4 py-3">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                : logs.length === 0
                  ? [
                      <tr key="empty">
                        <td colSpan={6}>
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                              <Activity className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              No activity matches the current filters.
                            </p>
                          </div>
                        </td>
                      </tr>,
                    ]
                  : logs.map((log) => <LogRow key={log._id} log={log} />)}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs">
            <div className="text-muted-foreground">
              Page {pagination.page} of {pagination.pages} ·{" "}
              {pagination.total.toLocaleString()} events
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                disabled={page >= pagination.pages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wider px-4 py-2.5">
      {children}
    </th>
  );
}

function LogRow({ log }: { log: AuditLogEntry }) {
  return (
    <tr className="border-b border-border hover:bg-muted/40 transition-colors">
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatRelative(log.timestamp)}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-mono text-[11px] text-muted-foreground">
            {log.eventType}
          </span>
          <span className="text-sm text-foreground line-clamp-1">
            {log.action}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate">
        {log.userEmail ?? "—"}
      </td>
      <td className="px-4 py-3">
        <Badge
          variant="outline"
          className={cn("text-[10px] uppercase", severityBadgeClass(log.severity))}
        >
          {log.severity}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge
          variant="outline"
          className={cn("text-[10px] uppercase", statusBadgeClass(log.status))}
        >
          {log.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
        {log.ipAddress ?? "—"}
      </td>
    </tr>
  );
}
