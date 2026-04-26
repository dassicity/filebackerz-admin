"use client";

import { useState } from "react";
import {
  KeyRound,
  Mail,
  MoreHorizontal,
  ShieldOff,
  LogOut,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import {
  useUpdateUserStatus,
  useUpdateUserRole,
  useForceResetPassword,
  useForceVerifyEmail,
  useDisableUser2FA,
  useRevokeUserSessions,
} from "@/lib/hooks/use-users";
import type {
  AdminListedUser,
  UserRole,
  UserStatus,
} from "@/lib/api/users";
import { cn } from "@/lib/utils";

interface UserActionsProps {
  user: Pick<
    AdminListedUser,
    "_id" | "name" | "email" | "role" | "status" | "authProvider" | "isEmailVerified" | "twoFactorAuth"
  >;
}

type DialogKind =
  | "suspend"
  | "activate"
  | "change-role"
  | "reset-password"
  | "verify-email"
  | "disable-2fa"
  | "revoke-sessions"
  | null;

export function UserActions({ user }: UserActionsProps) {
  const [openDialog, setOpenDialog] = useState<DialogKind>(null);
  const [roleValue, setRoleValue] = useState<UserRole>(user.role as UserRole);

  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();
  const resetPw = useForceResetPassword();
  const verifyEmail = useForceVerifyEmail();
  const disable2fa = useDisableUser2FA();
  const revokeSessions = useRevokeUserSessions();

  const close = () => setOpenDialog(null);

  const doStatus = (status: UserStatus) =>
    updateStatus.mutate(
      { userId: user._id, args: [status] },
      { onSuccess: close },
    );

  const doRole = () => {
    if (roleValue === user.role) {
      close();
      return;
    }
    updateRole.mutate(
      { userId: user._id, args: [roleValue] },
      { onSuccess: close },
    );
  };

  const doResetPw = () =>
    resetPw.mutate({ userId: user._id, args: [] }, { onSuccess: close });
  const doVerify = () =>
    verifyEmail.mutate({ userId: user._id, args: [] }, { onSuccess: close });
  const doDisable2fa = () =>
    disable2fa.mutate({ userId: user._id, args: [] }, { onSuccess: close });
  const doRevoke = () =>
    revokeSessions.mutate({ userId: user._id, args: [] }, { onSuccess: close });

  const isLocal = user.authProvider === "local";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="w-4 h-4 mr-1.5" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[220px]">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Manage user
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {user.status === "active" ? (
            <DropdownMenuItem onClick={() => setOpenDialog("suspend")}>
              <UserX className="w-4 h-4 mr-2" />
              Deactivate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setOpenDialog("activate")}>
              <UserCheck className="w-4 h-4 mr-2" />
              Activate
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => {
              setRoleValue(user.role as UserRole);
              setOpenDialog("change-role");
            }}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Change role
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {!user.isEmailVerified && (
            <DropdownMenuItem onClick={() => setOpenDialog("verify-email")}>
              <Mail className="w-4 h-4 mr-2" />
              Force verify email
            </DropdownMenuItem>
          )}

          {isLocal && (
            <DropdownMenuItem onClick={() => setOpenDialog("reset-password")}>
              <KeyRound className="w-4 h-4 mr-2" />
              Send password reset
            </DropdownMenuItem>
          )}

          {user.twoFactorAuth?.enabled && (
            <DropdownMenuItem onClick={() => setOpenDialog("disable-2fa")}>
              <ShieldOff className="w-4 h-4 mr-2" />
              Disable 2FA
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setOpenDialog("revoke-sessions")}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Revoke all sessions
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Deactivate */}
      <AlertDialog open={openDialog === "suspend"} onOpenChange={(o) => !o && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {user.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The user will lose access immediately. You can reactivate them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={() => doStatus("inactive")}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? "Deactivating…" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate */}
      <AlertDialog open={openDialog === "activate"} onOpenChange={(o) => !o && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate {user.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The user will regain access to their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => doStatus("active")}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? "Activating…" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change role */}
      <Dialog open={openDialog === "change-role"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change platform role</DialogTitle>
            <DialogDescription>
              {user.name} · {user.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              New role
            </label>
            <Select value={roleValue} onValueChange={(v) => setRoleValue(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Superadmin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only superadmins can promote to superadmin. You cannot change your own role.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button onClick={doRole} disabled={updateRole.isPending}>
              {updateRole.isPending ? "Saving…" : "Save role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset password */}
      <AlertDialog open={openDialog === "reset-password"} onOpenChange={(o) => !o && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send password reset email?</AlertDialogTitle>
            <AlertDialogDescription>
              A reset link will be sent to {user.email}. Their current password remains valid until they use the link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doResetPw} disabled={resetPw.isPending}>
              {resetPw.isPending ? "Sending…" : "Send reset email"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verify email */}
      <AlertDialog open={openDialog === "verify-email"} onOpenChange={(o) => !o && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force verify email?</AlertDialogTitle>
            <AlertDialogDescription>
              Marks {user.email} as verified and activates the account. Use only after out-of-band verification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doVerify} disabled={verifyEmail.isPending}>
              {verifyEmail.isPending ? "Verifying…" : "Verify email"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disable 2FA */}
      <AlertDialog open={openDialog === "disable-2fa"} onOpenChange={(o) => !o && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable 2FA for {user.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the user's 2FA secret and backup codes. They will be able to sign in with just their password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={doDisable2fa}
              disabled={disable2fa.isPending}
            >
              {disable2fa.isPending ? "Disabling…" : "Disable 2FA"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke sessions */}
      <AlertDialog open={openDialog === "revoke-sessions"} onOpenChange={(o) => !o && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke all sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              Signs {user.name} out of every device. They will need to log in again everywhere.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={doRevoke}
              disabled={revokeSessions.isPending}
            >
              {revokeSessions.isPending ? "Revoking…" : "Revoke all"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
