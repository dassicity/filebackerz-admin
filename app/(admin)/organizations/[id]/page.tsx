"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  Loader2,
  Building2,
  Users,
  HardDrive,
  Database,
  Activity,
  Settings,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ErrorCard } from "@/components/common/error-state";
import { isNotFoundError } from "@/lib/api/errors";
import { DataTable, type Column } from "@/components/common/data-table";
import { PaginationBar } from "@/components/common/pagination-bar";
import {
  StatusBadge,
  PlanBadge,
  RoleBadge,
  SeverityBadge,
} from "@/components/common/status-badges";
import { OrgActions } from "@/components/organizations/org-actions";
import { OrgSettingsCard } from "@/components/organizations/org-settings-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useOrganization,
  useOrgMembers,
  useOrgStorage,
  useOrgStorageConnections,
  useOrgStorageHistory,
  useOrgAuditLogs,
} from "@/lib/hooks/use-organizations";
import type { OrgMember, OrgStorageConnection } from "@/lib/api/organizations";
import type { AuditLogEntry } from "@/lib/api/dashboard";
import {
  formatBytes,
  formatNumber,
  formatPercent,
  formatRelative,
} from "@/lib/formatters";

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: org, isLoading, error, refetch } = useOrganization(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !org && !isNotFoundError(error)) {
    return (
      <div>
        <PageHeader title="Organization" />
        <ErrorCard
          error={error}
          onRetry={refetch}
          title="Couldn't load this organization"
        />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div>
        <PageHeader
          title="Organization not found"
          description="The organization you requested does not exist or was deleted."
        />
        <Button variant="outline" asChild>
          <Link href="/organizations">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to organizations
          </Link>
        </Button>
      </div>
    );
  }

  const utilization =
    org.storageQuota > 0 ? (org.storageUsed / org.storageQuota) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/organizations">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            All organizations
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
                  {org.name}
                </h1>
                <PlanBadge plan={org.plan} />
                <StatusBadge status={org.status} />
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {org.subdomain ? `${org.subdomain}.filebackerz.com` : org.slug} · {org.type}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Created {formatRelative(org.createdAt)} · Updated{" "}
                {formatRelative(org.updatedAt)}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <OrgActions org={org} />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Members"
          value={formatNumber(org.computed.memberCount)}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          label="Files"
          value={formatNumber(org.computed.fileCount)}
          icon={<FileText className="w-4 h-4" />}
        />
        <StatCard
          label="Folders"
          value={formatNumber(org.computed.folderCount)}
          icon={<Database className="w-4 h-4" />}
        />
        <StatCard
          label="Active shares"
          value={formatNumber(org.computed.activeShareLinks)}
          icon={<Activity className="w-4 h-4" />}
        />
      </div>

      {/* Storage overview strip */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">Storage usage</span>
            </div>
            <span className="font-mono text-muted-foreground">
              {formatBytes(org.storageUsed)} / {formatBytes(org.storageQuota)} ·{" "}
              {formatPercent(utilization)}
            </span>
          </div>
          <Progress value={Math.min(100, utilization)} />
        </CardContent>
      </Card>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Members
          </TabsTrigger>
          <TabsTrigger value="storage">
            <HardDrive className="w-3.5 h-3.5 mr-1.5" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="connections">
            <Database className="w-3.5 h-3.5 mr-1.5" />
            BYOS
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            Audit log
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-3.5 h-3.5 mr-1.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <MembersTab orgId={id} />
        </TabsContent>
        <TabsContent value="storage" className="mt-4">
          <StorageTab orgId={id} />
        </TabsContent>
        <TabsContent value="connections" className="mt-4">
          <ConnectionsTab orgId={id} />
        </TabsContent>
        <TabsContent value="audit" className="mt-4">
          <AuditTab orgId={id} />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <OrgSettingsCard org={org} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            {label}
          </div>
          <div className="text-2xl font-bold text-foreground mt-0.5">
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MembersTab({ orgId }: { orgId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch, isFetching } = useOrgMembers(orgId, {
    page,
    limit: 20,
  });

  const columns: Column<OrgMember>[] = [
    {
      key: "user",
      header: "User",
      cell: (m) => (
        <div className="flex flex-col min-w-0">
          {m.userId ? (
            <Link
              href={`/users/${m.userId._id}`}
              className="font-medium text-foreground hover:text-primary transition-colors truncate"
            >
              {m.userId.name}
            </Link>
          ) : (
            <span className="font-medium text-foreground truncate">
              {m.email ?? "—"}
            </span>
          )}
          <span className="text-xs text-muted-foreground truncate">
            {m.userId?.email ?? m.email ?? ""}
          </span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (m) => <RoleBadge role={m.role} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (m) => <StatusBadge status={m.status} />,
    },
    {
      key: "joined",
      header: "Joined",
      cell: (m) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelative(m.joinedAt)}
        </span>
      ),
    },
    {
      key: "lastLogin",
      header: "Last login",
      cell: (m) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {m.userId?.lastLogin ? formatRelative(m.userId.lastLogin) : "—"}
        </span>
      ),
    },
  ];

  return (
    <Card>
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          rows={data?.data}
          loading={isLoading}
          error={error}
          onRetry={refetch}
          rowKey={(m) => m._id}
          emptyState={
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 mx-auto">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No members yet.</p>
            </div>
          }
        />
        <PaginationBar
          pagination={data?.pagination}
          onPageChange={setPage}
          loading={isFetching}
          label="members"
        />
      </CardContent>
    </Card>
  );
}

function StorageTab({ orgId }: { orgId: string }) {
  return (
    <div className="space-y-4">
      <StorageDetailsSection orgId={orgId} />
      <StorageHistoryCard orgId={orgId} />
    </div>
  );
}

function StorageDetailsSection({ orgId }: { orgId: string }) {
  const { data, isLoading, error, refetch } = useOrgStorage(orgId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error && !data) {
    return <ErrorCard error={error} onRetry={refetch} />;
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No storage data.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">File stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StatLine
            label="Total files"
            value={formatNumber(data.fileStats.fileCount)}
          />
          <StatLine
            label="Total size"
            value={formatBytes(data.fileStats.totalSize)}
          />
          <StatLine
            label="Average file size"
            value={formatBytes(data.fileStats.averageSize)}
          />
          <StatLine
            label="Utilization"
            value={formatPercent(data.utilizationPercent)}
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Top files by size
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/30">
                <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wider px-4 py-2.5">
                  Name
                </th>
                <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wider px-4 py-2.5">
                  Type
                </th>
                <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wider px-4 py-2.5">
                  Size
                </th>
                <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wider px-4 py-2.5">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.topFilesBySize.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No files yet.
                  </td>
                </tr>
              ) : (
                data.topFilesBySize.map((f) => (
                  <tr key={f._id} className="border-b border-border">
                    <td className="px-4 py-3 text-foreground truncate max-w-[280px]">
                      {f.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-muted-foreground">
                        {f.currentVersion?.mimeType ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                      {formatBytes(f.currentVersion?.size ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelative(f.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

const HISTORY_RANGES = [
  { value: "30", label: "30d" },
  { value: "90", label: "90d" },
  { value: "365", label: "1y" },
];

function StorageHistoryCard({ orgId }: { orgId: string }) {
  const [days, setDays] = useState("90");
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useOrgStorageHistory(orgId, Number(days));

  const points = useMemo(
    () =>
      (data?.snapshots ?? []).map((s) => ({
        date: s.date.slice(0, 10),
        used: s.bytesUsed,
        quota: s.quotaBytes,
      })),
    [data],
  );

  if (error && !data) {
    return <ErrorCard error={error} onRetry={refetch} />;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold">
              Storage history
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Daily snapshots (05:00 UTC) — overage charges are computed from
              the period peak, not current usage.
              {data?.organization.periodPeakStorageUsed != null &&
                ` Period peak: ${formatBytes(data.organization.periodPeakStorageUsed)}.`}
            </p>
          </div>
          <Tabs value={days} onValueChange={setDays}>
            <TabsList className="h-8">
              {HISTORY_RANGES.map((r) => (
                <TabsTrigger
                  key={r.value}
                  value={r.value}
                  className="text-xs px-2.5 py-1"
                >
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : points.length === 0 ? (
          <div className="h-[260px] flex flex-col items-center justify-center text-center">
            <HardDrive className="w-8 h-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No snapshots in this range yet.
            </p>
          </div>
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={points}
                margin={{ top: 10, right: 12, left: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="fill-storage-history"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  tickFormatter={(v: number) => formatBytes(v)}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={76}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatBytes(Number(value)),
                    name === "used" ? "Used" : "Quota",
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="quota"
                  name="quota"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  fill="transparent"
                />
                <Area
                  type="monotone"
                  dataKey="used"
                  name="used"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#fill-storage-history)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConnectionsTab({ orgId }: { orgId: string }) {
  const { data, isLoading, error, refetch } = useOrgStorageConnections(orgId);

  const columns: Column<OrgStorageConnection>[] = [
    {
      key: "name",
      header: "Name",
      cell: (c) => (
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-foreground truncate flex items-center gap-2">
            {c.name}
            {c.isDefault && (
              <Badge variant="secondary" className="text-[9px] uppercase">
                Default
              </Badge>
            )}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {c.provider}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "lastCheck",
      header: "Last health check",
      cell: (c) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {c.lastHealthCheck ? formatRelative(c.lastHealthCheck) : "Never"}
        </span>
      ),
    },
    {
      key: "error",
      header: "Last error",
      cell: (c) => (
        <span className="text-xs text-destructive truncate max-w-[240px] inline-block">
          {c.lastError ?? "—"}
        </span>
      ),
    },
    {
      key: "created",
      header: "Created",
      cell: (c) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelative(c.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <Card>
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          rows={data}
          loading={isLoading}
          error={error}
          onRetry={refetch}
          rowKey={(c) => c._id}
          emptyState={
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 mx-auto">
                <Database className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No BYOS connections on this organization.
              </p>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}

function AuditTab({ orgId }: { orgId: string }) {
  const [page, setPage] = useState(1);
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useOrgAuditLogs(orgId, {
    page,
    limit: 15,
  });

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
      key: "severity",
      header: "Severity",
      cell: (l) => <SeverityBadge severity={l.severity} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (l) => <StatusBadge status={l.status} />,
    },
  ];

  return (
    <Card>
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          rows={data?.data}
          loading={isLoading}
          error={error}
          onRetry={refetch}
          rowKey={(l) => l._id}
          emptyState={
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 mx-auto">
                <Activity className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No audit log entries.</p>
            </div>
          }
        />
        <PaginationBar
          pagination={data?.pagination}
          onPageChange={setPage}
          loading={isFetching}
          label="events"
        />
      </CardContent>
    </Card>
  );
}
