import { apiClient } from "./client";

export type PlanTierKey = "trial" | "paid";

export interface PlanTierDefaults {
  storageQuota: number;
  maxConnections: number;
  maxFileVersions: number;
  // Paid-only pricing knobs — absent on the trial tier.
  softSeatCap?: number;
  overageBlockBytes?: number;
  overagePriceCents?: number;
  overageCapBlocks?: number;
}

export type PlanDefaults = Record<PlanTierKey, PlanTierDefaults>;

export interface PlanDistributionEntry {
  plan: string;
  count: number;
  totalStorageUsed: number;
  totalStorageQuota: number;
  statusBreakdown: Record<string, number>;
  defaults: PlanTierDefaults;
}

export interface PlanDistributionResponse {
  success: true;
  data: {
    total: number;
    byPlan: PlanDistributionEntry[];
    trialExpiringSoon: number;
  };
}

export async function getPlanDistribution(): Promise<PlanDistributionResponse> {
  const { data } = await apiClient.get<PlanDistributionResponse>(
    "/admin/plans/distribution",
  );
  return data;
}

export interface PlanDefaultsResponse {
  success: true;
  data: PlanDefaults;
}

export async function getPlanDefaults(): Promise<PlanDefaultsResponse> {
  const { data } = await apiClient.get<PlanDefaultsResponse>(
    "/admin/plans/defaults",
  );
  return data;
}

export type UpdatePlanDefaultsBody = Partial<
  Record<PlanTierKey, Partial<PlanTierDefaults>>
>;

export async function updatePlanDefaults(
  body: UpdatePlanDefaultsBody,
): Promise<PlanDefaultsResponse> {
  const { data } = await apiClient.put<PlanDefaultsResponse>(
    "/admin/plans/defaults",
    body,
  );
  return data;
}

export interface BillingOverviewResponse {
  success: true;
  data: {
    summary: {
      orgsWithStripeCustomer: number;
      orgsWithActiveSubscription: number;
      orgsOnTrial: number;
      trialExpiredUnpaid: number;
      orgsExpired: number;
      orgsOverQuota: number;
      orgsWithOverageAuthorized: number;
      byPlan: Record<string, number>;
    };
    trialsExpiringSoon: {
      within7Days: number;
      within30Days: number;
      organizations: Array<{
        _id: string;
        name: string;
        plan: string;
        trialEndsAt?: string | null;
      }>;
    };
    recentPlanUpgrades: Array<{
      _id: string;
      name: string;
      plan: string;
      updatedAt: string;
    }>;
  };
}

export async function getBillingOverview(): Promise<BillingOverviewResponse> {
  const { data } = await apiClient.get<BillingOverviewResponse>(
    "/admin/billing/overview",
  );
  return data;
}

export interface OverageOrganization {
  organizationId: string;
  name: string;
  slug: string;
  status: string;
  storageUsed: number;
  storageQuota: number;
  periodPeakStorageUsed: number;
  overageBytes: number;
  blocks: number;
  uncappedBlocks: number;
  capReached: boolean;
  overageAuthorized: boolean;
  uploadsBlocked: boolean;
  projectedChargeCents: number;
}

export interface BillingOverageResponse {
  success: true;
  data: {
    pricing: {
      blockBytes: number;
      pricePerBlockCents: number;
      maxBlocks: number;
    };
    summary: {
      organizationsOverQuota: number;
      authorized: number;
      blocked: number;
      projectedRevenueCents: number;
    };
    organizations: OverageOrganization[];
  };
}

export async function getBillingOverage(): Promise<BillingOverageResponse> {
  const { data } = await apiClient.get<BillingOverageResponse>(
    "/admin/billing/overage",
  );
  return data;
}
