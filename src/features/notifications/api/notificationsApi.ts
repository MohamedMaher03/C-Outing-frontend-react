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
  Notification,
  NotificationsQueryParams,
  NotificationsResponse,
  NotificationActionResponse,
} from "../types";

export const notificationsApi = {
  /**
   * GET /api/v1/Notification
   * Returns a paginated notifications feed.
   */
  async getNotifications(
    params?: NotificationsQueryParams,
  ): Promise<NotificationsResponse> {
    const { data } = await axiosInstance.get<NotificationsResponse>(
      API_ENDPOINTS.notifications.getAll,
      { params },
    );
    return data;
  },

  /**
   * GET /api/v1/Notification/unread
   * Returns unread notifications only.
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    const { data } = await axiosInstance.get<Notification[]>(
      API_ENDPOINTS.notifications.getUnread,
    );
    return data;
  },

  /**
   * GET /api/v1/Notification/unread-count
   * Returns unread notifications count.
   */
  async getUnreadCount(): Promise<number> {
    const { data } = await axiosInstance.get<number>(
      API_ENDPOINTS.notifications.getUnreadCount,
    );
    return data;
  },

  /**
   * PUT /api/v1/Notification/:notificationId/read
   * Marks a single notification as read.
   */
  async markAsRead(
    notificationId: string,
  ): Promise<NotificationActionResponse> {
    const { data } = await axiosInstance.put<NotificationActionResponse>(
      API_ENDPOINTS.notifications.markRead(notificationId),
    );
    return data;
  },

  /**
   * PUT /api/v1/Notification/read-all
   * Marks every notification for the current user as read.
   */
  async markAllAsRead(): Promise<NotificationActionResponse> {
    const { data } = await axiosInstance.put<NotificationActionResponse>(
      API_ENDPOINTS.notifications.markAllRead,
    );
    return data;
  },

  /**
   * DELETE /api/v1/Notification/:notificationId
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
