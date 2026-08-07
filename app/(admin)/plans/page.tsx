"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CreditCard,
  Save,
  TrendingUp,
  TicketPercent,
  Users,
  Database,
  HardDrive,
  Layers,
  AlertTriangle,
  Gauge,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type Column } from "@/components/common/data-table";
import { PlanBadge, StatusBadge } from "@/components/common/status-badges";
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
  useBillingOverage,
} from "@/lib/hooks/use-plans";
import type {
  OverageOrganization,
  PlanTierDefaults,
  PlanTierKey,
  UpdatePlanDefaultsBody,
} from "@/lib/api/plans";
import {
  formatBytes,
  formatCents,
  formatNumber,
  formatRelative,
} from "@/lib/formatters";
import { CouponsTab } from "@/components/billing/coupons-tab";

const TIERS: PlanTierKey[] = ["trial", "paid"];
const GB = 1024 * 1024 * 1024;

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans & Billing"
        description="Plan distribution, pricing knobs, billing overview, storage overage, and coupons."
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
          <TabsTrigger value="overage">
            <Gauge className="w-3.5 h-3.5 mr-1.5" />
            Overage
          </TabsTrigger>
          <TabsTrigger value="coupons">
            <TicketPercent className="w-3.5 h-3.5 mr-1.5" />
            Coupons
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
        <TabsContent value="overage" className="mt-4">
          <OverageTab />
        </TabsContent>
        <TabsContent value="coupons" className="mt-4">
          <CouponsTab />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                        icon={<Database className="w-3 h-3" />}
                        label="Max BYOS"
                        value={formatNumber(tier.defaults.maxConnections)}
                      />
                      <DefaultLine
                        icon={<Layers className="w-3 h-3" />}
                        label="Max versions"
                        value={formatNumber(tier.defaults.maxFileVersions)}
                      />
                      {tier.defaults.softSeatCap != null && (
                        <DefaultLine
                          icon={<Users className="w-3 h-3" />}
                          label="Soft seat cap"
                          value={formatNumber(tier.defaults.softSeatCap)}
                        />
                      )}
                      {tier.defaults.overageBlockBytes != null && (
                        <DefaultLine
                          icon={<Gauge className="w-3 h-3" />}
                          label="Overage block"
                          value={formatBytes(tier.defaults.overageBlockBytes)}
                        />
                      )}
                      {tier.defaults.overagePriceCents != null && (
                        <DefaultLine
                          icon={<CreditCard className="w-3 h-3" />}
                          label="Price per block"
                          value={formatCents(tier.defaults.overagePriceCents)}
                        />
                      )}
                      {tier.defaults.overageCapBlocks != null && (
                        <DefaultLine
                          icon={<AlertTriangle className="w-3 h-3" />}
                          label="Overage cap"
                          value={`${formatNumber(tier.defaults.overageCapBlocks)} blocks`}
                        />
                      )}
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
  maxConnections: string;
  maxFileVersions: string;
  softSeatCap: string;
  overageBlockGB: string;
  overagePriceDollars: string;
  overageCapBlocks: string;
};

const EMPTY_TIER_FORM: TierForm = {
  storageQuotaGB: "",
  maxConnections: "",
  maxFileVersions: "",
  softSeatCap: "",
  overageBlockGB: "",
  overagePriceDollars: "",
  overageCapBlocks: "",
};

function toForm(t: PlanTierDefaults): TierForm {
  return {
    storageQuotaGB: String(Math.round((t.storageQuota / GB) * 100) / 100),
    maxConnections: String(t.maxConnections),
    maxFileVersions: String(t.maxFileVersions),
    softSeatCap: t.softSeatCap != null ? String(t.softSeatCap) : "",
    overageBlockGB:
      t.overageBlockBytes != null
        ? String(Math.round((t.overageBlockBytes / GB) * 100) / 100)
        : "",
    overagePriceDollars:
      t.overagePriceCents != null ? String(t.overagePriceCents / 100) : "",
    overageCapBlocks:
      t.overageCapBlocks != null ? String(t.overageCapBlocks) : "",
  };
}

function fromForm(f: TierForm, tier: PlanTierKey): PlanTierDefaults {
  const next: PlanTierDefaults = {
    storageQuota: Math.round(Number(f.storageQuotaGB || 0) * GB),
    maxConnections: Number(f.maxConnections || 0),
    maxFileVersions: Number(f.maxFileVersions || 0),
  };
  // Overage and seat-cap fields are rejected on trial — only send for paid.
  if (tier === "paid") {
    next.softSeatCap = Number(f.softSeatCap || 0);
    next.overageBlockBytes = Math.round(Number(f.overageBlockGB || 0) * GB);
    next.overagePriceCents = Math.round(
      Number(f.overagePriceDollars || 0) * 100,
    );
    next.overageCapBlocks = Number(f.overageCapBlocks || 0);
  }
  return next;
}

function DefaultsTab() {
  const { data, isLoading } = usePlanDefaults();
  const mutation = useUpdatePlanDefaults();

  const [forms, setForms] = useState<Record<PlanTierKey, TierForm>>({
    trial: EMPTY_TIER_FORM,
    paid: EMPTY_TIER_FORM,
  });

  useEffect(() => {
    if (data) {
      setForms({
        trial: toForm(data.trial),
        paid: toForm(data.paid),
      });
    }
  }, [data]);

  const update = (tier: PlanTierKey, field: keyof TierForm, value: string) => {
    setForms((prev) => ({ ...prev, [tier]: { ...prev[tier], [field]: value } }));
  };

  const save = () => {
    if (!data) return;
    const body: UpdatePlanDefaultsBody = {};
    for (const tier of TIERS) {
      const next = fromForm(forms[tier], tier);
      const prev = data[tier];
      const patch: Partial<PlanTierDefaults> = {};
      if (next.storageQuota !== prev.storageQuota)
        patch.storageQuota = next.storageQuota;
      if (next.maxConnections !== prev.maxConnections)
        patch.maxConnections = next.maxConnections;
      if (next.maxFileVersions !== prev.maxFileVersions)
        patch.maxFileVersions = next.maxFileVersions;
      if (tier === "paid") {
        if (next.softSeatCap !== prev.softSeatCap)
          patch.softSeatCap = next.softSeatCap;
        if (next.overageBlockBytes !== prev.overageBlockBytes)
          patch.overageBlockBytes = next.overageBlockBytes;
        if (next.overagePriceCents !== prev.overagePriceCents)
          patch.overagePriceCents = next.overagePriceCents;
        if (next.overageCapBlocks !== prev.overageCapBlocks)
          patch.overageCapBlocks = next.overageCapBlocks;
      }
      if (Object.keys(patch).length > 0) body[tier] = patch;
    }
    if (Object.keys(body).length === 0) {
      toast.info("No changes to save.");
      return;
    }
    mutation.mutate(body);
  };

  const reset = () => {
    if (!data) return;
    setForms({
      trial: toForm(data.trial),
      paid: toForm(data.paid),
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
            Changes apply to new quota assignments — the next org creation, plan
            change, or subscription event. Existing orgs keep their current
            quota; override one immediately from its detail page. Overage price
            and cap changes take effect on the next invoice. Users are unlimited
            on both plans. Trial <em>length</em> is configured in System Config
            → Config → Global settings.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
  const blockGB = Number(form.overageBlockGB);
  const priceDollars = Number(form.overagePriceDollars);
  const capBlocks = Number(form.overageCapBlocks);
  const maxBillCents =
    Number.isFinite(priceDollars) && Number.isFinite(capBlocks)
      ? Math.round(priceDollars * 100) * capBlocks
      : 0;

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
            Included storage (GB)
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

        {tier === "paid" && (
          <>
            <div className="space-y-1.5 pt-3 border-t border-border">
              <Label
                htmlFor={`${tier}-seat-cap`}
                className="text-xs text-muted-foreground uppercase tracking-wider"
              >
                Soft seat cap
              </Label>
              <Input
                id={`${tier}-seat-cap`}
                type="number"
                min={0}
                value={form.softSeatCap}
                onChange={(e) => onChange("softSeatCap", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Alert threshold only — never blocks an invite.
              </p>
            </div>

            <div className="pt-3 border-t border-border space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                Overage billing
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor={`${tier}-overage-block`}
                  className="text-xs text-muted-foreground uppercase tracking-wider"
                >
                  Overage block size (GB)
                </Label>
                <Input
                  id={`${tier}-overage-block`}
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.overageBlockGB}
                  onChange={(e) => onChange("overageBlockGB", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {Number.isFinite(blockGB) && blockGB > 0
                    ? `= ${formatBytes(blockGB * GB)} billing unit`
                    : "—"}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor={`${tier}-overage-price`}
                  className="text-xs text-muted-foreground uppercase tracking-wider"
                >
                  Price per block (USD)
                </Label>
                <Input
                  id={`${tier}-overage-price`}
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.overagePriceDollars}
                  onChange={(e) =>
                    onChange("overagePriceDollars", e.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {Number.isFinite(priceDollars) && priceDollars > 0
                    ? `= ${formatCents(Math.round(priceDollars * 100))} per block`
                    : "—"}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor={`${tier}-overage-cap`}
                  className="text-xs text-muted-foreground uppercase tracking-wider"
                >
                  Overage cap (blocks per period)
                </Label>
                <Input
                  id={`${tier}-overage-cap`}
                  type="number"
                  min={0}
                  value={form.overageCapBlocks}
                  onChange={(e) => onChange("overageCapBlocks", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {maxBillCents > 0
                    ? `Max overage bill: ${formatCents(maxBillCents)} per period`
                    : "—"}
                </p>
              </div>
            </div>
          </>
        )}
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
          label="Expired"
          value={formatNumber(data?.summary.orgsExpired ?? 0)}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Expired unpaid"
          value={formatNumber(data?.summary.trialExpiredUnpaid ?? 0)}
          loading={isLoading}
          accent={
            (data?.summary.trialExpiredUnpaid ?? 0) > 0
              ? "destructive"
              : undefined
          }
          sub={
            (data?.summary.trialExpiredUnpaid ?? 0) > 0
              ? "Should be 0 — check the expireTrials cron"
              : undefined
          }
        />
        <StatCard
          label="Over quota"
          value={formatNumber(data?.summary.orgsOverQuota ?? 0)}
          loading={isLoading}
          accent={(data?.summary.orgsOverQuota ?? 0) > 0 ? "warning" : undefined}
        />
        <StatCard
          label="Overage authorized"
          value={formatNumber(data?.summary.orgsWithOverageAuthorized ?? 0)}
          loading={isLoading}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                <p className="col-span-2 text-sm text-muted-foreground text-center py-4">
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
              Orgs on the paid plan updated in the last 30 days
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

function OverageTab() {
  const { data, isLoading } = useBillingOverage();

  const columns: Column<OverageOrganization>[] = [
    {
      key: "org",
      header: "Organization",
      cell: (o) => (
        <div className="flex flex-col min-w-0">
          <Link
            href={`/organizations/${o.organizationId}`}
            className="font-medium text-foreground hover:text-primary transition-colors truncate"
          >
            {o.name}
          </Link>
          <span className="text-xs text-muted-foreground truncate">
            {o.slug}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: "usage",
      header: "Used / quota",
      cell: (o) => (
        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
          {formatBytes(o.storageUsed)} / {formatBytes(o.storageQuota)}
        </span>
      ),
    },
    {
      key: "peak",
      header: "Period peak",
      cell: (o) => (
        <span className="text-xs font-mono text-foreground whitespace-nowrap">
          {formatBytes(o.periodPeakStorageUsed)}
        </span>
      ),
    },
    {
      key: "overage",
      header: "Overage",
      cell: (o) => (
        <span className="text-xs font-mono text-destructive whitespace-nowrap">
          +{formatBytes(o.overageBytes)}
        </span>
      ),
    },
    {
      key: "blocks",
      header: "Blocks",
      cell: (o) => (
        <span className="text-xs font-mono whitespace-nowrap">
          {formatNumber(o.blocks)}
          {o.capReached && (
            <Badge
              variant="outline"
              className="ml-1.5 text-[9px] uppercase bg-warning/15 text-warning border-warning/30"
              title={`${formatNumber(o.uncappedBlocks)} blocks before the cap`}
            >
              capped
            </Badge>
          )}
        </span>
      ),
    },
    {
      key: "authorized",
      header: "Authorized",
      cell: (o) =>
        o.overageAuthorized ? (
          <Badge
            variant="outline"
            className="text-[10px] uppercase bg-success/15 text-success border-success/30"
          >
            Yes
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[10px] uppercase bg-muted text-muted-foreground border-border"
          >
            No
          </Badge>
        ),
    },
    {
      key: "uploads",
      header: "Uploads",
      cell: (o) =>
        o.uploadsBlocked ? (
          <Badge
            variant="outline"
            className="text-[10px] uppercase bg-destructive/15 text-destructive border-destructive/30"
          >
            Blocked
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">OK</span>
        ),
    },
    {
      key: "charge",
      header: "Projected charge",
      cell: (o) => (
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
          {formatCents(o.projectedChargeCents)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Orgs over quota"
          value={formatNumber(data?.summary.organizationsOverQuota ?? 0)}
          loading={isLoading}
        />
        <StatCard
          label="Authorized (billable)"
          value={formatNumber(data?.summary.authorized ?? 0)}
          loading={isLoading}
        />
        <StatCard
          label="Uploads blocked"
          value={formatNumber(data?.summary.blocked ?? 0)}
          loading={isLoading}
          accent={(data?.summary.blocked ?? 0) > 0 ? "destructive" : undefined}
          sub={
            (data?.summary.blocked ?? 0) > 0
              ? "Over quota without authorization — worth contacting"
              : undefined
          }
        />
        <StatCard
          label="Projected revenue"
          value={formatCents(data?.summary.projectedRevenueCents ?? 0)}
          loading={isLoading}
        />
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pricing
          </span>
          {isLoading ? (
            <Skeleton className="h-5 w-64" />
          ) : (
            <>
              <span className="text-muted-foreground">
                Block:{" "}
                <span className="font-mono text-foreground">
                  {formatBytes(data?.pricing.blockBytes ?? 0)}
                </span>
              </span>
              <span className="text-muted-foreground">
                Price per block:{" "}
                <span className="font-mono text-foreground">
                  {formatCents(data?.pricing.pricePerBlockCents ?? 0)}
                </span>
              </span>
              <span className="text-muted-foreground">
                Cap:{" "}
                <span className="font-mono text-foreground">
                  {formatNumber(data?.pricing.maxBlocks ?? 0)} blocks (
                  {formatCents(
                    (data?.pricing.maxBlocks ?? 0) *
                      (data?.pricing.pricePerBlockCents ?? 0),
                  )}{" "}
                  max)
                </span>
              </span>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            rows={data?.organizations}
            loading={isLoading}
            rowKey={(o) => o.organizationId}
            emptyState={
              <div className="py-12 text-center">
                <Gauge className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium text-foreground">
                  No organizations over quota
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Charges are computed from the period peak at invoice time —
                  deleting data before the invoice does not avoid them.
                </p>
              </div>
            }
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
  accent,
  sub,
}: {
  label: string;
  value: string;
  loading?: boolean;
  accent?: "warning" | "destructive";
  sub?: string;
}) {
  const accentClass =
    accent === "warning"
      ? "text-warning"
      : accent === "destructive"
        ? "text-destructive"
        : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
        <div className={`text-2xl font-bold mt-1 ${accentClass}`}>
          {loading ? <Skeleton className="h-7 w-20" /> : value}
        </div>
        {sub && !loading && (
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        )}
      </CardContent>
    </Card>
  );
}
