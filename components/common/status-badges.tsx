import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function statusClass(status: string): string {
  switch (status) {
    case "active":
      return "bg-success/15 text-success border-success/30";
    case "inactive":
    case "suspended":
    case "expired":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "pending":
    case "invited":
    case "trial":
      return "bg-warning/15 text-warning border-warning/30";
    case "deleted":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] uppercase", statusClass(status))}
    >
      {status}
    </Badge>
  );
}

function roleClass(role: string): string {
  switch (role) {
    case "superadmin":
      return "bg-primary/15 text-primary border-primary/30";
    case "admin":
      return "bg-info/15 text-info border-info/30";
    case "owner":
      return "bg-primary/15 text-primary border-primary/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] uppercase", roleClass(role))}
    >
      {role}
    </Badge>
  );
}

function planClass(plan: string): string {
  switch (plan) {
    case "paid":
      return "bg-primary/15 text-primary border-primary/30";
    case "trial":
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function PlanBadge({ plan }: { plan: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] uppercase", planClass(plan))}
    >
      {plan}
    </Badge>
  );
}

function severityClass(sev: string): string {
  switch (sev) {
    case "CRITICAL":
      return "bg-destructive text-destructive-foreground border-destructive";
    case "ERROR":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "WARNING":
      return "bg-warning/15 text-warning border-warning/30";
    case "INFO":
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] uppercase", severityClass(severity))}
    >
      {severity}
    </Badge>
  );
}
