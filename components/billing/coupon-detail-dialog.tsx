"use client";

import { Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/common/error-state";
import { useCoupon } from "@/lib/hooks/use-coupons";
import { formatNumber, formatRelative } from "@/lib/formatters";
import { CouponActions } from "./coupon-actions";
import {
  CouponStatusBadge,
  couponDiscountLabel,
  couponDurationLabel,
} from "./coupon-status-badge";

interface Props {
  couponId: string | null;
  onClose: () => void;
}

export function CouponDetailDialog({ couponId, onClose }: Props) {
  const open = !!couponId;
  const { data, isLoading, error, refetch } = useCoupon(couponId ?? undefined);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            {data?.code ?? "Coupon"}
            {data?.isFoundingPromo && (
              <Badge
                variant="outline"
                className="text-[10px] uppercase bg-primary/15 text-primary border-primary/30"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Founding promo
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>{data?.name ?? "—"}</DialogDescription>
        </DialogHeader>

        {error && !data ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading || !data ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto scrollbar-thin pr-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Status">
                <CouponStatusBadge coupon={data} />
              </Field>
              <Field label="Discount">
                <span className="text-sm font-semibold">
                  {couponDiscountLabel(data)}
                </span>
              </Field>
              <Field label="Duration">
                <span className="text-xs capitalize">
                  {couponDurationLabel(data)}
                </span>
              </Field>
              <Field label="Redemptions">
                <span className="text-sm font-mono">
                  {formatNumber(data.timesRedeemed)} /{" "}
                  {data.maxRedemptions != null
                    ? formatNumber(data.maxRedemptions)
                    : "∞"}
                </span>
              </Field>
              <Field label="Expires">
                <span className="text-xs text-muted-foreground">
                  {data.expiresAt ? formatRelative(data.expiresAt) : "Never"}
                </span>
              </Field>
              <Field label="Created">
                <span className="text-xs text-muted-foreground">
                  {formatRelative(data.createdAt)}
                </span>
              </Field>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Applies to
              </div>
              <div className="flex flex-wrap gap-1">
                {data.appliesToTiers.length === 0 ? (
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    All plans
                  </Badge>
                ) : (
                  data.appliesToTiers.map((tier) => (
                    <Badge
                      key={tier}
                      variant="secondary"
                      className="text-[10px] uppercase"
                    >
                      {tier}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Stripe coupon ID
              </div>
              <div className="rounded-md border border-border bg-muted/40 p-2 text-xs font-mono text-foreground break-all">
                {data.stripeCouponId}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Stripe promotion code ID
              </div>
              <div className="rounded-md border border-border bg-muted/40 p-2 text-xs font-mono text-foreground break-all">
                {data.stripePromotionCodeId}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {data && <CouponActions coupon={data} onDeleted={onClose} />}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}
