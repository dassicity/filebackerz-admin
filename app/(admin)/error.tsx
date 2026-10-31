"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Catches render errors in any admin page so one bad field doesn't blank the
// whole console. The shell (header, sidebar) stays usable.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card>
      <CardContent
        role="alert"
        className="py-16 flex flex-col items-center justify-center text-center gap-3"
      >
        <AlertTriangle className="w-6 h-6 text-destructive" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            This page hit an error
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Something in the data couldn&apos;t be displayed. Try again, or
            open another section from the sidebar.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCw className="w-3.5 h-3.5 mr-1.5" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
