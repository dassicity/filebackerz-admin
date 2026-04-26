"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Pagination } from "@/lib/api/dashboard";

interface PaginationBarProps {
  pagination: Pagination | undefined;
  onPageChange: (page: number) => void;
  loading?: boolean;
  label?: string;
}

export function PaginationBar({
  pagination,
  onPageChange,
  loading,
  label = "results",
}: PaginationBarProps) {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs">
      <div className="text-muted-foreground">
        Page {pagination.page} of {pagination.pages} ·{" "}
        {pagination.total.toLocaleString()} {label}
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2"
          disabled={pagination.page <= 1 || loading}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2"
          disabled={pagination.page >= pagination.pages || loading}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
