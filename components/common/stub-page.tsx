import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "./page-header";

interface StubPageProps {
  title: string;
  description?: string;
  icon: LucideIcon;
}

export function StubPage({ title, description, icon: Icon }: StubPageProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Coming soon
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            This section is scaffolded. Wiring to the admin API happens in the
            next phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
