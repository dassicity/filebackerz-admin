"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useToggleCouponActive,
  useDeleteCoupon,
} from "@/lib/hooks/use-coupons";
import type { AdminCoupon } from "@/lib/api/coupons";
import { formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface CouponActionsProps {
  coupon: AdminCoupon;
  onDeleted?: () => void;
}

export function CouponActions({ coupon, onDeleted }: CouponActionsProps) {
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const toggle = useToggleCouponActive();
  const del = useDeleteCoupon();

  const activate = () => toggle.mutate({ id: coupon._id, active: true });
  const deactivate = () => toggle.mutate({ id: coupon._id, active: false });

  const submitDelete = () => {
    if (deleteConfirm !== coupon.code) return;
    del.mutate(coupon._id, { onSuccess: () => onDeleted?.() });
  };

  return (
    <>
      {coupon.active ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={toggle.isPending}>
              {toggle.isPending ? "Deactivating…" : "Deactivate"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Deactivate coupon {coupon.code}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Customers will no longer be able to redeem this code. You can
                reactivate it later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={deactivate}
                disabled={toggle.isPending}
              >
                {toggle.isPending ? "Deactivating…" : "Deactivate"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button variant="outline" onClick={activate} disabled={toggle.isPending}>
          {toggle.isPending ? "Activating…" : "Activate"}
        </Button>
      )}

      <AlertDialog
        onOpenChange={(o) => {
          if (o) setDeleteConfirm("");
        }}
      >
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Permanently delete {coupon.code}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the coupon and its underlying Stripe
              coupon and promotion code. Customers can no longer redeem it.
              Discounts already applied to subscriptions are not affected.{" "}
              {coupon.timesRedeemed > 0 && (
                <span className="text-warning font-medium">
                  This coupon has been redeemed{" "}
                  {formatNumber(coupon.timesRedeemed)} time
                  {coupon.timesRedeemed === 1 ? "" : "s"}.{" "}
                </span>
              )}
              <span className="text-destructive font-medium">
                This cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label
              htmlFor="coupon-delete-confirm"
              className="text-xs text-muted-foreground"
            >
              Type{" "}
              <span className="font-mono text-foreground">{coupon.code}</span>{" "}
              to confirm
            </Label>
            <Input
              id="coupon-delete-confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={submitDelete}
              disabled={del.isPending || deleteConfirm !== coupon.code}
            >
              {del.isPending ? "Deleting…" : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
