"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  HardDrive,
  ShieldAlert,
  FileWarning,
  CreditCard,
  Settings2,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  { label: "Organizations", href: "/organizations", icon: Building2 },
  { label: "Storage & BYOS", href: "/storage", icon: HardDrive },
  { label: "Security & Audit", href: "/security", icon: ShieldAlert },
  { label: "Moderation", href: "/moderation", icon: FileWarning },
  { label: "Plans & Billing", href: "/plans", icon: CreditCard },
  { label: "System Config", href: "/system", icon: Settings2 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-border bg-background z-40 flex flex-col">
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-primary">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground tracking-tight">
              FileBackerz
            </span>
            <Badge
              variant="secondary"
              className="text-[9px] uppercase tracking-widest font-semibold"
            >
              Admin
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-primary rounded-r" />
              )}
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-border text-[10px] text-muted-foreground">
        v0.1 · Internal console
      </div>
    </aside>
  );
}
