"use client";

import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { GrowthChart } from "@/components/dashboard/growth-chart";
import { StorageBreakdown } from "@/components/dashboard/storage-breakdown";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

export default function OverviewPage() {
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Overview"
        description="Live snapshot across all organizations, users, and storage."
        actions={
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        }
      />

      <KpiGrid />
      <GrowthChart />
      <StorageBreakdown />
      <ActivityFeed />
    </div>
  );
}
