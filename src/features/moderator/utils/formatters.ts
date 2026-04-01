export const formatCount = (value: number, locale?: string): string =>
  new Intl.NumberFormat(locale).format(value);

export const formatShortDate = (
  value: Date | string,
  locale?: string,
): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatLongDate = (
  value: Date | string,
  locale?: string,
): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatDateTime = (
  value: Date | string,
  locale?: string,
): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatRelativeTime = (
  value: Date | string,
  locale?: string,
): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffMinutes < 1) return formatter.format(0, "minute");
  if (diffHours < 1) return formatter.format(-diffMinutes, "minute");
  if (diffHours < 24) return formatter.format(-diffHours, "hour");

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return formatter.format(-diffDays, "day");

  return formatShortDate(date, locale);
};

export const pluralize = (
  count: number,
  singular: string,
  plural = `${singular}s`,
): string => {
  const category = new Intl.PluralRules().select(count);
  return category === "one" ? singular : plural;
};
