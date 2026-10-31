"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => unknown;
  title?: string;
  className?: string;
}

// Shown in place of data when a request fails, so a failed load never looks
// like an empty result or a real zero.
export function ErrorState({
  error,
  onRetry,
  title = "Couldn't load this data",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "py-10 px-4 flex flex-col items-center justify-center text-center gap-2",
        className,
      )}
    >
      <AlertTriangle className="w-5 h-5 text-destructive" />
      <div className="text-sm font-medium text-foreground">{title}</div>
      <p className="text-xs text-muted-foreground max-w-sm">
        {getApiErrorMessage(error, "The request failed. Try again in a moment.")}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-1"
          onClick={() => onRetry()}
        >
          <RotateCw className="w-3.5 h-3.5 mr-1.5" />
          Retry
        </Button>
      )}
    </div>
  );
}

export function ErrorCard(props: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <ErrorState {...props} />
      </CardContent>
    </Card>
  );
}
