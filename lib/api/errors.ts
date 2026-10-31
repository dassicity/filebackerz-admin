interface ApiErrorShape {
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
      errors?: unknown;
    };
  };
}

export function isNotFoundError(err: unknown): boolean {
  return (err as ApiErrorShape | undefined)?.response?.status === 404;
}

// Pulls a human-readable message out of an axios error. The admin API puts it
// in `error` (most routes) or `message` (content routes), and validation
// failures may add an `errors[]` array with per-field detail.
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const e = err as ApiErrorShape | undefined;
  const data = e?.response?.data;
  const base = data?.error ?? data?.message;
  const details = Array.isArray(data?.errors)
    ? data.errors.filter((d): d is string => typeof d === "string")
    : [];

  if (base && details.length > 0) return `${base}: ${details.join("; ")}`;
  if (base) return base;
  if (details.length > 0) return details.join("; ");
  if (e && !e.response && e.message === "Network Error") {
    return "Can't reach the admin API. Check your connection and try again.";
  }
  return fallback;
}
