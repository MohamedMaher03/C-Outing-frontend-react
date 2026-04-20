import type { PaginatedResponse } from "@/types";
import type { Notification } from "../types";
import { isNonEmptyString } from "@/utils/typeGuards";

const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

const FALLBACK_TITLE_BY_TYPE: Record<string, string> = {
  recommendation: "New recommendation",
  favorite_update: "Saved place update",
  review_response: "New response",
  like: "New like",
  new_place: "New place",
  system: "Notification",
};

const clampInt = (value: unknown, min: number, max: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.floor(value)));
};

const normalizeDateIso = (value: unknown): string => {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (Number.isFinite(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date(0).toISOString();
};

const normalizeNotification = (
  notification: Notification,
  fallbackId: string,
): Notification | null => {
  const rawId =
    typeof notification?.id === "string" ? notification.id.trim() : "";
  const id = rawId || fallbackId;

  const rawType =
    typeof notification?.type === "string" &&
    notification.type.trim().length > 0
      ? notification.type.trim()
      : "system";

  const title = isNonEmptyString(notification?.title)
    ? notification.title.trim()
    : (FALLBACK_TITLE_BY_TYPE[rawType] ?? "Notification");

  const message = isNonEmptyString(notification?.message)
    ? notification.message.trim()
    : "Open to view details.";

  return {
    ...notification,
    id,
    type: rawType,
    title,
    message,
    isRead: Boolean(notification?.isRead),
    createdAt: normalizeDateIso(notification?.createdAt),
    readAt: notification?.readAt ? normalizeDateIso(notification.readAt) : null,
    actionUrl:
      typeof notification?.actionUrl === "string" &&
      notification.actionUrl.trim().length > 0
        ? notification.actionUrl.trim()
        : undefined,
    avatarUrl:
      typeof notification?.avatarUrl === "string" &&
      notification.avatarUrl.trim().length > 0
        ? notification.avatarUrl.trim()
        : undefined,
  };
};

const sortNewestFirst = (items: Notification[]): Notification[] =>
  [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

const normalizeNotificationItems = (items: unknown): Notification[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  const seenIds = new Set<string>();
  const normalized: Notification[] = [];

  for (let index = 0; index < items.length; index += 1) {
    const raw = items[index];
    if (!raw || typeof raw !== "object") {
      continue;
    }

    const mapped = normalizeNotification(
      raw as Notification,
      `generated-notification-${index + 1}`,
    );

    if (!mapped || seenIds.has(mapped.id)) {
      continue;
    }

    seenIds.add(mapped.id);
    normalized.push(mapped);
  }

  return sortNewestFirst(normalized);
};

export const normalizePageIndex = (value: unknown): number =>
  clampInt(value, DEFAULT_PAGE_INDEX, Number.MAX_SAFE_INTEGER);

export const normalizePageSize = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_PAGE_SIZE;
  }

  return clampInt(value, 1, MAX_PAGE_SIZE);
};

export const normalizeNotificationId = (value: string): string => {
  const id = value.trim();

  if (!id) {
    throw new Error("Notification id is required.");
  }

  return id;
};

export const normalizeUnreadCount = (value: unknown): number =>
  clampInt(value, 0, Number.MAX_SAFE_INTEGER);

export const mapNotificationsPage = (
  page: PaginatedResponse<Notification>,
): PaginatedResponse<Notification> => {
  const pageSize = normalizePageSize(page?.pageSize);
  const items = normalizeNotificationItems(page?.items);
  const totalCount = Math.max(
    normalizeUnreadCount(page?.totalCount),
    items.length,
  );
  const computedTotalPages =
    totalCount === 0 ? 0 : Math.max(1, Math.ceil(totalCount / pageSize));
  const totalPages = clampInt(page?.totalPages, 0, computedTotalPages || 1);
  const normalizedPageIndex =
    totalPages === 0
      ? 0
      : Math.min(normalizePageIndex(page?.pageIndex), totalPages);

  return {
    items,
    pageIndex: normalizedPageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage:
      Boolean(page?.hasPreviousPage) &&
      normalizedPageIndex > DEFAULT_PAGE_INDEX,
    hasNextPage:
      Boolean(page?.hasNextPage) &&
      totalPages > 0 &&
      normalizedPageIndex < totalPages,
  };
};
