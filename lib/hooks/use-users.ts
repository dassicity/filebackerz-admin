import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listUsers,
  getUser,
  updateUserStatus,
  updateUserRole,
  forceResetPassword,
  forceVerifyEmail,
  disableUser2FA,
  getUserSessions,
  revokeUserSessions,
  getUserOrganizations,
  getUserAuditLogs,
  type ListUsersParams,
  type UserRole,
  type UserStatus,
  type UserAuditLogsParams,
} from "@/lib/api/users";

export function useUsersList(params: ListUsersParams) {
  return useQuery({
    queryKey: ["admin", "users", "list", params],
    queryFn: async () => await listUsers(params),
  });
}

export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "users", "detail", userId],
    queryFn: async () => {
      if (!userId) throw new Error("userId required");
      return (await getUser(userId)).data;
    },
    enabled: !!userId,
  });
}

export function useUserSessions(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "users", userId, "sessions"],
    queryFn: async () => {
      if (!userId) throw new Error("userId required");
      return (await getUserSessions(userId)).data;
    },
    enabled: !!userId,
  });
}

export function useUserOrganizations(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "users", userId, "organizations"],
    queryFn: async () => {
      if (!userId) throw new Error("userId required");
      return (await getUserOrganizations(userId)).data;
    },
    enabled: !!userId,
  });
}

export function useUserAuditLogs(
  userId: string | undefined,
  params: UserAuditLogsParams,
) {
  return useQuery({
    queryKey: ["admin", "users", userId, "audit-logs", params],
    queryFn: async () => {
      if (!userId) throw new Error("userId required");
      return await getUserAuditLogs(userId, params);
    },
    enabled: !!userId,
  });
}

function useUserMutation<Args extends unknown[]>(
  mutationFn: (userId: string, ...args: Args) => Promise<unknown>,
  successMessage: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      args,
    }: {
      userId: string;
      args: Args;
    }) => mutationFn(userId, ...args),
    onSuccess: (_data, variables) => {
      toast.success(successMessage);
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({
        queryKey: ["admin", "users", "detail", variables.userId],
      });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Action failed";
      toast.error(message);
    },
  });
}

export function useUpdateUserStatus() {
  return useUserMutation(
    (userId: string, status: UserStatus) => updateUserStatus(userId, status),
    "User status updated",
  );
}

export function useUpdateUserRole() {
  return useUserMutation(
    (userId: string, role: UserRole) => updateUserRole(userId, role),
    "User role updated",
  );
}

export function useForceResetPassword() {
  return useUserMutation(
    (userId: string) => forceResetPassword(userId),
    "Password reset email sent",
  );
}

export function useForceVerifyEmail() {
  return useUserMutation(
    (userId: string) => forceVerifyEmail(userId),
    "Email verified",
  );
}

export function useDisableUser2FA() {
  return useUserMutation(
    (userId: string) => disableUser2FA(userId),
    "2FA disabled",
  );
}

export function useRevokeUserSessions() {
  return useUserMutation(
    (userId: string) => revokeUserSessions(userId),
    "All sessions revoked",
  );
}
