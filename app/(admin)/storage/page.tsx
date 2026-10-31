"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HardDrive,
  Database,
  AlertCircle,
  Server,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ErrorCard } from "@/components/common/error-state";
import { DataTable, type Column } from "@/components/common/data-table";
import { PaginationBar } from "@/components/common/pagination-bar";
import {
  StatusBadge,
  PlanBadge,
} from "@/components/common/status-badges";
import { ConnectionDetailDialog } from "@/components/storage/connection-detail-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useStorageOverview,
  useStorageConnections,
  useInternalStorage,
  useTopConsumers,
} from "@/lib/hooks/use-storage";
import type {
  AdminStorageConnection,
  ListConnectionsParams,
  TopConsumer,
} from "@/lib/api/storage";
import {
  formatBytes,
  formatNumber,
  formatPercent,
  formatRelative,
} from "@/lib/formatters";

export default function StoragePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Storage & BYOS"
        description="Platform-wide storage usage, top consumers, and bring-your-own-storage health."
      />
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            <HardDrive className="w-3.5 h-3.5 mr-1.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="top">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            Top consumers
          </TabsTrigger>
          <TabsTrigger value="connections">
            <Database className="w-3.5 h-3.5 mr-1.5" />
            BYOS connections
          </TabsTrigger>
          <TabsTrigger value="internal">
            <Server className="w-3.5 h-3.5 mr-1.5" />
            Internal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="top" className="mt-4">
          <TopConsumersTab />
        </TabsContent>
        <TabsContent value="connections" className="mt-4">
          <ConnectionsTab />
        </TabsContent>
        <TabsContent value="internal" className="mt-4">
          <InternalTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab() {
  const { data, isLoading, error, refetch } = useStorageOverview(10);

  if (error && !data) {
    return <ErrorCard error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      {/* By plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Storage by plan</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Aggregate usage across pricing tiers
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </>
          ) : data && data.byPlan.length > 0 ? (
            data.byPlan.map((row) => {
              const pct =
                row.totalQuota > 0 ? (row.totalUsed / row.totalQuota) * 100 : 0;
              return (
                <div key={row.plan} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize text-foreground">
                        {row.plan}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {formatNumber(row.orgCount)} orgs
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatBytes(row.totalUsed)} / {formatBytes(row.totalQuota)}
                    </span>
                  </div>
                  <Progress value={Math.min(100, pct)} className="h-1.5" />
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No data available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top 10 consumers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Top 10 storage consumers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            loading={isLoading}
            error={error}
            onRetry={refetch}
            rows={data?.topConsumers}
            rowKey={(c) => c._id}
            columns={[
              {
                key: "name",
                header: "Organization",
                cell: (c) => (
                  <Link
                    href={`/organizations/${c._id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {c.name}
                  </Link>
                ),
              },
              {
                key: "plan",
                header: "Plan",
                cell: (c) => <PlanBadge plan={c.plan} />,
              },
              {
                key: "used",
                header: "Used",
                cell: (c) => (
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatBytes(c.storageUsed)}
                  </span>
                ),
              },
              {
                key: "quota",
                header: "Quota",
                cell: (c) => (
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatBytes(c.storageQuota)}
                  </span>
                ),
              },
              {
                key: "utilization",
                header: "Utilization",
                cell: (c) => (
                  <div className="min-w-[140px]">
                    <div className="text-xs text-muted-foreground font-mono">
                      {formatPercent(c.utilizationPercent)}
                    </div>
                    <Progress
                      value={Math.min(100, c.utilizationPercent)}
                      className="h-1 mt-1"
                    />
                  </div>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* BYOS status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              BYOS connections by provider
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(data?.byosConnections.byProvider ?? {}).map(
                  ([provider, count]) => (
                    <div
                      key={provider}
                      className="flex items-center justify-between rounded-md border border-border p-3"
                    >
                      <span className="text-sm font-medium text-foreground capitalize">
                        {provider.replace("-", " ")}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {count}
                      </span>
                    </div>
                  ),
                )}
                {Object.keys(data?.byosConnections.byProvider ?? {}).length ===
                  0 && (
                  <p className="col-span-2 text-sm text-muted-foreground text-center py-4">
                    No BYOS connections yet.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              Connections with errors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : data && data.byosConnections.errorConnections.length > 0 ? (
              data.byosConnections.errorConnections.map((err, i) => (
                <div
                  key={i}
                  className="rounded-md border border-destructive/30 bg-destructive/5 p-3"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/organizations/${err.organizationId}`}
                      className="text-sm font-medium text-foreground hover:text-primary truncate"
                    >
                      {err.name}
                    </Link>
                    <span className="text-[10px] uppercase text-destructive font-mono">
                      {err.provider}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Last check:{" "}
                    {err.lastHealthCheck
                      ? formatRelative(err.lastHealthCheck)
                      : "never"}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                All connections healthy.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TopConsumersTab() {
  const [limit, setLimit] = useState(20);
  const { data, isLoading, error, refetch } = useTopConsumers(limit);

  const columns: Column<TopConsumer>[] = [
    {
      key: "name",
      header: "Organization",
      cell: (c) => (
        <Link
          href={`/organizations/${c._id}`}
          className="font-medium text-foreground hover:text-primary"
        >
          {c.name}
        </Link>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      cell: (c) => <PlanBadge plan={c.plan} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "used",
      header: "Used",
      cell: (c) => (
        <span className="text-xs font-mono text-muted-foreground">
          {formatBytes(c.storageUsed)}
        </span>
      ),
    },
    {
      key: "quota",
      header: "Quota",
      cell: (c) => (
        <span className="text-xs font-mono text-muted-foreground">
          {formatBytes(c.storageQuota)}
        </span>
      ),
    },
    {
      key: "util",
      header: "Utilization",
      cell: (c) => (
        <div className="min-w-[140px]">
          <div className="text-xs text-muted-foreground font-mono">
            {formatPercent(c.utilizationPercent)}
          </div>
          <Progress
            value={Math.min(100, c.utilizationPercent)}
            className="h-1 mt-1"
          />
        </div>
      ),
    },
    {
      key: "byos",
      header: "BYOS",
      cell: (c) => (
        <span className="text-xs text-muted-foreground">
          {c.byosConnectionCount} connection
          {c.byosConnectionCount === 1 ? "" : "s"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Show
          </span>
          <Select
            value={String(limit)}
            onValueChange={(v) => setLimit(Number(v))}
          >
            <SelectTrigger className="h-9 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            rows={data}
            loading={isLoading}
            error={error}
            onRetry={refetch}
            rowKey={(c) => c._id}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ConnectionsTab() {
  const ALL = "__all__";
  const [page, setPage] = useState(1);
  const [provider, setProvider] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [detailId, setDetailId] = useState<string | null>(null);

  const params: ListConnectionsParams = {
    page,
    limit: 20,
    provider:
      provider === ALL
        ? undefined
        : (provider as ListConnectionsParams["provider"]),
    status:
      status === ALL ? undefined : (status as ListConnectionsParams["status"]),
  };

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useStorageConnections(params);

  const columns: Column<AdminStorageConnection>[] = [
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
      key: "org",
      header: "Organization",
      cell: (c) =>
        c.organization ? (
          <Link
            href={`/organizations/${c.organization._id}`}
            className="text-sm text-foreground hover:text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            {c.organization.name}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "health",
      header: "Last check",
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
        <span className="text-xs text-destructive truncate max-w-[200px] inline-block">
          {c.lastError ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 flex flex-wrap items-center gap-2">
            <Select
              value={provider}
              onValueChange={(v) => {
                setProvider(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[160px] text-xs">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All providers</SelectItem>
                <SelectItem value="s3">Amazon S3</SelectItem>
                <SelectItem value="azure">Azure</SelectItem>
                <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                <SelectItem value="google-drive">Google Drive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-[140px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="disconnected">Disconnected</SelectItem>
              </SelectContent>
            </Select>
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
              rowKey={(c) => c._id}
              onRowClick={(c) => setDetailId(c._id)}
              emptyState={
                <div className="py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 mx-auto">
                    <Database className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No connections match these filters.
                  </p>
                </div>
              }
            />
            <PaginationBar
              pagination={data?.pagination}
              onPageChange={setPage}
              loading={isFetching}
              label="connections"
            />
          </CardContent>
        </Card>
      </div>

      <ConnectionDetailDialog
        connectionId={detailId}
        onClose={() => setDetailId(null)}
      />
    </>
  );
}

function InternalTab() {
  const { data, isLoading, error, refetch } = useInternalStorage();

  if (error && !data) {
    return <ErrorCard error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label="Orgs on internal"
          value={formatNumber(data?.summary.organizationCount ?? 0)}
          loading={isLoading}
        />
        <StatCard
          label="Total used"
          value={formatBytes(data?.summary.totalUsed ?? 0)}
          loading={isLoading}
        />
        <StatCard
          label="Total quota"
          value={formatBytes(data?.summary.totalQuota ?? 0)}
          loading={isLoading}
        />
        <StatCard
          label="Utilization"
          value={formatPercent(data?.summary.utilizationPercent ?? 0)}
          loading={isLoading}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Organizations using internal storage
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            loading={isLoading}
            error={error}
            onRetry={refetch}
            rows={data?.organizations}
            rowKey={(o) => o._id}
            columns={[
              {
                key: "name",
                header: "Organization",
                cell: (o) => (
                  <Link
                    href={`/organizations/${o._id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {o.name}
                  </Link>
                ),
              },
              {
                key: "plan",
                header: "Plan",
                cell: (o) => <PlanBadge plan={o.plan} />,
              },
              {
                key: "status",
                header: "Status",
                cell: (o) => <StatusBadge status={o.status} />,
              },
              {
                key: "used",
                header: "Used",
                cell: (o) => (
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatBytes(o.storageUsed)}
                  </span>
                ),
              },
              {
                key: "quota",
                header: "Quota",
                cell: (o) => (
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatBytes(o.storageQuota)}
                  </span>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Top MIME types
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            loading={isLoading}
            error={error}
            onRetry={refetch}
            rows={data?.topMimeTypes}
            rowKey={(m) => m.mimeType}
            columns={[
              {
                key: "mime",
                header: "MIME type",
                cell: (m) => (
                  <span className="font-mono text-xs text-foreground">
                    {m.mimeType}
                  </span>
                ),
              },
              {
                key: "count",
                header: "Files",
                cell: (m) => formatNumber(m.count),
              },
              {
                key: "size",
                header: "Total size",
                cell: (m) => (
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatBytes(m.totalSize)}
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
