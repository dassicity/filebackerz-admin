import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AdminCoupon } from "@/lib/api/coupons";
import { formatCents } from "@/lib/formatters";

export function couponDiscountLabel(coupon: AdminCoupon): string {
  if (coupon.percentOff != null) return `${coupon.percentOff}%`;
  if (coupon.amountOff != null) {
    return `${formatCents(coupon.amountOff, coupon.currency)} ${coupon.currency.toUpperCase()}`;
  }
  return "—";
}

export function couponDurationLabel(coupon: AdminCoupon): string {
  if (coupon.duration === "repeating") {
    return `repeating · ${coupon.durationInMonths ?? "?"} mo`;
  }
  return coupon.duration;
}

export type CouponStatus = "active" | "inactive" | "expired" | "exhausted";

export function couponStatus(coupon: AdminCoupon): CouponStatus {
  if (!coupon.active) return "inactive";
  if (coupon.expiresAt && Date.parse(coupon.expiresAt) < Date.now()) {
    return "expired";
  }
  if (
    coupon.maxRedemptions != null &&
    coupon.timesRedeemed >= coupon.maxRedemptions
  ) {
    return "exhausted";
  }
  return "active";
}

function statusClass(status: CouponStatus): string {
  switch (status) {
    case "active":
      return "bg-success/15 text-success border-success/30";
    case "inactive":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "expired":
      return "bg-warning/15 text-warning border-warning/30";
    case "exhausted":
      return "bg-muted text-muted-foreground border-border";
  }
}

export function CouponStatusBadge({ coupon }: { coupon: AdminCoupon }) {
  const status = couponStatus(coupon);
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] uppercase", statusClass(status))}
    >
      {status}
    </Badge>
  );
}
