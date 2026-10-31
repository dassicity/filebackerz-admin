import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getSecurityAuditLogs,
  getSecurityAlerts,
  getFailedLogins,
  getSecurityAnomalies,
  getActiveSessions,
  getTwoFaStats,
  downloadAuditLogsExport,
  type AuditLogsExportParams,
  type CrossOrgAuditParams,
} from "@/lib/api/security";
import { getApiErrorMessage } from "@/lib/api/errors";

export function useSecurityAuditLogs(params: CrossOrgAuditParams) {
  return useQuery({
    queryKey: ["admin", "security", "audit-logs", params],
    queryFn: async () => await getSecurityAuditLogs(params),
  });
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: async (params: AuditLogsExportParams) =>
      downloadAuditLogsExport(params),
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to export audit logs")),
  });
}

export function useSecurityAlerts(limit = 50) {
  return useQuery({
    queryKey: ["admin", "security", "alerts", limit],
    queryFn: async () => (await getSecurityAlerts({ limit })).data,
  });
}

export function useFailedLogins(limit = 100) {
  return useQuery({
    queryKey: ["admin", "security", "failed-logins", limit],
    queryFn: async () => await getFailedLogins({ limit }),
  });
}

export function useSecurityAnomalies() {
  return useQuery({
    queryKey: ["admin", "security", "anomalies"],
    queryFn: async () => (await getSecurityAnomalies()).data,
  });
}

export function useActiveSessionsStats() {
  return useQuery({
    queryKey: ["admin", "security", "active-sessions"],
    queryFn: async () => (await getActiveSessions()).data,
  });
}

export function useTwoFaStats() {
  return useQuery({
    queryKey: ["admin", "security", "2fa-stats"],
    queryFn: async () => (await getTwoFaStats()).data,
  });
}
