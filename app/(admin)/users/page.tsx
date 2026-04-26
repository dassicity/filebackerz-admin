"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShieldCheck, UserCog, X } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type Column } from "@/components/common/data-table";
import { PaginationBar } from "@/components/common/pagination-bar";
import {
  StatusBadge,
  RoleBadge,
} from "@/components/common/status-badges";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsersList } from "@/lib/hooks/use-users";
import type {
  AdminListedUser,
  ListUsersParams,
  UserStatus,
  UserRole,
  AuthProvider,
} from "@/lib/api/users";
import { formatRelative } from "@/lib/formatters";

const ALL = "__all__";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<string>(ALL);
  const [role, setRole] = useState<string>(ALL);
  const [authProvider, setAuthProvider] = useState<string>(ALL);

  const params: ListUsersParams = {
    page,
    limit: 20,
    search: search || undefined,
    status: status === ALL ? undefined : (status as UserStatus),
    role: role === ALL ? undefined : (role as UserRole),
    authProvider:
      authProvider === ALL ? undefined : (authProvider as AuthProvider),
  };

  const { data, isLoading, isFetching } = useUsersList(params);

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const hasFilters =
    search !== "" || status !== ALL || role !== ALL || authProvider !== ALL;

  const reset = () => {
    setSearchInput("");
    setSearch("");
    setStatus(ALL);
    setRole(ALL);
    setAuthProvider(ALL);
    setPage(1);
  };

  const columns: Column<AdminListedUser>[] = [
    {
      key: "name",
      header: "User",
      cell: (u) => (
        <div className="flex flex-col min-w-0">
          <Link
            href={`/users/${u._id}`}
            className="font-medium text-foreground hover:text-primary transition-colors truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {u.name || "—"}
          </Link>
          <span className="text-xs text-muted-foreground truncate">
            {u.email}
          </span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (u) => <RoleBadge role={u.role} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: "verified",
      header: "Verified",
      cell: (u) =>
        u.isEmailVerified ? (
          <span className="text-xs text-success">Yes</span>
        ) : (
          <span className="text-xs text-warning">No</span>
        ),
    },
    {
      key: "auth",
      header: "Auth",
      cell: (u) => (
        <span className="text-xs text-muted-foreground capitalize">
          {u.authProvider}
        </span>
      ),
    },
    {
      key: "2fa",
      header: "2FA",
      cell: (u) =>
        u.twoFactorAuth?.enabled ? (
          <span className="inline-flex items-center gap-1 text-xs text-success">
            <ShieldCheck className="w-3 h-3" />
            {u.twoFactorAuth.method?.toUpperCase()}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Off</span>
        ),
    },
    {
      key: "lastLogin",
      header: "Last login",
      cell: (u) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {u.lastLogin ? formatRelative(u.lastLogin) : "Never"}
        </span>
      ),
    },
    {
      key: "created",
      header: "Joined",
      cell: (u) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelative(u.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Every user across the platform. Click a row to view detail."
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          <form
            onSubmit={applySearch}
            className="flex flex-col md:flex-row md:items-center gap-3"
          >
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name or email…"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-[130px] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={role}
                onValueChange={(v) => {
                  setRole(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-[130px] text-xs">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={authProvider}
                onValueChange={(v) => {
                  setAuthProvider(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-[140px] text-xs">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All providers</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="microsoft">Microsoft</SelectItem>
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
          <DataTable<AdminListedUser>
            columns={columns}
            rows={data?.data}
            loading={isLoading}
            rowKey={(u) => u._id}
            emptyState={
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <UserCog className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  No users found
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
            label="users"
          />
        </CardContent>
      </Card>
    </div>
  );
}
