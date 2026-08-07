import { apiClient } from "./client";

// With a single paid plan, "paid" is the only valid tier. An empty
// appliesToTiers array means the coupon applies to everything.
export type CouponTier = "paid";

export type CouponDuration = "once" | "repeating" | "forever";

export interface AdminCoupon {
  _id: string;
  code: string;
  name: string | null;
  percentOff: number | null;
  amountOff: number | null; // cents
  currency: string;
  duration: CouponDuration | string;
  durationInMonths: number | null;
  appliesToTiers: CouponTier[]; // [] = all plans
  maxRedemptions: number | null;
  timesRedeemed: number;
  expiresAt: string | null;
  active: boolean;
  isFoundingPromo: boolean;
  stripeCouponId: string;
  stripePromotionCodeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListCouponsParams {
  active?: "true" | "false";
  tier?: CouponTier;
}

export interface CouponListResponse {
  success: true;
  count: number;
  data: AdminCoupon[];
}

export interface CouponResponse {
  success: true;
  data: AdminCoupon;
}

export async function listCoupons(
  params: ListCouponsParams,
): Promise<CouponListResponse> {
  const { data } = await apiClient.get<CouponListResponse>("/admin/coupons", {
    params,
  });
  return data;
}

export async function getCoupon(id: string): Promise<CouponResponse> {
  const { data } = await apiClient.get<CouponResponse>(`/admin/coupons/${id}`);
  return data;
}

export interface CreateCouponBody {
  code: string;
  name?: string;
  percentOff?: number;
  amountOff?: number; // cents
  currency?: string;
  duration: CouponDuration;
  durationInMonths?: number;
  appliesToTiers: CouponTier[];
  maxRedemptions?: number;
  expiresAt?: string;
  isFoundingPromo?: boolean;
}

export async function createCoupon(
  body: CreateCouponBody,
): Promise<CouponResponse> {
  const { data } = await apiClient.post<CouponResponse>("/admin/coupons", body);
  return data;
}

export async function updateCouponActive(
  id: string,
  active: boolean,
): Promise<CouponResponse> {
  const { data } = await apiClient.put<CouponResponse>(
    `/admin/coupons/${id}`,
    { active },
  );
  return data;
}

export async function deleteCoupon(
  id: string,
): Promise<{ success: true; message: string }> {
  const { data } = await apiClient.delete<{ success: true; message: string }>(
    `/admin/coupons/${id}`,
  );
  return data;
}
