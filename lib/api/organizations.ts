import { apiClient } from "./client";
import type { AuditLogEntry, Pagination } from "./dashboard";

export type OrgPlan = "trial" | "paid";
export type OrgStatus =
  | "active"
  | "trial"
  | "expired"
  | "suspended"
  | "deleted";
export type OrgType = "personal" | "team";

export interface OrgSettings {
  allowPublicSharing: boolean;
  requireEmailVerification: boolean;
  sessionTimeout: number;
  maxFileVersions: number;
  allowedDomains: string[];
}

export interface TrashSettings {
  retentionDays: number;
  autoEmptyTrash: boolean;
  allowUserRestore: boolean;
  allowUserPermanentDelete: boolean;
}

export interface OrgStorageConfig {
  defaultConnectionId: string | null;
  allowBYOS: boolean;
  maxConnections: number;
}

export interface AdminListedOrganization {
  _id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  subdomainStatus?: string;
  type: OrgType | string;
  ownerId: string;
  plan: OrgPlan | string;
  storageQuota: number;
  storageUsed: number;
  status: OrgStatus | string;
  settings: OrgSettings;
  trashSettings?: TrashSettings;
  storageConfig?: OrgStorageConfig;
  billing?: {
    stripeCustomerId: string | null;
    subscriptionId: string | null;
    currentPeriodEnd: string | null;
    trialStartedAt?: string | null;
    trialEndsAt?: string | null;
    trialExtendedDays?: number;
    overQuota?: boolean;
    overageAuthorized?: boolean;
  };
  softSeatCap?: number | null;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
}

export interface AdminOrganizationDetail extends AdminListedOrganization {
  customDomain?: string | null;
  customDomainStatus?: string;
  branding?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  computed: {
    memberCount: number;
    fileCount: number;
    folderCount: number;
    activeShareLinks: number;
  };
}

export interface ListOrgsParams {
  page?: number;
  limit?: number;
  search?: string;
  plan?: OrgPlan;
  status?: OrgStatus;
  type?: OrgType;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "name"
    | "storageUsed"
    | "plan"
    | "status";
  sortOrder?: "asc" | "desc";
}

export interface ListOrgsResponse {
  success: true;
  data: AdminListedOrganization[];
  pagination: Pagination;
}

export async function listOrganizations(
  params: ListOrgsParams = {},
): Promise<ListOrgsResponse> {
  const { data } = await apiClient.get<ListOrgsResponse>(
    "/admin/organizations",
    { params },
  );
  return data;
}

export interface GetOrgResponse {
  success: true;
  data: AdminOrganizationDetail;
}

export async function getOrganization(orgId: string): Promise<GetOrgResponse> {
  const { data } = await apiClient.get<GetOrgResponse>(
    `/admin/organizations/${orgId}`,
  );
  return data;
}

export interface OrgMutationResponse {
  success: true;
  data: AdminListedOrganization;
  message?: string;
}

// Values PUT /status accepts from the panel (Oct 2026 contract):
// - "suspended" / "deleted": lock or soft-delete the org (delete cancels the
//   Stripe subscription first).
// - "unsuspend": only for suspended/deleted orgs; the status is restored from
//   billing, so the response's data.status may be active, trial or expired.
// - "expired": "end trial now", only for trial-plan orgs with no subscription
//   or comp (409 CANNOT_EXPIRE otherwise).
// "active" and "trial" are rejected on unlocked orgs (USE_COMP_ENDPOINT /
// USE_TRIAL_ENDPOINT), so the panel never sends them.
export type OrgStatusChange = "suspended" | "deleted" | "unsuspend" | "expired";

export async function updateOrgStatus(
  orgId: string,
  status: OrgStatusChange,
): Promise<OrgMutationResponse> {
  const { data } = await apiClient.put<OrgMutationResponse>(
    `/admin/organizations/${orgId}/status`,
    { status },
  );
  return data;
}

export async function updateOrgPlan(
  orgId: string,
  plan: OrgPlan,
): Promise<OrgMutationResponse> {
  const { data } = await apiClient.put<OrgMutationResponse>(
    `/admin/organizations/${orgId}/plan`,
    { plan },
  );
  return data;
}

export async function updateOrgQuota(
  orgId: string,
  storageQuota: number,
): Promise<OrgMutationResponse> {
  const { data } = await apiClient.put<OrgMutationResponse>(
    `/admin/organizations/${orgId}/quota`,
    { storageQuota },
  );
  return data;
}

export interface ExtendTrialBody {
  extendDays?: number;
  trialEndsAt?: string;
}

// Grants extra free days. `extendDays` counts from the later of now and the
// current end date; an expired org is revived back to trial.
export async function extendOrgTrial(
  orgId: string,
  body: ExtendTrialBody,
): Promise<OrgMutationResponse> {
  const { data } = await apiClient.put<OrgMutationResponse>(
    `/admin/organizations/${orgId}/trial`,
    body,
  );
  return data;
}

// Enabling means the org WILL be charged for storage above its allowance on
// its next invoice.
export async function updateOrgOverage(
  orgId: string,
  authorized: boolean,
): Promise<OrgMutationResponse> {
  const { data } = await apiClient.put<OrgMutationResponse>(
    `/admin/organizations/${orgId}/overage`,
    { authorized },
  );
  return data;
}

// Alert threshold only — never blocks an invite. null restores the platform
// default.
export async function updateOrgSeatCap(
  orgId: string,
  softSeatCap: number | null,
): Promise<OrgMutationResponse> {
  const { data } = await apiClient.put<OrgMutationResponse>(
    `/admin/organizations/${orgId}/seat-cap`,
    { softSeatCap },
  );
  return data;
}

export interface StorageSnapshot {
  organizationId: string;
  date: string;
  bytesUsed: number;
  quotaBytes: number;
  overageBlocks: number;
  plan: string;
}

export interface OrgStorageHistoryResponse {
  success: true;
  data: {
    organization: {
      id: string;
      name: string;
      slug: string;
      plan: string;
      storageQuota: number;
      storageUsed: number;
      periodPeakStorageUsed: number;
    };
    days: number;
    snapshots: StorageSnapshot[];
  };
}

export async function getOrgStorageHistory(
  orgId: string,
  days = 90,
): Promise<OrgStorageHistoryResponse> {
  const { data } = await apiClient.get<OrgStorageHistoryResponse>(
    `/admin/organizations/${orgId}/storage-history`,
    { params: { days } },
  );
  return data;
}

export interface UpdateOrgSettingsBody {
  settings?: Partial<OrgSettings>;
  trashSettings?: Partial<TrashSettings>;
  storageConfig?: Partial<OrgStorageConfig>;
}

export async function updateOrgSettings(
  orgId: string,
  body: UpdateOrgSettingsBody,
): Promise<OrgMutationResponse> {
  const { data } = await apiClient.put<OrgMutationResponse>(
    `/admin/organizations/${orgId}/settings`,
    body,
  );
  return data;
}

export interface OrgMember {
  _id: string;
  organizationId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    status: string;
    authProvider: string;
    lastLogin: string | null;
  } | null;
  email?: string;
  role: "owner" | "admin" | "member" | string;
  status: "active" | "invited" | "suspended" | string;
  joinedAt: string;
  createdAt: string;
  permissions?: {
    canInviteMembers: boolean;
    canManageBilling: boolean;
    canManageSettings: boolean;
  };
}

export interface ListMembersParams {
  page?: number;
  limit?: number;
  status?: "active" | "invited" | "suspended";
  role?: "owner" | "admin" | "member";
}

export interface ListMembersResponse {
  success: true;
  data: OrgMember[];
  pagination: Pagination;
}

export async function getOrgMembers(
  orgId: string,
  params: ListMembersParams = {},
): Promise<ListMembersResponse> {
  const { data } = await apiClient.get<ListMembersResponse>(
    `/admin/organizations/${orgId}/members`,
    { params },
  );
  return data;
}

export interface OrgStorageResponse {
  success: true;
  data: {
    organization: { _id: string; name: string; plan: string };
    storageUsed: number;
    storageQuota: number;
    utilizationPercent: number;
    fileStats: {
      totalSize: number;
      fileCount: number;
      averageSize: number;
    };
    topFilesBySize: Array<{
      _id: string;
      name: string;
      currentVersion: { size: number; mimeType: string };
      createdAt: string;
    }>;
  };
}

export async function getOrgStorage(
  orgId: string,
): Promise<OrgStorageResponse> {
  const { data } = await apiClient.get<OrgStorageResponse>(
    `/admin/organizations/${orgId}/storage`,
  );
  return data;
}

export interface OrgStorageConnection {
  _id: string;
  organizationId: string;
  name: string;
  provider: "s3" | "azure" | "gcs" | "google-drive" | string;
  isDefault: boolean;
  status: "active" | "error" | "testing" | "disconnected" | string;
  config: Record<string, unknown>;
  lastHealthCheck: string | null;
  lastError: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrgStorageConnectionsResponse {
  success: true;
  count: number;
  data: OrgStorageConnection[];
}

export async function getOrgStorageConnections(
  orgId: string,
): Promise<OrgStorageConnectionsResponse> {
  const { data } = await apiClient.get<OrgStorageConnectionsResponse>(
    `/admin/organizations/${orgId}/storage-connections`,
  );
  return data;
}

export interface OrgAuditLogsParams {
  page?: number;
  limit?: number;
  category?: string;
  severity?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrgAuditLogsResponse {
  success: true;
  data: AuditLogEntry[];
  pagination: Pagination;
}

export async function getOrgAuditLogs(
  orgId: string,
  params: OrgAuditLogsParams = {},
): Promise<OrgAuditLogsResponse> {
  const { data } = await apiClient.get<OrgAuditLogsResponse>(
    `/admin/organizations/${orgId}/audit-logs`,
    { params },
  );
  return data;
}

export async function updateOrgSubdomain(
  orgId: string,
  subdomain: string,
): Promise<OrgMutationResponse> {
  const { data } = await apiClient.put<OrgMutationResponse>(
    `/admin/organizations/${orgId}/subdomain`,
    { subdomain },
  );
  return data;
}

export async function deleteOrganization(
  orgId: string,
): Promise<{ success: true; message: string }> {
  const { data } = await apiClient.delete(`/admin/organizations/${orgId}`, {
    data: { confirm: true },
  });
  return data;
}
