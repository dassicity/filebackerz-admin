"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCoupon } from "@/lib/hooks/use-coupons";
import {
  couponFormSchema,
  toCreateCouponBody,
  type CouponFormData,
} from "@/lib/validations/coupons";
import { formatCents } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface CreateCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULTS: CouponFormData = {
  code: "",
  name: "",
  discountType: "percent",
  percentOff: "",
  amountOffDollars: "",
  currency: "usd",
  duration: "once",
  durationInMonths: "",
  maxRedemptions: "",
  expiresAt: "",
  isFoundingPromo: false,
};

export function CreateCouponDialog({
  open,
  onOpenChange,
}: CreateCouponDialogProps) {
  const create = useCreateCoupon();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponFormSchema),
    mode: "onBlur",
    defaultValues: DEFAULTS,
  });

  const discountType = watch("discountType");
  const duration = watch("duration");
  const amountDollars = Number(watch("amountOffDollars"));

  const close = (o: boolean) => {
    if (!o) reset(DEFAULTS);
    onOpenChange(o);
  };

  const onSubmit = (values: CouponFormData) => {
    create.mutate(toCreateCouponBody(values), {
      onSuccess: () => close(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create coupon</DialogTitle>
          <DialogDescription>
            The coupon is created in Stripe and mirrored locally.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5 py-2 max-h-[60vh] overflow-y-auto scrollbar-thin pr-2">
            {/* Code + name */}
            <div className="space-y-2">
              <Label htmlFor="coupon-code" className="text-xs text-muted-foreground uppercase tracking-wider">
                Code
              </Label>
              <Controller
                control={control}
                name="code"
                render={({ field }) => (
                  <Input
                    id="coupon-code"
                    placeholder="FOUNDING50"
                    autoComplete="off"
                    className={cn(
                      "font-mono",
                      errors.code &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                    onBlur={field.onBlur}
                  />
                )}
              />
              {errors.code && (
                <p className="text-xs text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon-name" className="text-xs text-muted-foreground uppercase tracking-wider">
                Name (optional)
              </Label>
              <Input
                id="coupon-name"
                placeholder="Founding Member 50%"
                autoComplete="off"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Discount
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Percentage off</SelectItem>
                        <SelectItem value="amount">Fixed amount off</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {discountType === "percent" ? (
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      placeholder="50"
                      className={cn(
                        "pr-8",
                        errors.percentOff &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                      {...register("percentOff")}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      type="number"
                      min={0.01}
                      step={0.01}
                      placeholder="5.00"
                      className={cn(
                        "pr-12",
                        errors.amountOffDollars &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                      {...register("amountOffDollars")}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground uppercase">
                      usd
                    </span>
                  </div>
                )}
              </div>
              {discountType === "amount" && (
                <p className="text-xs text-muted-foreground">
                  {Number.isFinite(amountDollars) && amountDollars > 0
                    ? `= ${formatCents(Math.round(amountDollars * 100))} off`
                    : "Amount in US dollars"}
                </p>
              )}
              {errors.percentOff && discountType === "percent" && (
                <p className="text-xs text-destructive">
                  {errors.percentOff.message}
                </p>
              )}
              {errors.amountOffDollars && discountType === "amount" && (
                <p className="text-xs text-destructive">
                  {errors.amountOffDollars.message}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Duration
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Controller
                  control={control}
                  name="duration"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Once</SelectItem>
                        <SelectItem value="repeating">Repeating</SelectItem>
                        <SelectItem value="forever">Forever</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {duration === "repeating" && (
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      placeholder="12"
                      className={cn(
                        "pr-16",
                        errors.durationInMonths &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                      {...register("durationInMonths")}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      months
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                How long the discount applies to a subscription.
              </p>
              {errors.durationInMonths && duration === "repeating" && (
                <p className="text-xs text-destructive">
                  {errors.durationInMonths.message}
                </p>
              )}
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="coupon-max" className="text-xs text-muted-foreground uppercase tracking-wider">
                  Max redemptions
                </Label>
                <Input
                  id="coupon-max"
                  type="number"
                  min={1}
                  placeholder="Unlimited"
                  className={cn(
                    errors.maxRedemptions &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  {...register("maxRedemptions")}
                />
                {errors.maxRedemptions ? (
                  <p className="text-xs text-destructive">
                    {errors.maxRedemptions.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Leave blank for unlimited.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-expires" className="text-xs text-muted-foreground uppercase tracking-wider">
                  Expires at
                </Label>
                <Input
                  id="coupon-expires"
                  type="datetime-local"
                  className={cn(
                    errors.expiresAt &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  {...register("expiresAt")}
                />
                {errors.expiresAt ? (
                  <p className="text-xs text-destructive">
                    {errors.expiresAt.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Leave blank for no expiry.
                  </p>
                )}
              </div>
            </div>

            {/* Founding promo */}
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <Label htmlFor="coupon-founding" className="text-sm font-medium">
                  Founding promo
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mark this coupon as part of the founding-member promotion.
                </p>
              </div>
              <Controller
                control={control}
                name="isFoundingPromo"
                render={({ field }) => (
                  <Switch
                    id="coupon-founding"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => close(false)}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
