"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Building2, X } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type Column } from "@/components/common/data-table";
import { PaginationBar } from "@/components/common/pagination-bar";
import {
  StatusBadge,
  PlanBadge,
} from "@/components/common/status-badges";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganizationsList } from "@/lib/hooks/use-organizations";
import type {
  AdminListedOrganization,
  ListOrgsParams,
  OrgPlan,
  OrgStatus,
  OrgType,
} from "@/lib/api/organizations";
import { formatBytes, formatNumber, formatRelative } from "@/lib/formatters";

const ALL = "__all__";

export default function OrganizationsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [type, setType] = useState<string>(ALL);
  const [sortBy, setSortBy] = useState<ListOrgsParams["sortBy"]>("createdAt");

  const params: ListOrgsParams = {
    page,
    limit: 20,
    search: search || undefined,
    plan: plan === ALL ? undefined : (plan as OrgPlan),
    status: status === ALL ? undefined : (status as OrgStatus),
    type: type === ALL ? undefined : (type as OrgType),
    sortBy,
    sortOrder: "desc",
  };

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useOrganizationsList(params);

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const reset = () => {
    setSearchInput("");
    setSearch("");
    setPlan(ALL);
    setStatus(ALL);
    setType(ALL);
    setSortBy("createdAt");
    setPage(1);
  };

  const hasFilters =
    search || plan !== ALL || status !== ALL || type !== ALL;

  const columns: Column<AdminListedOrganization>[] = [
    {
      key: "name",
      header: "Organization",
      cell: (o) => (
        <div className="flex flex-col min-w-0">
          <Link
            href={`/organizations/${o._id}`}
            className="font-medium text-foreground hover:text-primary transition-colors truncate"
          >
            {o.name}
          </Link>
          <span className="text-xs text-muted-foreground truncate">
            {o.subdomain ?? o.slug}
          </span>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      cell: (o) => <PlanBadge plan={o.plan} />,
    },
    {
      key: "type",
      header: "Type",
      cell: (o) => (
        <span className="text-xs text-muted-foreground capitalize">
          {o.type}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: "members",
      header: "Members",
      cell: (o) => (
        <span className="text-xs text-muted-foreground">
          {formatNumber(o.memberCount)}
        </span>
      ),
    },
    {
      key: "storage",
      header: "Storage",
      cell: (o) => {
        const pct =
          o.storageQuota > 0 ? (o.storageUsed / o.storageQuota) * 100 : 0;
        return (
          <div className="min-w-[140px]">
            <div className="text-xs text-muted-foreground font-mono whitespace-nowrap">
              {formatBytes(o.storageUsed)} / {formatBytes(o.storageQuota)}
            </div>
            <Progress value={Math.min(100, pct)} className="h-1 mt-1" />
          </div>
        );
      },
    },
    {
      key: "created",
      header: "Created",
      cell: (o) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelative(o.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        description="Every tenant on the platform — plans, quotas, status, and ownership."
      />

      <Card>
        <CardContent className="p-4">
          <form
            onSubmit={apply}
            className="flex flex-col md:flex-row md:items-center gap-3"
          >
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, slug, subdomain…"
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={plan} onValueChange={(v) => { setPlan(v); setPage(1); }}>
                <SelectTrigger className="h-10 w-[120px] text-xs">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All plans</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="h-10 w-[130px] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>

              <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
                <SelectTrigger className="h-10 w-[120px] text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All types</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as ListOrgsParams["sortBy"])}
              >
                <SelectTrigger className="h-10 w-[140px] text-xs">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Newest</SelectItem>
                  <SelectItem value="updatedAt">Recently updated</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="storageUsed">Storage used</SelectItem>
                </SelectContent>
              </Select>

              <Button type="submit" size="sm" className="h-10">
                Apply
              </Button>
              {hasFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-10"
                  onClick={reset}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            rows={data?.data}
            loading={isLoading}
            error={error}
            onRetry={refetch}
            rowKey={(o) => o._id}
            emptyState={
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  No organizations found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting the filters above.
                </p>
              </div>
            }
          />
          <PaginationBar
            pagination={data?.pagination}
            onPageChange={setPage}
            loading={isFetching}
            label="organizations"
          />
        </CardContent>
      </Card>
    </div>
  );
}
