/**
 * Notifications Service — Business Logic Layer
 *
 * Sits between hooks/components and the HTTP layer (notificationsApi).
 * This layer is intentionally framework-agnostic (no React imports).
 */

import { notificationsApi } from "../api/notificationsApi";
import type {
  Notification,
  NotificationsQueryParams,
  NotificationsResponse,
  NotificationActionResponse,
} from "../types";

const DEFAULT_FEED_PARAMS: Required<NotificationsQueryParams> = {
  pageIndex: 1,
  pageSize: 50,
};

function normalizeNotifications(items: Notification[]): Notification[] {
  // Keep a stable newest-first ordering for all consumers.
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export const notificationsService = {
  defaultFeedParams: DEFAULT_FEED_PARAMS,

  async getNotifications(
    params?: NotificationsQueryParams,
  ): Promise<NotificationsResponse> {
    const response = await notificationsApi.getNotifications({
      ...DEFAULT_FEED_PARAMS,
      ...params,
    });

    return {
      ...response,
      items: normalizeNotifications(response.items ?? []),
    };
  },

  async getUnreadCount(): Promise<number> {
    return notificationsApi.getUnreadCount();
  },

  async markAsRead(
    notificationId: string,
  ): Promise<NotificationActionResponse> {
    return notificationsApi.markAsRead(notificationId);
  },

  async markAllAsRead(): Promise<NotificationActionResponse> {
    return notificationsApi.markAllAsRead();
  },

  async deleteNotification(
    notificationId: string,
  ): Promise<NotificationActionResponse> {
    return notificationsApi.deleteNotification(notificationId);
  },
};

// Named exports kept for backward compatibility.
export const getNotifications = notificationsService.getNotifications;
export const getUnreadNotificationsCount = notificationsService.getUnreadCount;
export const markNotificationAsRead = notificationsService.markAsRead;
export const markAllNotificationsAsRead = notificationsService.markAllAsRead;
export const deleteNotification = notificationsService.deleteNotification;
