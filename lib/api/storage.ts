import { apiClient } from "./client";
import type { Pagination } from "./dashboard";

export interface StorageOverviewData {
  topConsumers: Array<{
    _id: string;
    name: string;
    plan: string;
    storageQuota: number;
    storageUsed: number;
    utilizationPercent: number;
  }>;
  byPlan: Array<{
    plan: string;
    orgCount: number;
    totalUsed: number;
    totalQuota: number;
  }>;
  byosConnections: {
    byProvider: Record<string, number>;
    byStatus: Record<string, number>;
    errorConnections: Array<{
      organizationId: string;
      name: string;
      provider: string;
      status: string;
      lastHealthCheck: string | null;
    }>;
  };
}

export interface StorageOverviewResponse {
  success: true;
  data: StorageOverviewData;
}

export async function getStorageOverview(
  params: { topN?: number } = {},
): Promise<StorageOverviewResponse> {
  const { data } = await apiClient.get<StorageOverviewResponse>(
    "/admin/storage/overview",
    { params },
  );
  return data;
}

export interface AdminStorageConnection {
  _id: string;
  organizationId: string;
  name: string;
  provider: "s3" | "azure" | "gcs" | "google-drive" | string;
  isDefault: boolean;
  status: "active" | "error" | "testing" | "disconnected" | string;
  config: Record<string, unknown>;
  lastHealthCheck: string | null;
  lastError: string | null;
  healthCheckInterval?: number;
  description?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  organization?: {
    _id: string;
    name: string;
    slug: string;
    plan: string;
    status?: string;
  };
}

export interface ListConnectionsParams {
  page?: number;
  limit?: number;
  provider?: "s3" | "azure" | "gcs" | "google-drive";
  status?: "active" | "error" | "testing" | "disconnected";
  orgId?: string;
}

export interface ListConnectionsResponse {
  success: true;
  data: AdminStorageConnection[];
  pagination: Pagination;
}

export async function listStorageConnections(
  params: ListConnectionsParams = {},
): Promise<ListConnectionsResponse> {
  const { data } = await apiClient.get<ListConnectionsResponse>(
    "/admin/storage/connections",
    { params },
  );
  return data;
}

export interface GetConnectionResponse {
  success: true;
  data: AdminStorageConnection;
}

export async function getStorageConnection(
  connectionId: string,
): Promise<GetConnectionResponse> {
  const { data } = await apiClient.get<GetConnectionResponse>(
    `/admin/storage/connections/${connectionId}`,
  );
  return data;
}

export interface HealthCheckResponse {
  success: true;
  message: string;
  data: {
    connectionId: string;
    provider: string;
    status: string;
    lastHealthCheck: string;
  };
}

export async function triggerConnectionHealthCheck(
  connectionId: string,
): Promise<HealthCheckResponse> {
  const { data } = await apiClient.post<HealthCheckResponse>(
    `/admin/storage/connections/${connectionId}/health-check`,
  );
  return data;
}

export interface InternalStorageResponse {
  success: true;
  data: {
    summary: {
      organizationCount: number;
      totalUsed: number;
      totalQuota: number;
      utilizationPercent: number;
    };
    organizations: Array<{
      _id: string;
      name: string;
      slug: string;
      plan: string;
      storageUsed: number;
      storageQuota: number;
      status: string;
    }>;
    topMimeTypes: Array<{
      mimeType: string;
      count: number;
      totalSize: number;
    }>;
  };
}

export async function getInternalStorage(): Promise<InternalStorageResponse> {
  const { data } = await apiClient.get<InternalStorageResponse>(
    "/admin/storage/internal",
  );
  return data;
}

export interface TopConsumer {
  _id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  storageUsed: number;
  storageQuota: number;
  utilizationPercent: number;
  byosConnectionCount: number;
}

export interface TopConsumersResponse {
  success: true;
  data: TopConsumer[];
}

export async function getTopConsumers(
  params: { limit?: number } = {},
): Promise<TopConsumersResponse> {
  const { data } = await apiClient.get<TopConsumersResponse>(
    "/admin/storage/top-consumers",
    { params },
  );
  return data;
}
