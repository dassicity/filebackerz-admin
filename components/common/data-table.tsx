"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/error-state";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  loading?: boolean;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  skeletonRows?: number;
  /** Query error; shown instead of the empty state when there are no rows. */
  error?: unknown;
  onRetry?: () => unknown;
}

export function DataTable<T>({
  columns,
  rows,
  loading,
  rowKey,
  onRowClick,
  emptyState,
  skeletonRows = 8,
  error,
  onRetry,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-border bg-muted/30">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "text-left font-medium text-xs text-muted-foreground uppercase tracking-wider px-4 py-2.5",
                  col.headerClassName,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={columns.length} className="px-4 py-3">
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))
            : error && (!rows || rows.length === 0)
              ? (
                <tr>
                  <td colSpan={columns.length}>
                    <ErrorState error={error} onRetry={onRetry} />
                  </td>
                </tr>
              )
            : !rows || rows.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length}>
                    {emptyState ?? (
                      <div className="py-12 text-center text-sm text-muted-foreground">
                        No results.
                      </div>
                    )}
                  </td>
                </tr>
              )
              : rows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "border-b border-border transition-colors",
                      onRowClick && "hover:bg-muted/40 cursor-pointer",
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn("px-4 py-3 align-middle", col.className)}
                      >
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
        </tbody>
      </table>
    </div>
  );
}
