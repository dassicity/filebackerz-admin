"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Save,
  TrendingUp,
  Users,
  Database,
  HardDrive,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PlanBadge } from "@/components/common/status-badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePlanDistribution,
  usePlanDefaults,
  useUpdatePlanDefaults,
  useBillingOverview,
} from "@/lib/hooks/use-plans";
import type { PlanTierDefaults, PlanTierKey } from "@/lib/api/plans";
import { formatBytes, formatNumber, formatRelative } from "@/lib/formatters";

const TIERS: PlanTierKey[] = ["free", "pro", "enterprise"];
const GB = 1024 * 1024 * 1024;

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans & Billing"
        description="Platform-wide plan distribution, quota defaults, and billing overview."
      />
      <Tabs defaultValue="distribution">
        <TabsList>
          <TabsTrigger value="distribution">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            Distribution
          </TabsTrigger>
          <TabsTrigger value="defaults">
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Plan defaults
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="mt-4">
          <DistributionTab />
        </TabsContent>
        <TabsContent value="defaults" className="mt-4">
          <DefaultsTab />
        </TabsContent>
        <TabsContent value="billing" className="mt-4">
          <BillingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DistributionTab() {
  const { data, isLoading } = usePlanDistribution();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Total organizations
            </div>
            <div className="text-3xl font-bold text-foreground mt-1">
              {isLoading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                formatNumber(data?.total ?? 0)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Trials expiring soon
            </div>
            <div className="text-3xl font-bold text-foreground mt-1 flex items-center gap-2">
              {isLoading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <>
                  {formatNumber(data?.trialExpiringSoon ?? 0)}
                  {(data?.trialExpiringSoon ?? 0) > 0 && (
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {isLoading
          ? TIERS.map((t) => (
              <Card key={t}>
                <CardContent className="p-5">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))
          : data?.byPlan.map((tier) => {
              const pct =
                tier.totalStorageQuota > 0
                  ? (tier.totalStorageUsed / tier.totalStorageQuota) * 100
                  : 0;
              return (
                <Card key={tier.plan}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold capitalize">
                        {tier.plan}
                      </CardTitle>
                      <PlanBadge plan={tier.plan} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-3xl font-bold text-foreground">
                        {formatNumber(tier.count)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        organization{tier.count === 1 ? "" : "s"}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-xs text-muted-foreground font-mono">
                        {formatBytes(tier.totalStorageUsed)} /{" "}
                        {formatBytes(tier.totalStorageQuota)}
                      </div>
                      <Progress value={Math.min(100, pct)} className="h-1.5" />
                    </div>

                    {Object.keys(tier.statusBreakdown).length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {Object.entries(tier.statusBreakdown).map(
                          ([status, count]) => (
                            <Badge
                              key={status}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {status}: {count}
                            </Badge>
                          ),
                        )}
                      </div>
                    )}

                    <div className="pt-3 border-t border-border space-y-1.5 text-xs text-muted-foreground">
                      <DefaultLine
                        icon={<HardDrive className="w-3 h-3" />}
                        label="Default quota"
                        value={formatBytes(tier.defaults.storageQuota)}
                      />
                      <DefaultLine
                        icon={<Users className="w-3 h-3" />}
                        label="Max members"
                        value={formatNumber(tier.defaults.maxMembers)}
                      />
                      <DefaultLine
                        icon={<Database className="w-3 h-3" />}
                        label="Max BYOS"
                        value={formatNumber(tier.defaults.maxConnections)}
                      />
                      <DefaultLine
                        icon={<Layers className="w-3 h-3" />}
                        label="Max versions"
                        value={formatNumber(tier.defaults.maxFileVersions)}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </div>
  );
}

function DefaultLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}

type TierForm = {
  storageQuotaGB: string;
  maxMembers: string;
  maxConnections: string;
  maxFileVersions: string;
};

function toForm(t: PlanTierDefaults): TierForm {
  return {
    storageQuotaGB: String(Math.round((t.storageQuota / GB) * 100) / 100),
    maxMembers: String(t.maxMembers),
    maxConnections: String(t.maxConnections),
    maxFileVersions: String(t.maxFileVersions),
  };
}

function fromForm(f: TierForm): PlanTierDefaults {
  return {
    storageQuota: Math.round(Number(f.storageQuotaGB || 0) * GB),
    maxMembers: Number(f.maxMembers || 0),
    maxConnections: Number(f.maxConnections || 0),
    maxFileVersions: Number(f.maxFileVersions || 0),
  };
}

function DefaultsTab() {
  const { data, isLoading } = usePlanDefaults();
  const mutation = useUpdatePlanDefaults();

  const [forms, setForms] = useState<Record<PlanTierKey, TierForm>>({
    free: { storageQuotaGB: "", maxMembers: "", maxConnections: "", maxFileVersions: "" },
    pro: { storageQuotaGB: "", maxMembers: "", maxConnections: "", maxFileVersions: "" },
    enterprise: { storageQuotaGB: "", maxMembers: "", maxConnections: "", maxFileVersions: "" },
  });

  useEffect(() => {
    if (data) {
      setForms({
        free: toForm(data.free),
        pro: toForm(data.pro),
        enterprise: toForm(data.enterprise),
      });
    }
  }, [data]);

  const update = (tier: PlanTierKey, field: keyof TierForm, value: string) => {
    setForms((prev) => ({ ...prev, [tier]: { ...prev[tier], [field]: value } }));
  };

  const save = () => {
    if (!data) return;
    const body: Partial<Record<PlanTierKey, PlanTierDefaults>> = {};
    for (const tier of TIERS) {
      const next = fromForm(forms[tier]);
      const prev = data[tier];
      const changed =
        next.storageQuota !== prev.storageQuota ||
        next.maxMembers !== prev.maxMembers ||
        next.maxConnections !== prev.maxConnections ||
        next.maxFileVersions !== prev.maxFileVersions;
      if (changed) body[tier] = next;
    }
    if (Object.keys(body).length === 0) return;
    mutation.mutate(body);
  };

  const reset = () => {
    if (!data) return;
    setForms({
      free: toForm(data.free),
      pro: toForm(data.pro),
      enterprise: toForm(data.enterprise),
    });
  };

  if (isLoading || !data) {
    return (
      <Card>
        <CardContent className="py-16 flex items-center justify-center">
          <Skeleton className="h-32 w-full max-w-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            These values are applied to new organizations. Existing orgs keep
            their current quotas unless you override them on each org's detail
            page.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {TIERS.map((tier) => (
          <TierCard
            key={tier}
            tier={tier}
            form={forms[tier]}
            onChange={(field, value) => update(tier, field, value)}
          />
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={reset} disabled={mutation.isPending}>
          Reset
        </Button>
        <Button onClick={save} disabled={mutation.isPending}>
          <Save className="w-4 h-4 mr-1.5" />
          {mutation.isPending ? "Saving…" : "Save all changes"}
        </Button>
      </div>
    </div>
  );
}

function TierCard({
  tier,
  form,
  onChange,
}: {
  tier: PlanTierKey;
  form: TierForm;
  onChange: (field: keyof TierForm, value: string) => void;
}) {
  const gb = Number(form.storageQuotaGB);
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold capitalize">
            {tier}
          </CardTitle>
          <PlanBadge plan={tier} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor={`${tier}-quota`}
            className="text-xs text-muted-foreground uppercase tracking-wider"
          >
            Storage quota (GB)
          </Label>
          <Input
            id={`${tier}-quota`}
            type="number"
            min={0}
            step={0.5}
            value={form.storageQuotaGB}
            onChange={(e) => onChange("storageQuotaGB", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {Number.isFinite(gb) && gb > 0
              ? `= ${formatBytes(gb * GB)}`
              : "—"}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={`${tier}-members`}
            className="text-xs text-muted-foreground uppercase tracking-wider"
          >
            Max members
          </Label>
          <Input
            id={`${tier}-members`}
            type="number"
            min={0}
            value={form.maxMembers}
            onChange={(e) => onChange("maxMembers", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={`${tier}-connections`}
            className="text-xs text-muted-foreground uppercase tracking-wider"
          >
            Max BYOS connections
          </Label>
          <Input
            id={`${tier}-connections`}
            type="number"
            min={0}
            value={form.maxConnections}
            onChange={(e) => onChange("maxConnections", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={`${tier}-versions`}
            className="text-xs text-muted-foreground uppercase tracking-wider"
          >
            Max file versions
          </Label>
          <Input
            id={`${tier}-versions`}
            type="number"
            min={0}
            value={form.maxFileVersions}
            onChange={(e) => onChange("maxFileVersions", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function BillingTab() {
  const { data, isLoading } = useBillingOverview();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Stripe customers"
          value={formatNumber(data?.summary.orgsWithStripeCustomer ?? 0)}
          loading={isLoading}
        />
        <StatCard
          label="Active subscriptions"
          value={formatNumber(data?.summary.orgsWithActiveSubscription ?? 0)}
          loading={isLoading}
        />
        <StatCard
          label="On trial"
          value={formatNumber(data?.summary.orgsOnTrial ?? 0)}
          loading={isLoading}
        />
        <StatCard
          label="Expired unpaid"
          value={formatNumber(data?.summary.trialExpiredUnpaid ?? 0)}
          loading={isLoading}
          accent={
            (data?.summary.trialExpiredUnpaid ?? 0) > 0 ? "warning" : undefined
          }
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Plan distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {Object.entries(data?.summary.byPlan ?? {}).map(
                ([plan, count]) => (
                  <div
                    key={plan}
                    className="flex items-center justify-between rounded-md border border-border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <PlanBadge plan={plan} />
                    </div>
                    <span className="text-lg font-bold text-foreground">
                      {count}
                    </span>
                  </div>
                ),
              )}
              {Object.keys(data?.summary.byPlan ?? {}).length === 0 && (
                <p className="col-span-3 text-sm text-muted-foreground text-center py-4">
                  No data.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Trials expiring soon
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading
                ? ""
                : `${data?.trialsExpiringSoon.within7Days ?? 0} within 7 days · ${data?.trialsExpiringSoon.within30Days ?? 0} within 30 days`}
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (data?.trialsExpiringSoon.organizations.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No trials expiring soon.
              </p>
            ) : (
              data?.trialsExpiringSoon.organizations.map((o) => (
                <div
                  key={o._id}
                  className="flex items-center justify-between border-b border-border last:border-b-0 py-2"
                >
                  <Link
                    href={`/organizations/${o._id}`}
                    className="text-sm text-foreground hover:text-primary truncate max-w-[220px]"
                  >
                    {o.name}
                  </Link>
                  <div className="flex items-center gap-2">
                    <PlanBadge plan={o.plan} />
                    {o.trialEndsAt && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelative(o.trialEndsAt)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Recent plan upgrades
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Paid plans updated in the last 30 days
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (data?.recentPlanUpgrades.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent upgrades.
              </p>
            ) : (
              data?.recentPlanUpgrades.map((o) => (
                <div
                  key={o._id}
                  className="flex items-center justify-between border-b border-border last:border-b-0 py-2"
                >
                  <Link
                    href={`/organizations/${o._id}`}
                    className="text-sm text-foreground hover:text-primary truncate max-w-[220px]"
                  >
                    {o.name}
                  </Link>
                  <div className="flex items-center gap-2">
                    <PlanBadge plan={o.plan} />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelative(o.updatedAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
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
  accent,
}: {
  label: string;
  value: string;
  loading?: boolean;
  accent?: "warning";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
        <div
          className={`text-2xl font-bold mt-1 ${accent === "warning" ? "text-warning" : "text-foreground"}`}
        >
          {loading ? <Skeleton className="h-7 w-20" /> : value}
        </div>
      </CardContent>
    </Card>
  );
}
