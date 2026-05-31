const GREETING_HOUR_BRACKETS = [
  { from: 6, to: 12, key: "home.greeting.morning" },
  { from: 12, to: 18, key: "home.greeting.afternoon" },
] as const;

export const resolveGreetingKey = (hour: number): string =>
  GREETING_BRACKET.find(({ from, to }) => hour >= from && hour < to)?.key ??
  "home.greeting.evening";

const GREETING_BRACKET = GREETING_HOUR_BRACKETS;

export const extractFirstName = (
  fullName: string | undefined | null,
  fallback: string,
): string => fullName?.split(" ")[0] ?? fallback;

export const safeParsePositiveInt = (raw: string | undefined): number | undefined => {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

export const buildVenueSearchParams = (
  fields: Record<string, string | undefined>,
): URLSearchParams => {
  const params = new URLSearchParams();
  Object.entries(fields).forEach(([key, value]) => {
    if (value?.trim()) params.set(key, value.trim());
  });
  return params;
};
