"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, LineChart, ShieldCheck, Database } from "lucide-react";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { Badge } from "@/components/ui/badge";
import { useAuthStore, selectIsAdmin } from "@/lib/store/auth-store";

export default function AuthPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore(selectIsAdmin);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.replace("/overview");
    }
  }, [isAuthenticated, isAdmin, router]);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branded panel */}
      <div className="relative hidden lg:flex lg:w-[55%] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(0,0,0,0.2) 0%, transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3Cpath d='M30 0v60M0 30h60'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="absolute top-[15%] right-[10%] w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float" />
        <div
          className="absolute bottom-[15%] left-[10%] w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              FileBackerz
            </span>
            <Badge
              variant="secondary"
              className="text-[10px] uppercase tracking-widest bg-white/15 text-white border-white/10 hover:bg-white/20"
            >
              Admin
            </Badge>
          </div>

          <div className="space-y-8 max-w-xl">
            <h1 className="text-4xl lg:text-5xl xl:text-[3.5rem] font-bold text-white leading-[1.1] tracking-tight">
              Platform control,
              <br />
              <span className="text-white/60">built for trust.</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              The console for superadmins — monitor every organization, user,
              and byte of storage across the FileBackerz platform.
            </p>

            <div className="space-y-3">
              <FeatureCard
                icon={<LineChart className="w-5 h-5 text-white" />}
                title="Real-time platform KPIs"
                sub="Users, orgs, storage, sharing — always live."
              />
              <FeatureCard
                icon={<ShieldCheck className="w-5 h-5 text-white" />}
                title="Audit every action"
                sub="Cross-org logs with severity and anomaly detection."
              />
              <FeatureCard
                icon={<Database className="w-5 h-5 text-white" />}
                title="BYOS health monitoring"
                sub="Track S3, Azure, GCS, and Google Drive connections."
              />
            </div>
          </div>

          <div className="text-white/40 text-sm">
            © {new Date().getFullYear()} FileBackerz · Internal use only
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 lg:w-[45%] flex items-center justify-center p-8 lg:p-12 xl:p-16">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Admin sign-in
            </h2>
            <p className="text-muted-foreground">
              Access the FileBackerz platform console.
            </p>
          </div>
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.07] backdrop-blur-sm border border-white/[0.08] transition-all hover:bg-white/[0.12]">
      <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-white font-medium text-sm">{title}</div>
        <div className="text-white/60 text-xs mt-0.5">{sub}</div>
      </div>
    </div>
  );
}
