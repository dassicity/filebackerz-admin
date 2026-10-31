"use client";

import {
  Users,
  Building2,
  FileText,
  HardDrive,
  Link2,
  ShieldCheck,
} from "lucide-react";
import { KpiCard } from "./kpi-card";
import { ErrorCard } from "@/components/common/error-state";
import { useOverview } from "@/lib/hooks/use-dashboard";
import { formatBytes, formatNumber, formatPercent } from "@/lib/formatters";

export function KpiGrid() {
  const { data, isLoading, error, refetch } = useOverview();

  const paidOrgs = data?.organizations.byPlan.paid ?? 0;

  if (error && !data) {
    return (
      <ErrorCard
        error={error}
        onRetry={refetch}
        title="Couldn't load platform KPIs"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <KpiCard
        label="Users"
        icon={Users}
        accent="primary"
        loading={isLoading}
        value={formatNumber(data?.users.total ?? 0)}
        sub={
          data
            ? `${formatNumber(data.users.active)} active · ${formatNumber(data.users.newThisWeek)} new this week`
            : null
        }
      />

      <KpiCard
        label="Organizations"
        icon={Building2}
        accent="success"
        loading={isLoading}
        value={formatNumber(data?.organizations.total ?? 0)}
        sub={
          data
            ? `${formatNumber(paidOrgs)} paid · ${formatNumber(data.organizations.byType.team ?? 0)} teams`
            : null
        }
      />

      <KpiCard
        label="Files"
        icon={FileText}
        accent="info"
        loading={isLoading}
        value={formatNumber(data?.files.total ?? 0)}
        sub={
          data
            ? `${formatNumber(data.files.uploadedThisWeek)} uploaded this week`
            : null
        }
      />

      <KpiCard
        label="Storage used"
        icon={HardDrive}
        accent="warning"
        loading={isLoading}
        value={formatBytes(data?.storage.totalUsed ?? 0)}
        sub={
          data
            ? `${formatPercent(data.storage.utilizationPercent)} of ${formatBytes(data.storage.totalQuota)}`
            : null
        }
        progress={data?.storage.utilizationPercent}
      />

      <KpiCard
        label="Active share links"
        icon={Link2}
        accent="primary"
        loading={isLoading}
        value={formatNumber(data?.sharing.activeShareLinks ?? 0)}
        sub={
          data
            ? `${formatNumber(data.sharing.totalShareLinkAccesses)} accesses · ${formatNumber(data.sharing.activeFileRequests)} file requests`
            : null
        }
      />

      <KpiCard
        label="2FA adoption"
        icon={ShieldCheck}
        accent="success"
        loading={isLoading}
        value={formatPercent(data?.security.adoptionPercent ?? 0)}
        sub={
          data
            ? `${formatNumber(data.security.twoFaEnabled)} of ${formatNumber(data.security.total)} users`
            : null
        }
        progress={data?.security.adoptionPercent}
      />
    </div>
  );
}
