"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useGrowth } from "@/lib/hooks/use-dashboard";
import type { Granularity, GrowthData } from "@/lib/api/dashboard";

interface MergedPoint {
  period: string;
  users: number;
  organizations: number;
  files: number;
}

function mergeSeries(data: GrowthData | undefined): MergedPoint[] {
  if (!data) return [];
  const byPeriod = new Map<string, MergedPoint>();
  const ensure = (period: string) => {
    if (!byPeriod.has(period)) {
      byPeriod.set(period, {
        period,
        users: 0,
        organizations: 0,
        files: 0,
      });
    }
    return byPeriod.get(period)!;
  };
  data.users.forEach((p) => {
    ensure(p.period).users = p.count;
  });
  data.organizations.forEach((p) => {
    ensure(p.period).organizations = p.count;
  });
  data.files.forEach((p) => {
    ensure(p.period).files = p.count;
  });
  return Array.from(byPeriod.values()).sort((a, b) =>
    a.period.localeCompare(b.period),
  );
}

const PERIODS_FOR: Record<Granularity, number> = {
  day: 30,
  week: 12,
  month: 12,
};

export function GrowthChart() {
  const [granularity, setGranularity] = useState<Granularity>("week");
  const { data, isLoading } = useGrowth({
    granularity,
    periods: PERIODS_FOR[granularity],
  });

  const merged = useMemo(() => mergeSeries(data), [data]);
  const isEmpty = !isLoading && merged.length === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">Growth</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Signups, organizations, and file uploads over time
          </p>
        </div>
        <Tabs
          value={granularity}
          onValueChange={(v) => setGranularity(v as Granularity)}
        >
          <TabsList className="h-8">
            <TabsTrigger value="day" className="text-xs px-3 py-1">
              Day
            </TabsTrigger>
            <TabsTrigger value="week" className="text-xs px-3 py-1">
              Week
            </TabsTrigger>
            <TabsTrigger value="month" className="text-xs px-3 py-1">
              Month
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-foreground mb-1">
              No activity in this range
            </h3>
            <p className="text-sm text-muted-foreground">
              Try a different granularity.
            </p>
          </div>
        ) : (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={merged}
                margin={{ top: 10, right: 12, left: -8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fill-users" x1="0" y1="0" x2="0" y2="1">
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
                  <linearGradient id="fill-orgs" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--success))"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--success))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="fill-files" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--info))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--info))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    fontSize: 12,
                    color: "hsl(var(--popover-foreground))",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#fill-users)"
                />
                <Area
                  type="monotone"
                  dataKey="organizations"
                  name="Organizations"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  fill="url(#fill-orgs)"
                />
                <Area
                  type="monotone"
                  dataKey="files"
                  name="Files"
                  stroke="hsl(var(--info))"
                  strokeWidth={2}
                  fill="url(#fill-files)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
