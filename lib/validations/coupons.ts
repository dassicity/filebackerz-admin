import { z } from "zod";
import type { CreateCouponBody } from "@/lib/api/coupons";

export const couponFormSchema = z
  .object({
    // Backend rule: trimmed and upper-cased, then ^[A-Z0-9]{3,40}$.
    code: z
      .string()
      .min(1, "Code is required")
      .refine(
        (s) => /^[A-Za-z0-9]{3,40}$/.test(s.trim()),
        "3–40 letters and numbers only",
      ),
    name: z.string().max(40, "Name must be 40 characters or fewer").optional(),
    discountType: z.enum(["percent", "amount"]),
    percentOff: z.string().optional(),
    amountOffDollars: z.string().optional(),
    currency: z.string(),
    duration: z.enum(["once", "repeating", "forever"]),
    durationInMonths: z.string().optional(),
    maxRedemptions: z.string().optional(),
    expiresAt: z.string().optional(),
    isFoundingPromo: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.discountType === "percent") {
      const n = Number(v.percentOff);
      if (!v.percentOff || !Number.isFinite(n) || n <= 0 || n > 100) {
        ctx.addIssue({
          code: "custom",
          path: ["percentOff"],
          message: "Enter a percentage above 0 and up to 100",
        });
      }
    } else {
      // Sent as a positive whole number of cents.
      const n = Number(v.amountOffDollars);
      if (
        !v.amountOffDollars ||
        !Number.isFinite(n) ||
        n < 0.01 ||
        !/^\d*(\.\d{1,2})?$/.test(v.amountOffDollars.trim())
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["amountOffDollars"],
          message: "Enter an amount of at least 0.01, in whole cents",
        });
      }
    }

    if (v.duration === "repeating") {
      const n = Number(v.durationInMonths);
      if (!v.durationInMonths || !Number.isInteger(n) || n < 1 || n > 120) {
        ctx.addIssue({
          code: "custom",
          path: ["durationInMonths"],
          message: "Enter 1–120 months for repeating coupons",
        });
      }
    }

    if (v.maxRedemptions) {
      const n = Number(v.maxRedemptions);
      if (!Number.isInteger(n) || n < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["maxRedemptions"],
          message: "Must be a whole number of 1 or more",
        });
      }
    }

    if (v.expiresAt) {
      const t = new Date(v.expiresAt).getTime();
      if (!Number.isFinite(t)) {
        ctx.addIssue({
          code: "custom",
          path: ["expiresAt"],
          message: "Invalid date",
        });
      } else if (t <= Date.now()) {
        ctx.addIssue({
          code: "custom",
          path: ["expiresAt"],
          message: "Expiry must be in the future",
        });
      }
    }
  });

export type CouponFormData = z.infer<typeof couponFormSchema>;

export function toCreateCouponBody(v: CouponFormData): CreateCouponBody {
  const body: CreateCouponBody = {
    code: v.code.trim().toUpperCase(),
    duration: v.duration,
    // With a single paid plan, tier targeting is vestigial — always apply to
    // everything per the admin API docs.
    appliesToTiers: [],
  };

  if (v.name?.trim()) body.name = v.name.trim();

  if (v.discountType === "percent") {
    body.percentOff = Number(v.percentOff);
  } else {
    body.amountOff = Math.round(Number(v.amountOffDollars) * 100);
    body.currency = v.currency;
  }

  if (v.duration === "repeating") {
    body.durationInMonths = Number(v.durationInMonths);
  }

  if (v.maxRedemptions) body.maxRedemptions = Number(v.maxRedemptions);
  if (v.expiresAt) body.expiresAt = new Date(v.expiresAt).toISOString();
  if (v.isFoundingPromo) body.isFoundingPromo = true;

  return body;
}
