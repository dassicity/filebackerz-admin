import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listOrganizations,
  getOrganization,
  updateOrgStatus,
  updateOrgPlan,
  updateOrgQuota,
  updateOrgSettings,
  getOrgMembers,
  getOrgStorage,
  getOrgStorageConnections,
  getOrgAuditLogs,
  updateOrgSubdomain,
  deleteOrganization,
  type ListOrgsParams,
  type ListMembersParams,
  type OrgAuditLogsParams,
  type OrgPlan,
  type OrgStatus,
  type UpdateOrgSettingsBody,
} from "@/lib/api/organizations";

export function useOrganizationsList(params: ListOrgsParams) {
  return useQuery({
    queryKey: ["admin", "organizations", "list", params],
    queryFn: async () => await listOrganizations(params),
  });
}

export function useOrganization(orgId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "organizations", "detail", orgId],
    queryFn: async () => {
      if (!orgId) throw new Error("orgId required");
      return (await getOrganization(orgId)).data;
    },
    enabled: !!orgId,
  });
}

export function useOrgMembers(
  orgId: string | undefined,
  params: ListMembersParams,
) {
  return useQuery({
    queryKey: ["admin", "organizations", orgId, "members", params],
    queryFn: async () => {
      if (!orgId) throw new Error("orgId required");
      return await getOrgMembers(orgId, params);
    },
    enabled: !!orgId,
  });
}

export function useOrgStorage(orgId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "organizations", orgId, "storage"],
    queryFn: async () => {
      if (!orgId) throw new Error("orgId required");
      return (await getOrgStorage(orgId)).data;
    },
    enabled: !!orgId,
  });
}

export function useOrgStorageConnections(orgId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "organizations", orgId, "connections"],
    queryFn: async () => {
      if (!orgId) throw new Error("orgId required");
      return (await getOrgStorageConnections(orgId)).data;
    },
    enabled: !!orgId,
  });
}

export function useOrgAuditLogs(
  orgId: string | undefined,
  params: OrgAuditLogsParams,
) {
  return useQuery({
    queryKey: ["admin", "organizations", orgId, "audit-logs", params],
    queryFn: async () => {
      if (!orgId) throw new Error("orgId required");
      return await getOrgAuditLogs(orgId, params);
    },
    enabled: !!orgId,
  });
}

function handleError(err: unknown): string {
  return (
    (err as { response?: { data?: { error?: string } } })?.response?.data
      ?.error ?? "Action failed"
  );
}

function useOrgMutation<Args extends unknown[]>(
  mutationFn: (orgId: string, ...args: Args) => Promise<unknown>,
  successMessage: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orgId, args }: { orgId: string; args: Args }) =>
      mutationFn(orgId, ...args),
    onSuccess: (_data, variables) => {
      toast.success(successMessage);
      qc.invalidateQueries({ queryKey: ["admin", "organizations"] });
      qc.invalidateQueries({
        queryKey: ["admin", "organizations", "detail", variables.orgId],
      });
    },
    onError: (err) => toast.error(handleError(err)),
  });
}

export function useUpdateOrgStatus() {
  return useOrgMutation(
    (orgId: string, status: OrgStatus) => updateOrgStatus(orgId, status),
    "Organization status updated",
  );
}

export function useUpdateOrgPlan() {
  return useOrgMutation(
    (orgId: string, plan: OrgPlan) => updateOrgPlan(orgId, plan),
    "Plan updated",
  );
}

export function useUpdateOrgQuota() {
  return useOrgMutation(
    (orgId: string, quota: number) => updateOrgQuota(orgId, quota),
    "Storage quota updated",
  );
}

export function useUpdateOrgSettings() {
  return useOrgMutation(
    (orgId: string, body: UpdateOrgSettingsBody) =>
      updateOrgSettings(orgId, body),
    "Settings saved",
  );
}

export function useUpdateOrgSubdomain() {
  return useOrgMutation(
    (orgId: string, subdomain: string) => updateOrgSubdomain(orgId, subdomain),
    "Subdomain updated",
  );
}

export function useDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orgId: string) => deleteOrganization(orgId),
    onSuccess: () => {
      toast.success("Organization permanently deleted");
      qc.invalidateQueries({ queryKey: ["admin", "organizations"] });
    },
    onError: (err) => toast.error(handleError(err)),
  });
}
