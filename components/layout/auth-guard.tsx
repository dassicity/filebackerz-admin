"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore, selectIsAdmin } from "@/lib/store/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasCheckedSession = useAuthStore((s) => s.hasCheckedSession);
  const checkSession = useAuthStore((s) => s.checkSession);
  const isAdmin = useAuthStore(selectIsAdmin);

  useEffect(() => {
    if (!hasCheckedSession) {
      checkSession();
    }
  }, [hasCheckedSession, checkSession]);

  useEffect(() => {
    if (hasCheckedSession && !isLoading && (!isAuthenticated || !isAdmin)) {
      router.replace("/auth");
    }
  }, [hasCheckedSession, isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading || !hasCheckedSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
