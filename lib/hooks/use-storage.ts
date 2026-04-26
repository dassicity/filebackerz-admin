import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getStorageOverview,
  listStorageConnections,
  getStorageConnection,
  triggerConnectionHealthCheck,
  getInternalStorage,
  getTopConsumers,
  type ListConnectionsParams,
} from "@/lib/api/storage";

export function useStorageOverview(topN = 10) {
  return useQuery({
    queryKey: ["admin", "storage", "overview", topN],
    queryFn: async () => (await getStorageOverview({ topN })).data,
  });
}

export function useStorageConnections(params: ListConnectionsParams) {
  return useQuery({
    queryKey: ["admin", "storage", "connections", params],
    queryFn: async () => await listStorageConnections(params),
  });
}

export function useStorageConnection(connectionId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "storage", "connection", connectionId],
    queryFn: async () => {
      if (!connectionId) throw new Error("connectionId required");
      return (await getStorageConnection(connectionId)).data;
    },
    enabled: !!connectionId,
  });
}

export function useInternalStorage() {
  return useQuery({
    queryKey: ["admin", "storage", "internal"],
    queryFn: async () => (await getInternalStorage()).data,
  });
}

export function useTopConsumers(limit = 20) {
  return useQuery({
    queryKey: ["admin", "storage", "top-consumers", limit],
    queryFn: async () => (await getTopConsumers({ limit })).data,
  });
}

export function useTriggerHealthCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (connectionId: string) =>
      triggerConnectionHealthCheck(connectionId),
    onSuccess: (res, connectionId) => {
      toast.success(`Health check: ${res.data.status}`);
      qc.invalidateQueries({ queryKey: ["admin", "storage"] });
      qc.invalidateQueries({
        queryKey: ["admin", "storage", "connection", connectionId],
      });
    },
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.message ??
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ??
        "Health check failed";
      toast.error(message);
    },
  });
}
