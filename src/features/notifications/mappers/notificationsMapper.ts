import type { PaginatedResponse } from "@/types";
import type { Notification } from "../types";
import {
  clampInteger,
  coerceIsoDateString,
  dedupeByKey,
  normalizeUnreadCount,
} from "@/mapper";
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

  return {
    ...notification,
    id,
    type: rawType,
    title: isNonEmptyString(notification?.title)
      ? notification.title.trim()
      : (FALLBACK_TITLE_BY_TYPE[rawType] ?? "Notification"),
    message: isNonEmptyString(notification?.message)
      ? notification.message.trim()
      : "Open to view details.",
    isRead: Boolean(notification?.isRead),
    createdAt: coerceIsoDateString(notification?.createdAt),
    readAt: notification?.readAt
      ? coerceIsoDateString(notification.readAt)
      : null,
    actionUrl: isNonEmptyString(notification?.actionUrl)
      ? notification.actionUrl.trim()
      : undefined,
    avatarUrl: isNonEmptyString(notification?.avatarUrl)
      ? notification.avatarUrl.trim()
      : undefined,
  };
};

const sortNewestFirst = (items: Notification[]): Notification[] =>
  [...items].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

const normalizeNotificationItems = (items: unknown): Notification[] => {
  if (!Array.isArray(items)) return [];

  const normalized = items.flatMap((raw, index) => {
    if (!raw || typeof raw !== "object") return [];
    const mapped = normalizeNotification(
      raw as Notification,
      `generated-notification-${index + 1}`,
    );
    return mapped ? [mapped] : [];
  });

  return sortNewestFirst(
    dedupeByKey(normalized, (notification) => notification.id),
  );
};

export const normalizePageIndex = (value: unknown): number =>
  clampInteger(value, DEFAULT_PAGE_INDEX, Number.MAX_SAFE_INTEGER);

export const normalizePageSize = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_PAGE_SIZE;
  }
  return clampInteger(value, 1, MAX_PAGE_SIZE);
};

export const normalizeNotificationId = (value: string): string => {
  const id = value.trim();
  if (!id) throw new Error("Notification id is required.");
  return id;
};

export { normalizeUnreadCount };

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
  const totalPages = clampInteger(page?.totalPages, 0, computedTotalPages || 1);
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
