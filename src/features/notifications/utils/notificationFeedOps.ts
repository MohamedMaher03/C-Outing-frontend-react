import type { Notification } from "@/features/notifications/types";
import type { NotificationFilterTab } from "@/features/notifications/types";

export const normalizeNotificationId = (rawId: string): string => rawId.trim();

export const tallyUnreadNotifications = (
  items: readonly Notification[],
): number => items.reduce((total, { isRead }) => total + (isRead ? 0 : 1), 0);

export const filterNotificationsByTab = (
  items: readonly Notification[],
  tab: NotificationFilterTab,
): Notification[] =>
  tab === "unread" ? items.filter(({ isRead }) => !isRead) : [...items];

export const pickFirstSurfaceError = (
  actionError: string | null,
  loadError: string | null,
): string | null => actionError ?? loadError;
