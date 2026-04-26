import { useQuery } from "@tanstack/react-query";
import {
  getOverview,
  getGrowth,
  getStorageBreakdown,
  getActivity,
  type Granularity,
  type AuditSeverity,
  type AuditCategory,
} from "@/lib/api/dashboard";

export function useOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => (await getOverview()).data,
  });
}

export function useGrowth(params: { granularity: Granularity; periods?: number }) {
  return useQuery({
    queryKey: ["admin", "growth", params],
    queryFn: async () => (await getGrowth(params)).data,
  });
}

export function useStorageBreakdown(topN = 5) {
  return useQuery({
    queryKey: ["admin", "storage-breakdown", topN],
    queryFn: async () => (await getStorageBreakdown({ topN })).data,
  });
}

export interface ActivityParams {
  page: number;
  limit: number;
  severity?: AuditSeverity;
  category?: AuditCategory;
}

export function useActivity(params: ActivityParams) {
  return useQuery({
    queryKey: ["admin", "activity", params],
    queryFn: async () => await getActivity(params),
  });
}
