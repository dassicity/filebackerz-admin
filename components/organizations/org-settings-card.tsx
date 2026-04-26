"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useUpdateOrgSettings } from "@/lib/hooks/use-organizations";
import type { AdminOrganizationDetail } from "@/lib/api/organizations";

interface Props {
  org: AdminOrganizationDetail;
}

export function OrgSettingsCard({ org }: Props) {
  const mutation = useUpdateOrgSettings();

  const [allowPublicSharing, setAllowPublicSharing] = useState(
    org.settings.allowPublicSharing,
  );
  const [requireEmailVerification, setRequireEmailVerification] = useState(
    org.settings.requireEmailVerification,
  );
  const [sessionTimeout, setSessionTimeout] = useState(
    String(org.settings.sessionTimeout),
  );
  const [maxFileVersions, setMaxFileVersions] = useState(
    String(org.settings.maxFileVersions),
  );
  const [allowedDomains, setAllowedDomains] = useState(
    (org.settings.allowedDomains ?? []).join(", "),
  );

  const [retentionDays, setRetentionDays] = useState(
    String(org.trashSettings?.retentionDays ?? 30),
  );
  const [autoEmptyTrash, setAutoEmptyTrash] = useState(
    org.trashSettings?.autoEmptyTrash ?? true,
  );
  const [allowUserRestore, setAllowUserRestore] = useState(
    org.trashSettings?.allowUserRestore ?? true,
  );
  const [allowUserPermanentDelete, setAllowUserPermanentDelete] = useState(
    org.trashSettings?.allowUserPermanentDelete ?? false,
  );

  const [allowBYOS, setAllowBYOS] = useState(
    org.storageConfig?.allowBYOS ?? true,
  );
  const [maxConnections, setMaxConnections] = useState(
    String(org.storageConfig?.maxConnections ?? 5),
  );

  const save = () => {
    mutation.mutate({
      orgId: org._id,
      args: [
        {
          settings: {
            allowPublicSharing,
            requireEmailVerification,
            sessionTimeout: Number(sessionTimeout) || 24,
            maxFileVersions: Number(maxFileVersions) || 10,
            allowedDomains: allowedDomains
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          },
          trashSettings: {
            retentionDays: Number(retentionDays) as 7 | 15 | 30 | 60 | 90,
            autoEmptyTrash,
            allowUserRestore,
            allowUserPermanentDelete,
          },
          storageConfig: {
            allowBYOS,
            maxConnections: Number(maxConnections) || 5,
          },
        },
      ],
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Section title="Sharing & verification">
          <Row label="Allow public sharing" description="Members can create public share links.">
            <Switch checked={allowPublicSharing} onCheckedChange={setAllowPublicSharing} />
          </Row>
          <Row
            label="Require email verification"
            description="Members must verify their email before they can sign in."
          >
            <Switch
              checked={requireEmailVerification}
              onCheckedChange={setRequireEmailVerification}
            />
          </Row>
          <FieldRow>
            <Label htmlFor="session-timeout">Session timeout (hours)</Label>
            <Input
              id="session-timeout"
              type="number"
              min={1}
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
            />
          </FieldRow>
          <FieldRow>
            <Label htmlFor="max-versions">Max file versions</Label>
            <Input
              id="max-versions"
              type="number"
              min={1}
              value={maxFileVersions}
              onChange={(e) => setMaxFileVersions(e.target.value)}
            />
          </FieldRow>
          <FieldRow>
            <Label htmlFor="allowed-domains">Allowed email domains</Label>
            <Input
              id="allowed-domains"
              value={allowedDomains}
              onChange={(e) => setAllowedDomains(e.target.value)}
              placeholder="company.com, acme.io"
            />
            <p className="text-xs text-muted-foreground mt-1">Comma-separated. Empty = any domain.</p>
          </FieldRow>
        </Section>

        <Section title="Trash">
          <FieldRow>
            <Label htmlFor="retention">Retention</Label>
            <Select value={retentionDays} onValueChange={setRetentionDays}>
              <SelectTrigger id="retention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["7", "15", "30", "60", "90"].map((d) => (
                  <SelectItem key={d} value={d}>
                    {d} days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
          <Row label="Auto-empty trash" description="Automatically purge items past retention.">
            <Switch checked={autoEmptyTrash} onCheckedChange={setAutoEmptyTrash} />
          </Row>
          <Row label="Allow users to restore" description="Members can restore from trash themselves.">
            <Switch checked={allowUserRestore} onCheckedChange={setAllowUserRestore} />
          </Row>
          <Row
            label="Allow permanent delete"
            description="Members can permanently delete from trash."
          >
            <Switch
              checked={allowUserPermanentDelete}
              onCheckedChange={setAllowUserPermanentDelete}
            />
          </Row>
        </Section>

        <Section title="Storage">
          <Row label="Allow BYOS" description="Let members connect external storage providers.">
            <Switch checked={allowBYOS} onCheckedChange={setAllowBYOS} />
          </Row>
          <FieldRow>
            <Label htmlFor="max-connections">Max storage connections</Label>
            <Input
              id="max-connections"
              type="number"
              min={1}
              value={maxConnections}
              onChange={(e) => setMaxConnections(e.target.value)}
            />
          </FieldRow>
        </Section>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button onClick={save} disabled={mutation.isPending}>
            <Save className="w-4 h-4 mr-1.5" />
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {description}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}
