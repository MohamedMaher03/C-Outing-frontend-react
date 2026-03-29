import type { Notification } from "../types";

export type NotificationDateGroup = "Today" | "Yesterday" | "Earlier";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const formatterCache = new Map<string, Intl.RelativeTimeFormat>();
const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

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

const getRelativeFormatter = (locale: string): Intl.RelativeTimeFormat => {
  const cached = formatterCache.get(locale);
  if (cached) return cached;

  const next = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
    style: "short",
  });
  formatterCache.set(locale, next);
  return next;
};

const getDateFormatter = (locale: string): Intl.DateTimeFormat => {
  const cached = dateFormatterCache.get(locale);
  if (cached) return cached;

  const next = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  });
  dateFormatterCache.set(locale, next);
  return next;
};

const toValidDate = (input: Date | string | number): Date | null => {
  const date = input instanceof Date ? input : new Date(input);
  return Number.isFinite(date.getTime()) ? date : null;
};

export function formatRelativeNotificationTime(
  input: Date | string | number,
): string {
  const date = toValidDate(input);
  if (!date) return "Recently";

  const locale = getLocale();
  const formatter = getRelativeFormatter(locale);
  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);

  if (absMs < 60_000) {
    return formatter.format(Math.round(diffMs / 1000), "second");
  }

  if (absMs < 60 * 60_000) {
    return formatter.format(Math.round(diffMs / 60_000), "minute");
  }

  if (absMs < DAY_IN_MS) {
    return formatter.format(Math.round(diffMs / (60 * 60_000)), "hour");
  }

  if (absMs < 7 * DAY_IN_MS) {
    return formatter.format(Math.round(diffMs / DAY_IN_MS), "day");
  }

  return getDateFormatter(locale).format(date);
}

function getDateGroup(input: Date): NotificationDateGroup {
  if (!Number.isFinite(input.getTime())) {
    return "Earlier";
  }

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);

  if (input >= startOfToday) return "Today";
  if (input >= startOfYesterday) return "Yesterday";
  return "Earlier";
}

export function groupNotificationsByDate(
  notifications: Notification[],
): [NotificationDateGroup, Notification[]][] {
  const groups: Partial<Record<NotificationDateGroup, Notification[]>> = {};

  for (const notification of notifications) {
    const key = getDateGroup(new Date(notification.createdAt));
    if (!groups[key]) groups[key] = [];
    groups[key]!.push(notification);
  }

  const order: NotificationDateGroup[] = ["Today", "Yesterday", "Earlier"];
  return order.filter((key) => groups[key]).map((key) => [key, groups[key]!]);
}
