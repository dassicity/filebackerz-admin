"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  Flag,
  HardDrive,
  Loader2,
  Mail,
  Power,
  RefreshCw,
  Save,
  Settings2,
  Shield,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePlatformConfig,
  useUpdatePlatformConfig,
  useSystemHealth,
  useToggleMaintenance,
  useFeatureFlags,
  useUpdateFeatureFlags,
} from "@/lib/hooks/use-system";
import type {
  EmailSettings,
  FeatureFlags,
  GlobalSettings,
  SecuritySettings,
  ServiceStatus,
} from "@/lib/api/system";
import { formatBytes, formatRelative } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const GB = 1024 * 1024 * 1024;

export default function SystemPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Configuration"
        description="Platform health, feature flags, maintenance mode, and global configuration."
      />
      <Tabs defaultValue="health">
        <TabsList>
          <TabsTrigger value="health">
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            Health
          </TabsTrigger>
          <TabsTrigger value="flags">
            <Flag className="w-3.5 h-3.5 mr-1.5" />
            Feature flags
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Power className="w-3.5 h-3.5 mr-1.5" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings2 className="w-3.5 h-3.5 mr-1.5" />
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-4">
          <HealthTab />
        </TabsContent>
        <TabsContent value="flags" className="mt-4">
          <FeatureFlagsTab />
        </TabsContent>
        <TabsContent value="maintenance" className="mt-4">
          <MaintenanceTab />
        </TabsContent>
        <TabsContent value="config" className="mt-4">
          <ConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---- Health ----

function HealthTab() {
  const { data, isLoading, refetch, isFetching } = useSystemHealth();

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <OverallIcon status={data?.overall} />
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Platform status
              </div>
              <div className="text-xl font-bold text-foreground capitalize">
                {isLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  data?.overall ?? "—"
                )}
              </div>
              {data && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  Checked {formatRelative(data.checkedAt)} · auto-refresh 30s
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`}
            />
            Recheck
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ServiceCard
          label="Database"
          icon={<Database className="w-4 h-4" />}
          status={data?.services.database.status}
          latencyMs={data?.services.database.latencyMs}
          error={data?.services.database.error}
          message={data?.services.database.message}
          loading={isLoading}
        />
        <ServiceCard
          label="Storage (S3)"
          icon={<HardDrive className="w-4 h-4" />}
          status={data?.services.storage.status}
          latencyMs={data?.services.storage.latencyMs}
          error={data?.services.storage.error}
          message={data?.services.storage.message}
          extra={
            data?.services.storage.bucket
              ? `bucket: ${data.services.storage.bucket}`
              : undefined
          }
          loading={isLoading}
        />
        <ServiceCard
          label="Email"
          icon={<Mail className="w-4 h-4" />}
          status={data?.services.email.status}
          latencyMs={data?.services.email.latencyMs}
          error={data?.services.email.error}
          message={data?.services.email.message}
          loading={isLoading}
        />
      </div>
    </div>
  );
}

function OverallIcon({ status }: { status?: string }) {
  const className = "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0";
  if (status === "healthy") {
    return (
      <div className={cn(className, "bg-success/10 text-success")}>
        <CheckCircle2 className="w-5 h-5" />
      </div>
    );
  }
  if (status === "degraded") {
    return (
      <div className={cn(className, "bg-destructive/10 text-destructive")}>
        <AlertTriangle className="w-5 h-5" />
      </div>
    );
  }
  return (
    <div className={cn(className, "bg-muted text-muted-foreground")}>
      <Activity className="w-5 h-5" />
    </div>
  );
}

function ServiceCard({
  label,
  icon,
  status,
  latencyMs,
  error,
  message,
  extra,
  loading,
}: {
  label: string;
  icon: React.ReactNode;
  status?: ServiceStatus;
  latencyMs?: number;
  error?: string;
  message?: string;
  extra?: string;
  loading?: boolean;
}) {
  const statusInfo = (() => {
    switch (status) {
      case "ok":
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          label: "Healthy",
          tone: "bg-success/15 text-success border-success/30",
        };
      case "error":
        return {
          icon: <XCircle className="w-4 h-4" />,
          label: "Error",
          tone: "bg-destructive/15 text-destructive border-destructive/30",
        };
      case "unconfigured":
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          label: "Unconfigured",
          tone: "bg-warning/15 text-warning border-warning/30",
        };
      default:
        return {
          icon: <Activity className="w-4 h-4" />,
          label: "Unknown",
          tone: "bg-muted text-muted-foreground border-border",
        };
    }
  })();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
          <CardTitle className="text-base font-semibold">{label}</CardTitle>
        </div>
        {loading ? (
          <Skeleton className="h-5 w-16" />
        ) : (
          <Badge
            variant="outline"
            className={cn("text-[10px] uppercase gap-1", statusInfo.tone)}
          >
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <>
            {latencyMs != null && (
              <Line label="Latency" value={`${latencyMs} ms`} />
            )}
            {extra && <div className="text-muted-foreground font-mono">{extra}</div>}
            {message && <div className="text-muted-foreground">{message}</div>}
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2 font-mono text-destructive break-words">
                {error}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}

// ---- Feature flags ----

const FLAG_META: Array<{
  key: keyof FeatureFlags;
  label: string;
  description: string;
}> = [
  {
    key: "byosEnabled",
    label: "BYOS storage",
    description: "Allow organizations to connect external storage providers.",
  },
  {
    key: "fileRequestsEnabled",
    label: "File requests",
    description: "Allow organizations to create file request links.",
  },
  {
    key: "shareLinkEnabled",
    label: "Share links",
    description: "Allow creation of public share links.",
  },
  {
    key: "customDomainsEnabled",
    label: "Custom domains",
    description: "Allow organizations to set custom domains.",
  },
  {
    key: "twoFactorRequired",
    label: "Force 2FA",
    description: "Require all users to enable two-factor auth.",
  },
  {
    key: "googleOAuthEnabled",
    label: "Google OAuth",
    description: "Allow sign-in with Google.",
  },
  {
    key: "microsoftOAuthEnabled",
    label: "Microsoft OAuth",
    description: "Allow sign-in with Microsoft.",
  },
  {
    key: "auditLogsEnabled",
    label: "Audit logs",
    description: "Enable audit log recording.",
  },
];

function FeatureFlagsTab() {
  const { data, isLoading } = useFeatureFlags();
  const mutation = useUpdateFeatureFlags();

  const onToggle = (key: keyof FeatureFlags, value: boolean) => {
    mutation.mutate({ [key]: value } as Partial<FeatureFlags>);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Feature flags</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Toggles apply platform-wide. Changes take effect immediately.
        </p>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {isLoading || !data ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          FLAG_META.map((flag) => (
            <div
              key={flag.key}
              className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {flag.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {flag.description}
                </div>
              </div>
              <Switch
                checked={data[flag.key]}
                disabled={mutation.isPending}
                onCheckedChange={(checked) => onToggle(flag.key, checked)}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ---- Maintenance ----

function MaintenanceTab() {
  const { data, isLoading } = usePlatformConfig();
  const mutation = useToggleMaintenance();

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (data) setMessage(data.globalSettings.maintenanceMessage ?? "");
  }, [data]);

  const currentlyOn = data?.globalSettings.maintenanceMode ?? false;

  const toggle = (enabled: boolean) => {
    mutation.mutate({
      enabled,
      message: enabled ? message : undefined,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Maintenance mode
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              When enabled, non-admin users see a maintenance banner.
            </p>
          </div>
          {!isLoading &&
            (currentlyOn ? (
              <Badge
                variant="outline"
                className="bg-warning/15 text-warning border-warning/30 gap-1"
              >
                <AlertTriangle className="w-3 h-3" />
                ON
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-success/15 text-success border-success/30 gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                OFF
              </Badge>
            ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="maintenance-message">Message (shown to users)</Label>
              <Textarea
                id="maintenance-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="System maintenance in progress. Back in 30 minutes."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              {currentlyOn ? (
                <Button
                  variant="outline"
                  onClick={() => toggle(false)}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Power className="w-4 h-4 mr-1.5" />
                  )}
                  Disable maintenance
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => toggle(true)}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Power className="w-4 h-4 mr-1.5" />
                  )}
                  Enable maintenance
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Full config ----

function ConfigTab() {
  const { data, isLoading } = usePlatformConfig();
  const mutation = useUpdatePlatformConfig();

  const [globalForm, setGlobalForm] = useState<{
    maxUploadSizeGB: string;
    defaultTrashRetention: string;
    signupEnabled: boolean;
  }>({
    maxUploadSizeGB: "",
    defaultTrashRetention: "",
    signupEnabled: true,
  });

  const [emailForm, setEmailForm] = useState<EmailSettings>({
    fromName: "",
    fromEmail: "",
    sendWelcomeEmail: true,
    sendPasswordResetEmail: true,
    sendInvitationEmail: true,
    sendShareNotificationEmail: true,
  });

  const [securityForm, setSecurityForm] = useState<{
    maxFailedLogins: string;
    lockoutDuration: string;
    sessionTimeout: string;
    passwordMinLength: string;
    requireEmailVerification: boolean;
    ipBlocklist: string;
    allowedCorsOrigins: string;
  }>({
    maxFailedLogins: "",
    lockoutDuration: "",
    sessionTimeout: "",
    passwordMinLength: "",
    requireEmailVerification: true,
    ipBlocklist: "",
    allowedCorsOrigins: "",
  });

  useEffect(() => {
    if (!data) return;
    setGlobalForm({
      maxUploadSizeGB: String(
        Math.round((data.globalSettings.maxUploadSize / GB) * 100) / 100,
      ),
      defaultTrashRetention: String(data.globalSettings.defaultTrashRetention),
      signupEnabled: data.globalSettings.signupEnabled,
    });
    setEmailForm({ ...data.emailSettings });
    setSecurityForm({
      maxFailedLogins: String(data.securitySettings.maxFailedLogins),
      lockoutDuration: String(data.securitySettings.lockoutDuration),
      sessionTimeout: String(data.securitySettings.sessionTimeout),
      passwordMinLength: String(data.securitySettings.passwordMinLength),
      requireEmailVerification: data.securitySettings.requireEmailVerification,
      ipBlocklist: (data.securitySettings.ipBlocklist ?? []).join(", "),
      allowedCorsOrigins: (data.securitySettings.allowedCorsOrigins ?? []).join(
        ", ",
      ),
    });
  }, [data]);

  const save = () => {
    if (!data) return;
    const next: {
      globalSettings?: Partial<GlobalSettings>;
      emailSettings?: Partial<EmailSettings>;
      securitySettings?: Partial<SecuritySettings>;
    } = {};

    const nextGlobal: Partial<GlobalSettings> = {
      maxUploadSize: Math.round(Number(globalForm.maxUploadSizeGB || 0) * GB),
      defaultTrashRetention: Number(globalForm.defaultTrashRetention || 0),
      signupEnabled: globalForm.signupEnabled,
    };
    if (
      nextGlobal.maxUploadSize !== data.globalSettings.maxUploadSize ||
      nextGlobal.defaultTrashRetention !==
        data.globalSettings.defaultTrashRetention ||
      nextGlobal.signupEnabled !== data.globalSettings.signupEnabled
    ) {
      next.globalSettings = nextGlobal;
    }

    if (
      emailForm.fromName !== data.emailSettings.fromName ||
      emailForm.fromEmail !== data.emailSettings.fromEmail ||
      emailForm.sendWelcomeEmail !== data.emailSettings.sendWelcomeEmail ||
      emailForm.sendPasswordResetEmail !==
        data.emailSettings.sendPasswordResetEmail ||
      emailForm.sendInvitationEmail !==
        data.emailSettings.sendInvitationEmail ||
      emailForm.sendShareNotificationEmail !==
        data.emailSettings.sendShareNotificationEmail
    ) {
      next.emailSettings = emailForm;
    }

    const nextSecurity: Partial<SecuritySettings> = {
      maxFailedLogins: Number(securityForm.maxFailedLogins || 0),
      lockoutDuration: Number(securityForm.lockoutDuration || 0),
      sessionTimeout: Number(securityForm.sessionTimeout || 0),
      passwordMinLength: Number(securityForm.passwordMinLength || 0),
      requireEmailVerification: securityForm.requireEmailVerification,
      ipBlocklist: securityForm.ipBlocklist
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      allowedCorsOrigins: securityForm.allowedCorsOrigins
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const prevSecurity = data.securitySettings;
    const securityChanged =
      nextSecurity.maxFailedLogins !== prevSecurity.maxFailedLogins ||
      nextSecurity.lockoutDuration !== prevSecurity.lockoutDuration ||
      nextSecurity.sessionTimeout !== prevSecurity.sessionTimeout ||
      nextSecurity.passwordMinLength !== prevSecurity.passwordMinLength ||
      nextSecurity.requireEmailVerification !==
        prevSecurity.requireEmailVerification ||
      JSON.stringify(nextSecurity.ipBlocklist) !==
        JSON.stringify(prevSecurity.ipBlocklist ?? []) ||
      JSON.stringify(nextSecurity.allowedCorsOrigins) !==
        JSON.stringify(prevSecurity.allowedCorsOrigins ?? []);
    if (securityChanged) next.securitySettings = nextSecurity;

    if (Object.keys(next).length === 0) {
      toast.info("No changes to save.");
      return;
    }
    mutation.mutate(next);
  };

  if (isLoading || !data) {
    return (
      <Card>
        <CardContent className="py-16 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Global settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            Global settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="max-upload">Max upload size (GB)</Label>
            <Input
              id="max-upload"
              type="number"
              min={0}
              step={0.5}
              value={globalForm.maxUploadSizeGB}
              onChange={(e) =>
                setGlobalForm((f) => ({
                  ...f,
                  maxUploadSizeGB: e.target.value,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              {Number(globalForm.maxUploadSizeGB) > 0
                ? `= ${formatBytes(Number(globalForm.maxUploadSizeGB) * GB)}`
                : "—"}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trash-retention">Default trash retention (days)</Label>
            <Input
              id="trash-retention"
              type="number"
              min={0}
              value={globalForm.defaultTrashRetention}
              onChange={(e) =>
                setGlobalForm((f) => ({
                  ...f,
                  defaultTrashRetention: e.target.value,
                }))
              }
            />
          </div>

          <ToggleRow
            label="Signup enabled"
            description="Allow new users to create accounts."
            checked={globalForm.signupEnabled}
            onChange={(v) =>
              setGlobalForm((f) => ({ ...f, signupEnabled: v }))
            }
          />
        </CardContent>
      </Card>

      {/* Email settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Email settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="from-name">From name</Label>
              <Input
                id="from-name"
                value={emailForm.fromName}
                onChange={(e) =>
                  setEmailForm((f) => ({ ...f, fromName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="from-email">From email</Label>
              <Input
                id="from-email"
                type="email"
                value={emailForm.fromEmail}
                onChange={(e) =>
                  setEmailForm((f) => ({ ...f, fromEmail: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="divide-y divide-border">
            <ToggleRow
              label="Welcome emails"
              description="Send welcome email on signup."
              checked={emailForm.sendWelcomeEmail}
              onChange={(v) =>
                setEmailForm((f) => ({ ...f, sendWelcomeEmail: v }))
              }
            />
            <ToggleRow
              label="Password reset emails"
              description="Send reset links when requested."
              checked={emailForm.sendPasswordResetEmail}
              onChange={(v) =>
                setEmailForm((f) => ({ ...f, sendPasswordResetEmail: v }))
              }
            />
            <ToggleRow
              label="Invitation emails"
              description="Notify invited members."
              checked={emailForm.sendInvitationEmail}
              onChange={(v) =>
                setEmailForm((f) => ({ ...f, sendInvitationEmail: v }))
              }
            />
            <ToggleRow
              label="Share notification emails"
              description="Notify recipients of new shares."
              checked={emailForm.sendShareNotificationEmail}
              onChange={(v) =>
                setEmailForm((f) => ({ ...f, sendShareNotificationEmail: v }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Security settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Security settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="max-failed">Max failed logins</Label>
              <Input
                id="max-failed"
                type="number"
                min={0}
                value={securityForm.maxFailedLogins}
                onChange={(e) =>
                  setSecurityForm((f) => ({
                    ...f,
                    maxFailedLogins: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lockout">Lockout duration (minutes)</Label>
              <Input
                id="lockout"
                type="number"
                min={0}
                value={securityForm.lockoutDuration}
                onChange={(e) =>
                  setSecurityForm((f) => ({
                    ...f,
                    lockoutDuration: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="session-to">Session timeout (minutes)</Label>
              <Input
                id="session-to"
                type="number"
                min={0}
                value={securityForm.sessionTimeout}
                onChange={(e) =>
                  setSecurityForm((f) => ({
                    ...f,
                    sessionTimeout: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwd-min">Password min length</Label>
              <Input
                id="pwd-min"
                type="number"
                min={0}
                value={securityForm.passwordMinLength}
                onChange={(e) =>
                  setSecurityForm((f) => ({
                    ...f,
                    passwordMinLength: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <ToggleRow
            label="Require email verification"
            description="New accounts must verify their email before signing in."
            checked={securityForm.requireEmailVerification}
            onChange={(v) =>
              setSecurityForm((f) => ({ ...f, requireEmailVerification: v }))
            }
          />

          <div className="space-y-1.5">
            <Label htmlFor="ip-blocklist">IP blocklist</Label>
            <Textarea
              id="ip-blocklist"
              value={securityForm.ipBlocklist}
              onChange={(e) =>
                setSecurityForm((f) => ({ ...f, ipBlocklist: e.target.value }))
              }
              placeholder="1.2.3.4, 5.6.7.8"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated IPs. Requests from these addresses are rejected.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cors-origins">Allowed CORS origins</Label>
            <Textarea
              id="cors-origins"
              value={securityForm.allowedCorsOrigins}
              onChange={(e) =>
                setSecurityForm((f) => ({
                  ...f,
                  allowedCorsOrigins: e.target.value,
                }))
              }
              placeholder="https://app.filebackerz.com, https://admin.filebackerz.com"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={mutation.isPending}>
          <Save className="w-4 h-4 mr-1.5" />
          {mutation.isPending ? "Saving…" : "Save all changes"}
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {description}
          </div>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
