/**
 * Notifications API Layer
 *
 * Pure HTTP functions — no business logic, no side effects, no storage.
 * Each function maps 1-to-1 with a backend endpoint.
 *
 * The shared axios instance (src/config/axios.config.ts) handles:
 *   • Attaching the Authorization header on every request
 *   • Handling 401 responses globally
 *
 * To switch to mocks during development, swap the import in notificationsService.ts:
 *   import { notificationsMock as notificationsApi } from "../mocks/notificationsMock";
 */

import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type {
  NotificationsResponse,
  NotificationActionResponse,
} from "../types";

// Placeholder — replace with the real user id from auth context when backend is live
const CURRENT_USER_ID = 1;

export const notificationsApi = {
  /**
   * GET /users/:userId/notifications
   * Returns the notification feed with total unread count.
   */
  async getNotifications(): Promise<NotificationsResponse> {
    const { data } = await axiosInstance.get<NotificationsResponse>(
      API_ENDPOINTS.notifications.getAll(CURRENT_USER_ID),
    );
    return data;
  },

  /**
   * PATCH /notifications/:notificationId/read
   * Marks a single notification as read.
   */
  async markAsRead(
    notificationId: string,
  ): Promise<NotificationActionResponse> {
    const { data } = await axiosInstance.patch<NotificationActionResponse>(
      API_ENDPOINTS.notifications.markRead(notificationId),
    );
    return data;
  },

  /**
   * PATCH /users/:userId/notifications/read-all
   * Marks every notification for the current user as read.
   */
  async markAllAsRead(): Promise<NotificationActionResponse> {
    const { data } = await axiosInstance.patch<NotificationActionResponse>(
      API_ENDPOINTS.notifications.markAllRead(CURRENT_USER_ID),
    );
    return data;
  },

  /**
   * DELETE /notifications/:notificationId
   * Permanently removes a single notification.
   */
  async deleteNotification(
    notificationId: string,
  ): Promise<NotificationActionResponse> {
    const { data } = await axiosInstance.delete<NotificationActionResponse>(
      API_ENDPOINTS.notifications.delete(notificationId),
    );
    return data;
  },
};
