/**
 * Notifications Service — Business Logic Layer
 *
 * Sits between hooks/components and the HTTP layer (notificationsApi).
 * Responsibilities:
 *   • Call notificationsApi functions
 *   • Transform DTOs to UI models if needed
 *   • Centralise error handling
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  useNotifications  →  notificationsService  →  notificationsApi     │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * 🔧 To use the real API, swap the import:
 *   import { notificationsApi } from "../api/notificationsApi";
 */

// import { notificationsApi } from "../api/notificationsApi"; // (WHEN INTEGRATE WITH BACKEND USE THIS)
import { notificationsMock as notificationsApi } from "../mocks/notificationsMock";
import type {
  NotificationsResponse,
  NotificationActionResponse,
} from "../types";

// ── Notifications Service ────────────────────────────────────

export const notificationsService = {
  /**
   * Fetch the notification feed for the current user.
   */
  async getNotifications(): Promise<NotificationsResponse> {
    try {
      return await notificationsApi.getNotifications();
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw new Error("Failed to load notifications");
    }
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(
    notificationId: string,
  ): Promise<NotificationActionResponse> {
    try {
      return await notificationsApi.markAsRead(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw new Error("Failed to mark notification as read");
    }
  },

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<NotificationActionResponse> {
    try {
      return await notificationsApi.markAllAsRead();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw new Error("Failed to mark all notifications as read");
    }
  },

  /**
   * Delete a single notification.
   */
  async deleteNotification(
    notificationId: string,
  ): Promise<NotificationActionResponse> {
    try {
      return await notificationsApi.deleteNotification(notificationId);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw new Error("Failed to delete notification");
    }
  },
};

// ── Named exports for direct hook consumption ────────────────

export const getNotifications =
  notificationsService.getNotifications.bind(notificationsService);
export const markNotificationAsRead =
  notificationsService.markAsRead.bind(notificationsService);
export const markAllNotificationsAsRead =
  notificationsService.markAllAsRead.bind(notificationsService);
export const deleteNotification =
  notificationsService.deleteNotification.bind(notificationsService);
