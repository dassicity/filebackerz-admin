"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Activity,
  LogIn,
  AlertTriangle,
  Monitor,
  ShieldCheck,
  Download,
  Loader2,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ErrorCard } from "@/components/common/error-state";
import { DataTable, type Column } from "@/components/common/data-table";
import { PaginationBar } from "@/components/common/pagination-bar";
import {
  StatusBadge,
  SeverityBadge,
} from "@/components/common/status-badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useSecurityAuditLogs,
  useSecurityAlerts,
  useFailedLogins,
  useSecurityAnomalies,
  useActiveSessionsStats,
  useTwoFaStats,
  useExportAuditLogs,
} from "@/lib/hooks/use-security";
import type {
  AuditCategory,
  AuditLogEntry,
  AuditSeverity,
} from "@/lib/api/dashboard";
import type { CrossOrgAuditParams } from "@/lib/api/security";
import { formatNumber, formatPercent, formatRelative } from "@/lib/formatters";

const ALL = "__all__";
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

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & Audit"
        description="Cross-organization audit logs, security alerts, and anomaly detection."
      />
      <Tabs defaultValue="audit">
        <TabsList>
          <TabsTrigger value="audit">
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            Audit logs
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="failed">
            <LogIn className="w-3.5 h-3.5 mr-1.5" />
            Failed logins
          </TabsTrigger>
          <TabsTrigger value="anomalies">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
            Anomalies
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Monitor className="w-3.5 h-3.5 mr-1.5" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="2fa">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            2FA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-4">
          <AuditLogsTab />
        </TabsContent>
        <TabsContent value="alerts" className="mt-4">
          <AlertsTab />
        </TabsContent>
        <TabsContent value="failed" className="mt-4">
          <FailedLoginsTab />
        </TabsContent>
        <TabsContent value="anomalies" className="mt-4">
          <AnomaliesTab />
        </TabsContent>
        <TabsContent value="sessions" className="mt-4">
          <SessionsTab />
        </TabsContent>
        <TabsContent value="2fa" className="mt-4">
          <TwoFaTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AuditLogsTab() {
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [eventType, setEventType] = useState("");
  const [userIdInput, setUserIdInput] = useState("");
  const [orgIdInput, setOrgIdInput] = useState("");

  // Shared by the list and the export, which honours the same filters.
  const filters: Omit<CrossOrgAuditParams, "page" | "limit"> = {
    severity: severity === ALL ? undefined : (severity as AuditSeverity),
    category: category === ALL ? undefined : (category as AuditCategory),
    status:
      status === ALL
        ? undefined
        : (status as "success" | "failure" | "partial"),
    eventType: eventType || undefined,
    userId: userIdInput || undefined,
    orgId: orgIdInput || undefined,
  };
  const params: CrossOrgAuditParams = { page, limit: 20, ...filters };

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useSecurityAuditLogs(params);

  const reset = () => {
    setSeverity(ALL);
    setCategory(ALL);
    setStatus(ALL);
    setEventType("");
    setUserIdInput("");
    setOrgIdInput("");
    setPage(1);
  };

  const exportMutation = useExportAuditLogs();

  const exportLogs = (format: "csv" | "json") =>
    exportMutation.mutate({ format, ...filters });

  const hasFilters =
    severity !== ALL ||
    category !== ALL ||
    status !== ALL ||
    !!eventType ||
    !!userIdInput ||
    !!orgIdInput;

  const columns: Column<AuditLogEntry>[] = [
    {
      key: "time",
      header: "Time",
      cell: (l) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelative(l.timestamp)}
        </span>
      ),
    },
    {
      key: "event",
      header: "Event",
      cell: (l) => (
        <div className="flex flex-col">
          <span className="font-mono text-[11px] text-muted-foreground">
            {l.eventType}
          </span>
          <span className="text-sm text-foreground line-clamp-1">
            {l.action}
          </span>
        </div>
      ),
    },
    {
      key: "user",
      header: "User",
      cell: (l) => (
        <span className="text-xs text-muted-foreground truncate max-w-[180px] inline-block">
          {l.userEmail ?? "—"}
        </span>
      ),
    },
    {
      key: "org",
      header: "Org",
      cell: (l) =>
        l.organizationId && l.organizationId !== "unknown" ? (
          <Link
            href={`/organizations/${l.organizationId}`}
            className="text-xs font-mono text-muted-foreground hover:text-primary"
          >
            {l.organizationId.slice(0, 8)}…
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "severity",
      header: "Severity",
      cell: (l) => <SeverityBadge severity={l.severity} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (l) => <StatusBadge status={l.status} />,
    },
    {
      key: "ip",
      header: "IP",
      cell: (l) => (
        <span className="text-xs font-mono text-muted-foreground">
          {l.ipAddress ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="Event type (e.g. auth.login.failure)"
              onKeyDown={(e) => e.key === "Enter" && setPage(1)}
            />
            <Input
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              placeholder="Filter by user ID"
              onKeyDown={(e) => e.key === "Enter" && setPage(1)}
            />
            <Input
              value={orgIdInput}
              onChange={(e) => setOrgIdInput(e.target.value)}
              placeholder="Filter by org ID"
              onKeyDown={(e) => e.key === "Enter" && setPage(1)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={severity}
              onValueChange={(v) => {
                setSeverity(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[130px] text-xs">
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
              <SelectTrigger className="h-10 w-[140px] text-xs">
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

            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[130px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="ghost" size="sm" className="h-10" onClick={reset}>
                <X className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            )}

            <div className="flex-1" />

            <Button
              variant="outline"
              size="sm"
              onClick={() => exportLogs("csv")}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending &&
              exportMutation.variables?.format === "csv" ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 mr-1.5" />
              )}
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportLogs("json")}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending &&
              exportMutation.variables?.format === "json" ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 mr-1.5" />
              )}
              JSON
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            Exports use the current filters, up to 10,000 records.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            rows={data?.data}
            loading={isLoading}
            error={error}
            onRetry={refetch}
            rowKey={(l) => l._id}
          />
          <PaginationBar
            pagination={data?.pagination}
            onPageChange={setPage}
            loading={isFetching}
            label="events"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function AlertsTab() {
  const { data, isLoading, error, refetch } = useSecurityAlerts(50);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Recent warnings & critical events
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          WARNING and CRITICAL audit entries across all organizations
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          loading={isLoading}
          error={error}
          onRetry={refetch}
          rows={data}
          rowKey={(l) => l._id}
          columns={[
            {
              key: "time",
              header: "Time",
              cell: (l) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelative(l.timestamp)}
                </span>
              ),
            },
            {
              key: "event",
              header: "Event",
              cell: (l) => (
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {l.eventType}
                  </span>
                  <span className="text-sm text-foreground line-clamp-1">
                    {l.action}
                  </span>
                </div>
              ),
            },
            {
              key: "user",
              header: "User",
              cell: (l) => (
                <span className="text-xs text-muted-foreground truncate max-w-[180px] inline-block">
                  {l.userEmail ?? "—"}
                </span>
              ),
            },
            {
              key: "severity",
              header: "Severity",
              cell: (l) => <SeverityBadge severity={l.severity} />,
            },
            {
              key: "ip",
              header: "IP",
              cell: (l) => (
                <span className="text-xs font-mono text-muted-foreground">
                  {l.ipAddress ?? "—"}
                </span>
              ),
            },
          ]}
          emptyState={
            <div className="py-12 text-center text-sm text-muted-foreground">
              No recent alerts.
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}

function FailedLoginsTab() {
  const { data, isLoading, error, refetch } = useFailedLogins(100);

  if (error && !data) {
    return <ErrorCard error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Top attacking IPs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : data?.summary.topIpAddresses.length ? (
              data.summary.topIpAddresses.map((ip) => (
                <div
                  key={ip._id}
                  className="flex items-center justify-between border-b border-border last:border-b-0 py-2"
                >
                  <span className="font-mono text-xs text-foreground">
                    {ip._id}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {ip.count} attempts
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No failed logins.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Top targeted users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : data?.summary.topUsers.length ? (
              data.summary.topUsers.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between border-b border-border last:border-b-0 py-2"
                >
                  <span className="text-xs text-foreground truncate max-w-[220px]">
                    {u._id}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {u.count}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No data.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Recent failed attempts
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {data?.summary.total ?? 0} total
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            loading={isLoading}
            error={error}
            onRetry={refetch}
            rows={data?.data}
            rowKey={(r) => r._id}
            columns={[
              {
                key: "time",
                header: "Time",
                cell: (r) => (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelative(r.timestamp)}
                  </span>
                ),
              },
              {
                key: "user",
                header: "User",
                cell: (r) => (
                  <span className="text-xs text-foreground">
                    {r.userEmail ?? "—"}
                  </span>
                ),
              },
              {
                key: "ip",
                header: "IP",
                cell: (r) => (
                  <span className="text-xs font-mono text-muted-foreground">
                    {r.ipAddress ?? "—"}
                  </span>
                ),
              },
              {
                key: "location",
                header: "Location",
                cell: (r) => (
                  <span className="text-xs text-muted-foreground">
                    {r.geoLocation?.city
                      ? `${r.geoLocation.city}, ${r.geoLocation.country}`
                      : "—"}
                  </span>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function AnomaliesTab() {
  const { data, isLoading, error, refetch } = useSecurityAnomalies();

  if (error && !data) {
    return <ErrorCard error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Brute-force attempts (last hour)
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            IPs with ≥5 failed auth events
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            loading={isLoading}
            error={error}
            onRetry={refetch}
            rows={data?.bruteForceAttempts}
            rowKey={(r) => r.ipAddress}
            columns={[
              {
                key: "ip",
                header: "IP address",
                cell: (r) => (
                  <span className="font-mono text-xs text-foreground">
                    {r.ipAddress}
                  </span>
                ),
              },
              {
                key: "attempts",
                header: "Failed attempts",
                cell: (r) => (
                  <Badge
                    variant="outline"
                    className="bg-destructive/10 text-destructive border-destructive/30 text-xs"
                  >
                    {r.failedAttempts}
                  </Badge>
                ),
              },
              {
                key: "targets",
                header: "Targeted users",
                cell: (r) => (
                  <span className="text-xs text-muted-foreground">
                    {r.targetedUsers.slice(0, 3).join(", ")}
                    {r.targetedUsers.length > 3
                      ? ` +${r.targetedUsers.length - 3}`
                      : ""}
                  </span>
                ),
              },
            ]}
            emptyState={
              <div className="py-12 text-center text-sm text-muted-foreground">
                No brute-force activity detected.
              </div>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Unusual download volumes
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Users with ≥100 downloads in a single day
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            loading={isLoading}
            error={error}
            onRetry={refetch}
            rows={data?.unusualDownloadVolumes}
            rowKey={(r) => `${r.userId}-${r.date}`}
            columns={[
              {
                key: "user",
                header: "User",
                cell: (r) => (
                  <Link
                    href={`/users/${r.userId}`}
                    className="text-sm text-foreground hover:text-primary"
                  >
                    {r.userEmail}
                  </Link>
                ),
              },
              {
                key: "date",
                header: "Date",
                cell: (r) => (
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                ),
              },
              {
                key: "count",
                header: "Downloads",
                cell: (r) => (
                  <Badge variant="outline" className="text-xs">
                    {formatNumber(r.downloadCount)}
                  </Badge>
                ),
              },
              {
                key: "org",
                header: "Org",
                cell: (r) => (
                  <Link
                    href={`/organizations/${r.organizationId}`}
                    className="text-xs font-mono text-muted-foreground hover:text-primary"
                  >
                    {r.organizationId.slice(0, 8)}…
                  </Link>
                ),
              },
            ]}
            emptyState={
              <div className="py-12 text-center text-sm text-muted-foreground">
                No unusual download patterns.
              </div>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Currently locked accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            loading={isLoading}
            error={error}
            onRetry={refetch}
            rows={data?.currentlyLockedAccounts}
            rowKey={(r) => r._id}
            columns={[
              {
                key: "user",
                header: "User",
                cell: (r) => (
                  <Link
                    href={`/users/${r._id}`}
                    className="text-sm text-foreground hover:text-primary"
                  >
                    {r.name}
                  </Link>
                ),
              },
              {
                key: "email",
                header: "Email",
                cell: (r) => (
                  <span className="text-xs text-muted-foreground">{r.email}</span>
                ),
              },
              {
                key: "attempts",
                header: "Failed attempts",
                cell: (r) => (
                  <Badge
                    variant="outline"
                    className="bg-destructive/10 text-destructive border-destructive/30 text-xs"
                  >
                    {r.failedLoginAttempts}
                  </Badge>
                ),
              },
              {
                key: "until",
                header: "Locked until",
                cell: (r) => (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelative(r.lockUntil)}
                  </span>
                ),
              },
            ]}
            emptyState={
              <div className="py-12 text-center text-sm text-muted-foreground">
                No locked accounts.
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SessionsTab() {
  const { data, isLoading, error, refetch } = useActiveSessionsStats();

  if (error && !data) {
    return <ErrorCard error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Users with active sessions"
          value={formatNumber(data?.usersWithActiveSessions ?? 0)}
          loading={isLoading}
        />
        <StatCard
          label="Total active sessions"
          value={formatNumber(data?.totalActiveSessions ?? 0)}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              By device type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              Object.entries(data?.byDeviceType ?? {}).map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between border-b border-border last:border-b-0 py-2"
                >
                  <span className="text-sm text-foreground capitalize">
                    {type}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {count}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">By OS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              Object.entries(data?.byOS ?? {}).map(([os, count]) => (
                <div
                  key={os}
                  className="flex items-center justify-between border-b border-border last:border-b-0 py-2"
                >
                  <span className="text-sm text-foreground">{os}</span>
                  <span className="text-sm font-semibold text-foreground">
                    {count}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TwoFaTab() {
  const { data, isLoading, error, refetch } = useTwoFaStats();

  if (error && !data) {
    return <ErrorCard error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Adoption
              </div>
              <div className="text-3xl font-bold text-foreground mt-1">
                {isLoading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  formatPercent(data?.adoptionPercent ?? 0)
                )}
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {data
                ? `${formatNumber(data.twoFaEnabled)} of ${formatNumber(data.total)}`
                : ""}
            </div>
          </div>
          <Progress
            value={Math.min(100, data?.adoptionPercent ?? 0)}
            className="h-2"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">By method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              Object.entries(data?.byMethod ?? {}).map(([method, count]) => (
                <div
                  key={method}
                  className="flex items-center justify-between border-b border-border last:border-b-0 py-2"
                >
                  <span className="text-sm text-foreground uppercase">
                    {method}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {count}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              By auth provider
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              Object.entries(data?.byAuthProvider ?? {}).map(
                ([provider, count]) => (
                  <div
                    key={provider}
                    className="flex items-center justify-between border-b border-border last:border-b-0 py-2"
                  >
                    <span className="text-sm text-foreground capitalize">
                      {provider}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {count}
                    </span>
                  </div>
                ),
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Enabled last 30 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                formatNumber(data?.enabledLast30Days ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              New 2FA enablements this month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
        <div className="text-2xl font-bold text-foreground mt-1">
          {loading ? <Skeleton className="h-7 w-20" /> : value}
        </div>
      </CardContent>
    </Card>
  );
}
