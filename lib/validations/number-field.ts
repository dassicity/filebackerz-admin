export interface NumberFieldRule {
  label: string;
  /** Inclusive lower bound. */
  min?: number;
  /** Exclusive lower bound, for values that must be strictly positive. */
  greaterThan?: number;
  integer?: boolean;
  maxDecimals?: number;
}

export type NumberFieldResult =
  | { value: number; error?: undefined }
  | { value?: undefined; error: string };

// Parses a numeric text input. Blank is an error rather than 0, so a cleared
// field can never silently save as zero.
export function parseNumberField(
  raw: string,
  rule: NumberFieldRule,
): NumberFieldResult {
  const s = raw.trim();
  if (s === "") return { error: `${rule.label} is required` };

  const n = Number(s);
  if (!Number.isFinite(n)) return { error: `${rule.label} must be a number` };
  if (rule.integer && !Number.isInteger(n)) {
    return { error: `${rule.label} must be a whole number` };
  }
  if (rule.greaterThan != null && !(n > rule.greaterThan)) {
    return { error: `${rule.label} must be greater than ${rule.greaterThan}` };
  }
  if (rule.min != null && n < rule.min) {
    return { error: `${rule.label} must be at least ${rule.min}` };
  }
  if (rule.maxDecimals != null) {
    const decimals = /\.(\d+)$/.exec(s)?.[1].length ?? 0;
    if (decimals > rule.maxDecimals) {
      const places = rule.maxDecimals;
      return {
        error: `${rule.label} can have at most ${places} decimal places`,
      };
    }
  }
  return { value: n };
}
