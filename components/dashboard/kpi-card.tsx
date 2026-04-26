import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  icon: LucideIcon;
  value: React.ReactNode;
  sub?: React.ReactNode;
  progress?: number;
  loading?: boolean;
  accent?: "primary" | "success" | "info" | "warning" | "destructive";
}

const ACCENTS: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function KpiCard({
  label,
  icon: Icon,
  value,
  sub,
  progress,
  loading,
  accent = "primary",
}: KpiCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </span>
            <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {loading ? <Skeleton className="h-8 w-24" /> : value}
            </div>
            {sub && (
              <div className="mt-1.5 text-xs text-muted-foreground">
                {loading ? <Skeleton className="h-3 w-32 mt-1" /> : sub}
              </div>
            )}
            {progress !== undefined && !loading && (
              <Progress
                value={Math.min(100, Math.max(0, progress))}
                className="mt-3 h-1.5"
              />
            )}
          </div>
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              ACCENTS[accent],
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
