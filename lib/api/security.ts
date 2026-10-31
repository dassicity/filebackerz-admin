import { apiClient } from "./client";
import type {
  AuditLogEntry,
  AuditSeverity,
  AuditCategory,
  Pagination,
} from "./dashboard";

export interface CrossOrgAuditParams {
  page?: number;
  limit?: number;
  severity?: AuditSeverity;
  category?: AuditCategory;
  eventType?: string;
  userId?: string;
  orgId?: string;
  status?: "success" | "failure" | "partial";
  startDate?: string;
  endDate?: string;
}

export interface CrossOrgAuditResponse {
  success: true;
  data: AuditLogEntry[];
  pagination: Pagination;
}

export async function getSecurityAuditLogs(
  params: CrossOrgAuditParams = {},
): Promise<CrossOrgAuditResponse> {
  const { data } = await apiClient.get<CrossOrgAuditResponse>(
    "/admin/security/audit-logs",
    { params },
  );
  return data;
}

// Since the Oct 2026 robustness pass the export honours the same filters as
// the list (capped at 10,000 rows), so callers pass the list's current ones.
export interface AuditLogsExportParams
  extends Omit<CrossOrgAuditParams, "page" | "limit"> {
  format: "json" | "csv";
}

// Fetches the export through apiClient so the Bearer token is attached (a
// plain window.open navigation would go out unauthenticated), then hands the
// file to the browser as a download.
export async function downloadAuditLogsExport(
  params: AuditLogsExportParams,
): Promise<void> {
  let response;
  try {
    response = await apiClient.get<Blob>("/admin/security/audit-logs/export", {
      params,
      responseType: "blob",
    });
  } catch (err) {
    // With responseType "blob" the JSON error body arrives as a Blob too;
    // decode it so callers can read `error` / `message` as usual.
    const res = (err as { response?: { data?: unknown } }).response;
    if (res?.data instanceof Blob) {
      try {
        res.data = JSON.parse(await res.data.text());
      } catch {
        res.data = undefined;
      }
    }
    throw err;
  }

  const disposition = String(response.headers["content-disposition"] ?? "");
  const filename =
    /filename="?([^";]+)"?/i.exec(disposition)?.[1] ??
    `audit-logs.${params.format}`;

  const url = URL.createObjectURL(response.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export interface SecurityAlertsResponse {
  success: true;
  count: number;
  data: AuditLogEntry[];
}

export async function getSecurityAlerts(
  params: { limit?: number } = {},
): Promise<SecurityAlertsResponse> {
  const { data } = await apiClient.get<SecurityAlertsResponse>(
    "/admin/security/alerts",
    { params },
  );
  return data;
}

export interface FailedLoginsResponse {
  success: true;
  data: Array<{
    _id: string;
    userId: string | null;
    userEmail: string | null;
    ipAddress: string | null;
    geoLocation: { country: string | null; city: string | null } | null;
    timestamp: string;
    eventType: string;
  }>;
  summary: {
    total: number;
    topIpAddresses: Array<{ _id: string; count: number }>;
    topUsers: Array<{ _id: string; count: number }>;
  };
}

export async function getFailedLogins(
  params: { limit?: number; startDate?: string; endDate?: string } = {},
): Promise<FailedLoginsResponse> {
  const { data } = await apiClient.get<FailedLoginsResponse>(
    "/admin/security/failed-logins",
    { params },
  );
  return data;
}

export interface SecurityAnomaliesResponse {
  success: true;
  data: {
    bruteForceAttempts: Array<{
      ipAddress: string;
      failedAttempts: number;
      targetedUsers: string[];
      windowHours: number;
    }>;
    unusualDownloadVolumes: Array<{
      userId: string;
      userEmail: string;
      organizationId: string;
      date: string;
      downloadCount: number;
    }>;
    currentlyLockedAccounts: Array<{
      _id: string;
      name: string;
      email: string;
      failedLoginAttempts: number;
      lockUntil: string;
      lastLogin: string | null;
    }>;
  };
}

export async function getSecurityAnomalies(
  params: { limit?: number; startDate?: string; endDate?: string } = {},
): Promise<SecurityAnomaliesResponse> {
  const { data } = await apiClient.get<SecurityAnomaliesResponse>(
    "/admin/security/anomalies",
    { params },
  );
  return data;
}

export interface ActiveSessionsResponse {
  success: true;
  data: {
    usersWithActiveSessions: number;
    totalActiveSessions: number;
    byDeviceType: Record<string, number>;
    byOS: Record<string, number>;
  };
}

export async function getActiveSessions(): Promise<ActiveSessionsResponse> {
  const { data } = await apiClient.get<ActiveSessionsResponse>(
    "/admin/security/active-sessions",
  );
  return data;
}

export interface TwoFaStatsResponse {
  success: true;
  data: {
    total: number;
    twoFaEnabled: number;
    twoFaDisabled: number;
    adoptionPercent: number;
    byMethod: Record<string, number>;
    byAuthProvider: Record<string, number>;
    enabledLast30Days: number;
  };
}

export async function getTwoFaStats(): Promise<TwoFaStatsResponse> {
  const { data } = await apiClient.get<TwoFaStatsResponse>(
    "/admin/security/2fa-stats",
  );
  return data;
}
