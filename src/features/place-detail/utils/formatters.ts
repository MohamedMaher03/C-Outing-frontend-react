const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();
const numberFormatterCache = new Map<string, Intl.NumberFormat>();
const pluralRulesCache = new Map<string, Intl.PluralRules>();

const getLocale = (): string => {
  if (typeof document !== "undefined") {
    const lang = document.documentElement.lang?.trim();
    if (lang) return lang;
  }

  if (typeof navigator !== "undefined") {
    return navigator.language || "en";
  }

  return "en";
};

const toValidDate = (input: Date | string | number): Date | null => {
  const parsed = input instanceof Date ? input : new Date(input);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
};

const getDateFormatter = (
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat => {
  const locale = getLocale();
  const cacheKey = `${locale}:${JSON.stringify(options)}`;
  const cached = dateFormatterCache.get(cacheKey);
  if (cached) return cached;

  const next = new Intl.DateTimeFormat(locale, options);
  dateFormatterCache.set(cacheKey, next);
  return next;
};

const getNumberFormatter = (): Intl.NumberFormat => {
  const locale = getLocale();
  const cached = numberFormatterCache.get(locale);
  if (cached) return cached;

  const next = new Intl.NumberFormat(locale);
  numberFormatterCache.set(locale, next);
  return next;
};

const getPluralRules = (): Intl.PluralRules => {
  const locale = getLocale();
  const cached = pluralRulesCache.get(locale);
  if (cached) return cached;

  const next = new Intl.PluralRules(locale);
  pluralRulesCache.set(locale, next);
  return next;
};

export const formatShortDate = (
  input: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
): string => {
  const date = toValidDate(input);
  if (!date) return "-";

  return getDateFormatter(options).format(date);
};

export const formatInteger = (value: number): string =>
  getNumberFormatter().format(Number.isFinite(value) ? value : 0);

export const formatCountLabel = (
  value: number,
  singular: string,
  plural = `${singular}s`,
): string => {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const rule = getPluralRules().select(safeValue);
  return `${formatInteger(safeValue)} ${rule === "one" ? singular : plural}`;
};
