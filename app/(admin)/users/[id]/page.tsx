"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldOff,
  Monitor,
  Building2,
  Activity,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type Column } from "@/components/common/data-table";
import { PaginationBar } from "@/components/common/pagination-bar";
import {
  StatusBadge,
  RoleBadge,
  PlanBadge,
  SeverityBadge,
} from "@/components/common/status-badges";
import { UserActions } from "@/components/users/user-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useUser,
  useUserSessions,
  useUserOrganizations,
  useUserAuditLogs,
} from "@/lib/hooks/use-users";
import type { UserDevice } from "@/lib/api/users";
import type { AuditLogEntry } from "@/lib/api/dashboard";
import { formatBytes, formatRelative } from "@/lib/formatters";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: user, isLoading, error } = useUser(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div>
        <PageHeader
          title="User not found"
          description="The user you requested does not exist or was deleted."
        />
        <Button variant="outline" asChild>
          <Link href="/users">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to users
          </Link>
        </Button>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/users">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            All users
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <Avatar className="w-14 h-14 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
                  {user.name || "—"}
                </h1>
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {user.email}
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                <span className="capitalize">{user.authProvider}</span>
                <span>·</span>
                <span>
                  Joined {formatRelative(user.createdAt)}
                </span>
                {user.lastLogin && (
                  <>
                    <span>·</span>
                    <span>Last login {formatRelative(user.lastLogin)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <UserActions user={user} />
          </div>
        </div>
      </div>

      {/* Quick stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Email verified"
          value={user.isEmailVerified ? "Yes" : "No"}
          accent={user.isEmailVerified ? "success" : "warning"}
          icon={
            user.isEmailVerified ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <ShieldOff className="w-4 h-4" />
            )
          }
        />
        <StatCard
          label="Two-factor auth"
          value={
            user.twoFactorAuth?.enabled
              ? user.twoFactorAuth.method?.toUpperCase() ?? "ON"
              : "Off"
          }
          accent={user.twoFactorAuth?.enabled ? "success" : "muted"}
          icon={<ShieldCheck className="w-4 h-4" />}
        />
        <StatCard
          label="Failed logins"
          value={String(user.failedLoginAttempts ?? 0)}
          accent={
            (user.failedLoginAttempts ?? 0) > 0 ? "warning" : "muted"
          }
          icon={<Activity className="w-4 h-4" />}
        />
      </div>

      <Tabs defaultValue="organizations">
        <TabsList>
          <TabsTrigger value="organizations">
            <Building2 className="w-3.5 h-3.5 mr-1.5" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Monitor className="w-3.5 h-3.5 mr-1.5" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            Audit log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="mt-4">
          <OrganizationsTab userId={id} />
        </TabsContent>
        <TabsContent value="sessions" className="mt-4">
          <SessionsTab userId={id} />
        </TabsContent>
        <TabsContent value="audit" className="mt-4">
          <AuditTab userId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type Accent = "success" | "warning" | "muted";
const ACCENTS: Record<Accent, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  muted: "bg-muted text-muted-foreground",
};

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: Accent;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ACCENTS[accent]}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            {label}
          </div>
          <div className="text-base font-semibold text-foreground mt-0.5 truncate">
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrganizationsTab({ userId }: { userId: string }) {
  const { data, isLoading } = useUserOrganizations(userId);
  const rows = data?.organizations ?? [];

  const columns: Column<(typeof rows)[number]>[] = [
    {
      key: "name",
      header: "Organization",
      cell: (r) => (
        <Link
          href={`/organizations/${r.organization._id}`}
          className="font-medium text-foreground hover:text-primary transition-colors"
        >
          {r.organization.name}
        </Link>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      cell: (r) => <PlanBadge plan={r.organization.plan} />,
    },
    {
      key: "type",
      header: "Type",
      cell: (r) => (
        <span className="text-xs text-muted-foreground capitalize">
          {r.organization.type}
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (r) => <RoleBadge role={r.membership.role} />,
    },
    {
      key: "status",
      header: "Membership",
      cell: (r) => <StatusBadge status={r.membership.status} />,
    },
    {
      key: "storage",
      header: "Storage",
      cell: (r) => (
        <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
          {formatBytes(r.organization.storageUsed)} /{" "}
          {formatBytes(r.organization.storageQuota)}
        </span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      cell: (r) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelative(r.membership.joinedAt)}
        </span>
      ),
    },
  ];

  return (
    <Card>
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          rowKey={(r) => r.membership._id}
          emptyState={
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 mx-auto">
                <Building2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                This user is not a member of any organization.
              </p>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}

function SessionsTab({ userId }: { userId: string }) {
  const { data, isLoading } = useUserSessions(userId);
  const rows = data?.sessions ?? [];

  const columns: Column<UserDevice>[] = [
    {
      key: "device",
      header: "Device",
      cell: (d) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-foreground">
            {d.browser}
          </span>
          <span className="text-xs text-muted-foreground">{d.os}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (d) => (
        <span className="text-xs text-muted-foreground capitalize">
          {d.deviceType || "—"}
        </span>
      ),
    },
    {
      key: "ip",
      header: "IP",
      cell: (d) => (
        <span className="text-xs font-mono text-muted-foreground">
          {d.ip || "—"}
        </span>
      ),
    },
    {
      key: "location",
      header: "Location",
      cell: (d) => (
        <span className="text-xs text-muted-foreground">
          {d.location?.city ? `${d.location.city}, ${d.location.country}` : "—"}
        </span>
      ),
    },
    {
      key: "lastActive",
      header: "Last active",
      cell: (d) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelative(d.lastActive)}
        </span>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold">
            Active sessions
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {data?.sessionCount ?? 0} device{(data?.sessionCount ?? 0) === 1 ? "" : "s"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          rowKey={(d) => d.deviceId}
          emptyState={
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 mx-auto">
                <Monitor className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No active sessions.
              </p>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}

function AuditTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useUserAuditLogs(userId, {
    page,
    limit: 15,
  });

  const columns: Column<AuditLogEntry>[] = [
    {
      key: "time",
      header: "Time",
      cell: (l) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelative(l.timestamp)}
        </span>
      ),
    },
    {
      key: "event",
      header: "Event",
      cell: (l) => (
        <div className="flex flex-col">
          <span className="font-mono text-[11px] text-muted-foreground">
            {l.eventType}
          </span>
          <span className="text-sm text-foreground line-clamp-1">
            {l.action}
          </span>
        </div>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      cell: (l) => <SeverityBadge severity={l.severity} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (l) => <StatusBadge status={l.status} />,
    },
    {
      key: "ip",
      header: "IP",
      cell: (l) => (
        <span className="text-xs font-mono text-muted-foreground">
          {l.ipAddress ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <Card>
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          rows={data?.data}
          loading={isLoading}
          rowKey={(l) => l._id}
          emptyState={
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 mx-auto">
                <Activity className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No audit log entries for this user.
              </p>
            </div>
          }
        />
        <PaginationBar
          pagination={data?.pagination}
          onPageChange={setPage}
          loading={isFetching}
          label="events"
        />
      </CardContent>
    </Card>
  );
}

