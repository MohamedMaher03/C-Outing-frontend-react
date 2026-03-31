const numberFormatter = new Intl.NumberFormat(undefined);

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const pluralRules = new Intl.PluralRules(undefined);

export const formatCount = (value: number): string =>
  numberFormatter.format(value);

export const formatShortDate = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return shortDateFormatter.format(date);
};

export const formatLongDate = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return longDateFormatter.format(date);
};

export const formatDateTime = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return dateTimeFormatter.format(date);
};

export const formatRelativeTime = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return shortDateFormatter.format(date);
};

export const pluralize = (
  count: number,
  singular: string,
  plural = `${singular}s`,
): string => {
  const category = pluralRules.select(count);
  return category === "one" ? singular : plural;
};
