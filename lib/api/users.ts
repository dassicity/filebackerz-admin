import { apiClient } from "./client";
import type { AuditLogEntry, Pagination } from "./dashboard";

export type UserStatus = "active" | "inactive" | "pending";
export type UserRole = "user" | "admin" | "superadmin";
export type AuthProvider = "local" | "google" | "microsoft";

export interface UserDevice {
  deviceId: string;
  browser: string;
  os: string;
  deviceType: string;
  ip: string;
  location: { city: string | null; country: string | null } | null;
  lastActive: string;
  userAgent: string;
}

export interface AdminListedUser {
  _id: string;
  name: string;
  email: string;
  authProvider: AuthProvider | string;
  role: UserRole | string;
  status: UserStatus | string;
  isEmailVerified: boolean;
  lastLogin: string | null;
  failedLoginAttempts: number;
  lockUntil: string | null;
  defaultOrganizationId: string | null;
  twoFactorAuth: { enabled: boolean; method: string };
  devices?: UserDevice[];
  createdAt: string;
  updatedAt: string;
}

export interface UserOrgMembership {
  _id: string;
  organizationId: {
    _id: string;
    name: string;
    slug: string;
    plan: string;
    status: string;
    type: string;
  };
  role: string;
  status: string;
  joinedAt: string;
}

export interface AdminUserDetail extends AdminListedUser {
  organizationMemberships: UserOrgMembership[];
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  role?: UserRole;
  authProvider?: AuthProvider;
  startDate?: string;
  endDate?: string;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "name"
    | "email"
    | "lastLogin"
    | "status";
  sortOrder?: "asc" | "desc";
}

export interface ListUsersResponse {
  success: true;
  data: AdminListedUser[];
  pagination: Pagination;
}

export async function listUsers(
  params: ListUsersParams = {},
): Promise<ListUsersResponse> {
  const { data } = await apiClient.get<ListUsersResponse>("/admin/users", {
    params,
  });
  return data;
}

export interface GetUserResponse {
  success: true;
  data: AdminUserDetail;
}

export async function getUser(userId: string): Promise<GetUserResponse> {
  const { data } = await apiClient.get<GetUserResponse>(
    `/admin/users/${userId}`,
  );
  return data;
}

export interface MutationResponse<T = AdminListedUser> {
  success: true;
  data: T;
  message?: string;
}

export async function updateUserStatus(
  userId: string,
  status: UserStatus,
): Promise<MutationResponse> {
  const { data } = await apiClient.put<MutationResponse>(
    `/admin/users/${userId}/status`,
    { status },
  );
  return data;
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<MutationResponse> {
  const { data } = await apiClient.put<MutationResponse>(
    `/admin/users/${userId}/role`,
    { role },
  );
  return data;
}

export async function forceResetPassword(
  userId: string,
): Promise<{ success: true; message: string }> {
  const { data } = await apiClient.post(
    `/admin/users/${userId}/reset-password`,
  );
  return data;
}

export async function forceVerifyEmail(
  userId: string,
): Promise<MutationResponse> {
  const { data } = await apiClient.post<MutationResponse>(
    `/admin/users/${userId}/verify-email`,
  );
  return data;
}

export async function disableUser2FA(
  userId: string,
): Promise<MutationResponse> {
  const { data } = await apiClient.delete<MutationResponse>(
    `/admin/users/${userId}/2fa`,
  );
  return data;
}

export interface UserSessionsResponse {
  success: true;
  data: {
    userId: string;
    name: string;
    email: string;
    sessionCount: number;
    sessions: UserDevice[];
  };
}

export async function getUserSessions(
  userId: string,
): Promise<UserSessionsResponse> {
  const { data } = await apiClient.get<UserSessionsResponse>(
    `/admin/users/${userId}/sessions`,
  );
  return data;
}

export async function revokeUserSessions(
  userId: string,
): Promise<{ success: true; message: string }> {
  const { data } = await apiClient.delete(`/admin/users/${userId}/sessions`);
  return data;
}

export interface UserOrgsResponse {
  success: true;
  data: {
    user: { _id: string; name: string; email: string };
    organizations: Array<{
      membership: {
        _id: string;
        role: string;
        status: string;
        joinedAt: string;
      };
      organization: {
        _id: string;
        name: string;
        slug: string;
        plan: string;
        status: string;
        type: string;
        storageUsed: number;
        storageQuota: number;
        createdAt: string;
      };
    }>;
  };
}

export async function getUserOrganizations(
  userId: string,
): Promise<UserOrgsResponse> {
  const { data } = await apiClient.get<UserOrgsResponse>(
    `/admin/users/${userId}/organizations`,
  );
  return data;
}

export interface UserAuditLogsParams {
  page?: number;
  limit?: number;
  category?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
}

export interface UserAuditLogsResponse {
  success: true;
  data: AuditLogEntry[];
  pagination: Pagination;
}

export async function getUserAuditLogs(
  userId: string,
  params: UserAuditLogsParams = {},
): Promise<UserAuditLogsResponse> {
  const { data } = await apiClient.get<UserAuditLogsResponse>(
    `/admin/users/${userId}/audit-logs`,
    { params },
  );
  return data;
}
