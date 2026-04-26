import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPlatformConfig,
  updatePlatformConfig,
  getSystemHealth,
  toggleMaintenanceMode,
  getFeatureFlags,
  updateFeatureFlags,
  type UpdatePlatformConfigBody,
  type ToggleMaintenanceBody,
  type FeatureFlags,
} from "@/lib/api/system";

function errorMessage(err: unknown): string {
  return (
    (err as { response?: { data?: { message?: string; error?: string } } })
      ?.response?.data?.message ??
    (err as { response?: { data?: { error?: string } } })?.response?.data
      ?.error ??
    "Action failed"
  );
}

export function usePlatformConfig() {
  return useQuery({
    queryKey: ["admin", "system", "config"],
    queryFn: async () => (await getPlatformConfig()).data,
  });
}

export function useUpdatePlatformConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdatePlatformConfigBody) =>
      updatePlatformConfig(body),
    onSuccess: () => {
      toast.success("Platform config updated");
      qc.invalidateQueries({ queryKey: ["admin", "system"] });
      qc.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ["admin", "system", "health"],
    queryFn: async () => (await getSystemHealth()).data,
    refetchInterval: 30_000,
  });
}

export function useToggleMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ToggleMaintenanceBody) =>
      toggleMaintenanceMode(body),
    onSuccess: (res) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ["admin", "system"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: ["admin", "system", "feature-flags"],
    queryFn: async () => (await getFeatureFlags()).data,
  });
}

export function useUpdateFeatureFlags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<FeatureFlags>) =>
      updateFeatureFlags(body),
    onSuccess: () => {
      toast.success("Feature flags updated");
      qc.invalidateQueries({ queryKey: ["admin", "system"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}
