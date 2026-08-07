import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listCoupons,
  getCoupon,
  createCoupon,
  updateCouponActive,
  deleteCoupon,
  type CreateCouponBody,
  type ListCouponsParams,
} from "@/lib/api/coupons";

function extractError(err: unknown, fallback: string): string {
  const e = err as {
    response?: { data?: { message?: string; error?: string } };
  };
  return e?.response?.data?.message ?? e?.response?.data?.error ?? fallback;
}

export function useCoupons(params: ListCouponsParams) {
  return useQuery({
    queryKey: ["admin", "coupons", "list", params],
    queryFn: async () => (await listCoupons(params)).data,
  });
}

export function useCoupon(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "coupons", "detail", id],
    queryFn: async () => (await getCoupon(id!)).data,
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateCouponBody) => createCoupon(body),
    onSuccess: () => {
      toast.success("Coupon created");
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (err) => {
      toast.error(extractError(err, "Failed to create coupon"));
    },
  });
}

export function useToggleCouponActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) =>
      updateCouponActive(id, active),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.active ? "Coupon activated" : "Coupon deactivated",
      );
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (err) => {
      toast.error(extractError(err, "Failed to update coupon"));
    },
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteCoupon(id),
    onSuccess: () => {
      toast.success("Coupon deleted");
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (err) => {
      toast.error(extractError(err, "Failed to delete coupon"));
    },
  });
}
