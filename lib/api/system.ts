import { apiClient } from "./client";
import type { PlanDefaults } from "./plans";

export interface GlobalSettings {
  maxUploadSize: number;
  defaultTrashRetention: number;
  trialDays: number;
  signupEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export interface FeatureFlags {
  byosEnabled: boolean;
  fileRequestsEnabled: boolean;
  customDomainsEnabled: boolean;
  twoFactorRequired: boolean;
  googleOAuthEnabled: boolean;
  microsoftOAuthEnabled: boolean;
  auditLogsEnabled: boolean;
  shareLinkEnabled: boolean;
}

export interface EmailSettings {
  fromName: string;
  fromEmail: string;
  sendWelcomeEmail: boolean;
  sendPasswordResetEmail: boolean;
  sendInvitationEmail: boolean;
  sendShareNotificationEmail: boolean;
}

export interface SecuritySettings {
  maxFailedLogins: number;
  lockoutDuration: number;
  sessionTimeout: number;
  passwordMinLength: number;
  requireEmailVerification: boolean;
  ipBlocklist: string[];
  allowedCorsOrigins: string[];
}

export interface PlatformConfig {
  _id: string;
  planDefaults: PlanDefaults;
  globalSettings: GlobalSettings;
  featureFlags: FeatureFlags;
  emailSettings: EmailSettings;
  securitySettings: SecuritySettings;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformConfigResponse {
  success: true;
  data: PlatformConfig;
}

export async function getPlatformConfig(): Promise<PlatformConfigResponse> {
  const { data } = await apiClient.get<PlatformConfigResponse>(
    "/admin/system/config",
  );
  return data;
}

export interface UpdatePlatformConfigBody {
  planDefaults?: Partial<PlanDefaults>;
  globalSettings?: Partial<GlobalSettings>;
  featureFlags?: Partial<FeatureFlags>;
  emailSettings?: Partial<EmailSettings>;
  securitySettings?: Partial<SecuritySettings>;
}

export async function updatePlatformConfig(
  body: UpdatePlatformConfigBody,
): Promise<PlatformConfigResponse> {
  const { data } = await apiClient.put<PlatformConfigResponse>(
    "/admin/system/config",
    body,
  );
  return data;
}

export type ServiceStatus = "ok" | "error" | "unconfigured";

export interface SystemHealthResponse {
  success: boolean;
  data: {
    overall: "healthy" | "degraded" | string;
    checkedAt: string;
    services: {
      database: {
        status: ServiceStatus;
        latencyMs?: number;
        error?: string;
        message?: string;
      };
      storage: {
        status: ServiceStatus;
        latencyMs?: number;
        bucket?: string;
        error?: string;
        message?: string;
      };
      email: {
        status: ServiceStatus;
        latencyMs?: number;
        error?: string;
        message?: string;
      };
    };
  };
}

export async function getSystemHealth(): Promise<SystemHealthResponse> {
  const { data } = await apiClient.get<SystemHealthResponse>(
    "/admin/system/health",
    // 503 is a valid signal for "degraded" — don't throw on it
    { validateStatus: (status) => status < 600 },
  );
  return data;
}

export interface ToggleMaintenanceBody {
  enabled: boolean;
  message?: string;
}

export interface ToggleMaintenanceResponse {
  success: true;
  message: string;
  data: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
}

export async function toggleMaintenanceMode(
  body: ToggleMaintenanceBody,
): Promise<ToggleMaintenanceResponse> {
  const { data } = await apiClient.post<ToggleMaintenanceResponse>(
    "/admin/system/maintenance",
    body,
  );
  return data;
}

export interface FeatureFlagsResponse {
  success: true;
  data: FeatureFlags;
}

export async function getFeatureFlags(): Promise<FeatureFlagsResponse> {
  const { data } = await apiClient.get<FeatureFlagsResponse>(
    "/admin/system/feature-flags",
  );
  return data;
}

export async function updateFeatureFlags(
  body: Partial<FeatureFlags>,
): Promise<FeatureFlagsResponse> {
  const { data } = await apiClient.put<FeatureFlagsResponse>(
    "/admin/system/feature-flags",
    body,
  );
  return data;
}
