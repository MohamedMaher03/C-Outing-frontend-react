export const coerceValidDate = (
  value: unknown,
  fallback: Date = new Date(),
): Date => {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (Number.isFinite(parsed.getTime())) return parsed;
  }

  return fallback;
};

export const coerceIsoDateString = (
  value: unknown,
  fallback = new Date(0).toISOString(),
): string => coerceValidDate(value, new Date(fallback)).toISOString();

export const coerceOptionalIsoDateString = (
  value: unknown,
): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};
