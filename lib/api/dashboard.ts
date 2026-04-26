import { apiClient } from "./client";

export interface OverviewData {
  users: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    admins: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    byAuthProvider: Record<string, number>;
  };
  organizations: {
    total: number;
    byPlan: Record<string, number>;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  files: {
    total: number;
    averageSize: number;
    uploadedToday: number;
    uploadedThisWeek: number;
    uploadedThisMonth: number;
    topMimeTypes: Array<{ mimeType: string; count: number }>;
  };
  storage: {
    totalUsed: number;
    totalQuota: number;
    utilizationPercent: number;
    byosConnectionsByProvider: Record<string, number>;
  };
  sharing: {
    activeShareLinks: number;
    totalShareLinkAccesses: number;
    activeFileRequests: number;
  };
  security: {
    total: number;
    twoFaEnabled: number;
    twoFaDisabled: number;
    adoptionPercent: number;
    byMethod: Record<string, number>;
  };
  generatedAt: string;
}

export interface OverviewResponse {
  success: true;
  data: OverviewData;
}

export async function getOverview(): Promise<OverviewResponse> {
  const { data } = await apiClient.get<OverviewResponse>(
    "/admin/dashboard/overview",
  );
  return data;
}

export type Granularity = "day" | "week" | "month";

export interface GrowthPoint {
  period: string;
  count: number;
  totalSize?: number;
}

export interface GrowthData {
  granularity: Granularity;
  periods: number;
  users: GrowthPoint[];
  organizations: GrowthPoint[];
  files: GrowthPoint[];
}

export interface GrowthResponse {
  success: true;
  data: GrowthData;
}

export async function getGrowth(
  params: { granularity?: Granularity; periods?: number } = {},
): Promise<GrowthResponse> {
  const { data } = await apiClient.get<GrowthResponse>(
    "/admin/dashboard/growth",
    { params },
  );
  return data;
}

export interface TopConsumer {
  _id: string;
  name: string;
  plan: string;
  storageQuota: number;
  storageUsed: number;
  utilizationPercent: number;
}

export interface StorageByPlan {
  plan: string;
  orgCount: number;
  totalUsed: number;
  totalQuota: number;
}

export interface ErrorConnection {
  organizationId: string;
  name: string;
  provider: string;
  status: string;
  lastHealthCheck: string | null;
}

export interface StorageBreakdownData {
  topConsumers: TopConsumer[];
  byPlan: StorageByPlan[];
  byosConnections: {
    byProvider: Record<string, number>;
    byStatus: Record<string, number>;
    errorConnections: ErrorConnection[];
  };
}

export interface StorageBreakdownResponse {
  success: true;
  data: StorageBreakdownData;
}

export async function getStorageBreakdown(
  params: { topN?: number } = {},
): Promise<StorageBreakdownResponse> {
  const { data } = await apiClient.get<StorageBreakdownResponse>(
    "/admin/dashboard/storage",
    { params },
  );
  return data;
}

export type AuditSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";
export type AuditCategory =
  | "AUTH"
  | "FILE"
  | "FOLDER"
  | "ORGANIZATION"
  | "PERMISSION"
  | "GROUP"
  | "SETTINGS"
  | "SECURITY"
  | "API"
  | "ACTIVITY"
  | "STORAGE";

export interface AuditLogEntry {
  _id: string;
  eventType: string;
  category: AuditCategory | string;
  severity: AuditSeverity | string;
  action: string;
  userId: string | null;
  userEmail: string | null;
  userName?: string | null;
  organizationId: string | null;
  resourceType: string | null;
  resourceName: string | null;
  status: "success" | "failure" | "partial" | string;
  timestamp: string;
  ipAddress: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ActivityResponse {
  success: true;
  logs: AuditLogEntry[];
  pagination: Pagination;
  summary?: {
    topEventTypes: Array<{ eventType: string; count: number }>;
    statusBreakdown: Record<string, number>;
    failureRate: number;
  };
}

export async function getActivity(
  params: {
    page?: number;
    limit?: number;
    severity?: AuditSeverity;
    category?: AuditCategory;
    startDate?: string;
    endDate?: string;
  } = {},
): Promise<ActivityResponse> {
  const { data } = await apiClient.get<ActivityResponse>(
    "/admin/dashboard/activity",
    { params },
  );
  return data;
}
