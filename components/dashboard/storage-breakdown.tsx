"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Database } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useStorageBreakdown } from "@/lib/hooks/use-dashboard";
import { formatBytes, formatNumber } from "@/lib/formatters";

const PROVIDER_LABELS: Record<string, string> = {
  s3: "Amazon S3",
  azure: "Azure Blob",
  gcs: "Google Cloud Storage",
  "google-drive": "Google Drive",
};

const SLICE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--info))",
  "hsl(var(--warning))",
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-success",
  error: "bg-destructive",
  testing: "bg-warning",
  disconnected: "bg-muted-foreground",
};

export function StorageBreakdown() {
  const { data, isLoading } = useStorageBreakdown(5);

  const providerData = Object.entries(
    data?.byosConnections.byProvider ?? {},
  ).map(([key, value]) => ({
    name: PROVIDER_LABELS[key] ?? key,
    value,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* By plan */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Storage by plan</CardTitle>
          <p className="text-xs text-muted-foreground">
            Aggregate usage across pricing tiers
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </>
          ) : data && data.byPlan.length > 0 ? (
            data.byPlan.map((row) => {
              const pct =
                row.totalQuota > 0
                  ? (row.totalUsed / row.totalQuota) * 100
                  : 0;
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
            <EmptyState label="No plan data" />
          )}
        </CardContent>
      </Card>

      {/* BYOS connections */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            BYOS connections
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Bring-your-own-storage integrations by provider
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[180px] w-full" />
          ) : providerData.length === 0 ? (
            <EmptyState label="No BYOS connections yet" />
          ) : (
            <>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={providerData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      strokeWidth={2}
                      stroke="hsl(var(--card))"
                    >
                      {providerData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        fontSize: 12,
                        color: "hsl(var(--popover-foreground))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 justify-center text-xs">
                {providerData.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length],
                      }}
                    />
                    <span className="text-foreground">{p.name}</span>
                    <span className="text-muted-foreground font-mono">
                      {p.value}
                    </span>
                  </div>
                ))}
              </div>
              {data && (
                <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-x-4 gap-y-2 justify-center text-xs text-muted-foreground">
                  {Object.entries(data.byosConnections.byStatus).map(
                    ([status, count]) => (
                      <div key={status} className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${STATUS_COLORS[status] ?? "bg-muted"}`}
                        />
                        <span className="capitalize">{status}</span>
                        <span className="font-mono">{count}</span>
                      </div>
                    ),
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Database className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
