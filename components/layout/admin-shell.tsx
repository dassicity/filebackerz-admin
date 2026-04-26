"use client";

import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";
import { AuthGuard } from "./auth-guard";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <AdminSidebar />
        <main className="pt-16 lg:pl-64">
          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
