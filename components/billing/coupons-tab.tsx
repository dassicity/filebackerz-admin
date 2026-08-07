"use client";

import { useState } from "react";
import { Plus, Sparkles, TicketPercent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/common/data-table";
import { useCoupons } from "@/lib/hooks/use-coupons";
import type { AdminCoupon } from "@/lib/api/coupons";
import { formatNumber, formatRelative } from "@/lib/formatters";
import { CreateCouponDialog } from "./create-coupon-dialog";
import { CouponDetailDialog } from "./coupon-detail-dialog";
import {
  CouponStatusBadge,
  couponDiscountLabel,
  couponDurationLabel,
} from "./coupon-status-badge";

const ALL = "__all__";

export function CouponsTab() {
  const [active, setActive] = useState<string>(ALL);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useCoupons({
    active: active === ALL ? undefined : (active as "true" | "false"),
  });

  const columns: Column<AdminCoupon>[] = [
    {
      key: "code",
      header: "Code",
      cell: (c) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-medium text-foreground">
            {c.code}
          </span>
          {c.isFoundingPromo && (
            <Sparkles
              className="w-3.5 h-3.5 text-primary shrink-0"
              aria-label="Founding promo"
            />
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Name",
      cell: (c) => (
        <span className="text-muted-foreground truncate max-w-[180px] block">
          {c.name || "—"}
        </span>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      cell: (c) => (
        <span className="font-semibold text-foreground">
          {couponDiscountLabel(c)}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      cell: (c) => (
        <span className="text-xs capitalize text-muted-foreground">
          {couponDurationLabel(c)}
        </span>
      ),
    },
    {
      key: "appliesTo",
      header: "Applies to",
      cell: (c) =>
        c.appliesToTiers.length === 0 ? (
          <Badge variant="secondary" className="text-[10px] uppercase">
            All plans
          </Badge>
        ) : (
          <div className="flex flex-wrap gap-1">
            {c.appliesToTiers.map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="text-[10px] uppercase"
              >
                {t}
              </Badge>
            ))}
          </div>
        ),
    },
    {
      key: "redemptions",
      header: "Redemptions",
      cell: (c) => (
        <span className="font-mono text-xs">
          {formatNumber(c.timesRedeemed)} /{" "}
          {c.maxRedemptions != null ? formatNumber(c.maxRedemptions) : "∞"}
        </span>
      ),
    },
    {
      key: "expires",
      header: "Expires",
      cell: (c) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {c.expiresAt ? formatRelative(c.expiresAt) : "Never"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => <CouponStatusBadge coupon={c} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <Select value={active} onValueChange={setActive}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground sm:ml-1">
          {isLoading ? "" : `${formatNumber(data?.length ?? 0)} coupons`}
        </span>

        <div className="sm:ml-auto">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New coupon
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            rows={data}
            loading={isLoading}
            rowKey={(c) => c._id}
            onRowClick={(c) => setSelectedId(c._id)}
            emptyState={
              <div className="py-12 text-center">
                <TicketPercent className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium text-foreground">
                  No coupons found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create your first coupon to offer discounts.
                </p>
              </div>
            }
          />
        </CardContent>
      </Card>

      <CreateCouponDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CouponDetailDialog
        couponId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
