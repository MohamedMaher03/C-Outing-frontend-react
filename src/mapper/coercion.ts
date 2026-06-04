export const coerceTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const coerceFirstNonEmptyString = (
  ...values: unknown[]
): string | undefined =>
  values.reduce<string | undefined>(
    (resolved, value) => resolved ?? coerceTrimmedString(value),
    undefined,
  );

export const coerceFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

export const coerceFiniteNumberWithFallback = (
  value: unknown,
  fallback = 0,
): number => coerceFiniteNumber(value) ?? fallback;

export const coerceFirstFiniteNumber = (
  ...values: unknown[]
): number | undefined =>
  values.reduce<number | undefined>(
    (resolved, value) => resolved ?? coerceFiniteNumber(value),
    undefined,
  );

export const coerceBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return undefined;
};

export const coerceFirstBoolean = (
  ...values: unknown[]
): boolean | undefined =>
  values.reduce<boolean | undefined>(
    (resolved, value) => resolved ?? coerceBoolean(value),
    undefined,
  );

export const coerceStringArray = (
  value: unknown,
  maxItems = 25,
): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, maxItems);
};

export const clampInteger = (
  value: unknown,
  min: number,
  max: number,
): number => {
  const parsed = coerceFiniteNumber(value);
  if (parsed === undefined) return min;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
};

export const clampRating = (
  value: unknown,
  min = 0,
  max = 5,
  round = true,
): number => {
  const parsed = coerceFiniteNumber(value);
  if (parsed === undefined) return min;
  const bounded = Math.min(max, Math.max(min, round ? Math.round(parsed) : parsed));
  return bounded;
};

export const coerceNonNegativeInteger = (
  value: unknown,
  fallback = 0,
): number => Math.max(0, Math.floor(coerceFiniteNumberWithFallback(value, fallback)));

export const coerceBoundedRating = (value: unknown): number =>
  clampRating(value, 0, 5, false);
