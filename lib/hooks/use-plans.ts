import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPlanDistribution,
  getPlanDefaults,
  updatePlanDefaults,
  getBillingOverview,
  getBillingOverage,
  type UpdatePlanDefaultsBody,
} from "@/lib/api/plans";

export function usePlanDistribution() {
  return useQuery({
    queryKey: ["admin", "plans", "distribution"],
    queryFn: async () => (await getPlanDistribution()).data,
  });
}

export function usePlanDefaults() {
  return useQuery({
    queryKey: ["admin", "plans", "defaults"],
    queryFn: async () => (await getPlanDefaults()).data,
  });
}

export function useUpdatePlanDefaults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdatePlanDefaultsBody) =>
      updatePlanDefaults(body),
    onSuccess: () => {
      toast.success("Plan defaults updated");
      qc.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.message ??
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ??
        "Failed to update plan defaults";
      toast.error(message);
    },
  });
}

export function useBillingOverview() {
  return useQuery({
    queryKey: ["admin", "billing", "overview"],
    queryFn: async () => (await getBillingOverview()).data,
  });
}

export function useBillingOverage() {
  return useQuery({
    queryKey: ["admin", "billing", "overage"],
    queryFn: async () => (await getBillingOverage()).data,
  });
}
