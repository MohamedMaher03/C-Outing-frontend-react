import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type {
  Notification,
  NotificationsQueryParams,
  NotificationsResponse,
  NotificationActionResponse,
} from "../types";

export const notificationsApi = {
  async getNotifications(
    params?: NotificationsQueryParams,
  ): Promise<NotificationsResponse> {
    const { data } = await axiosInstance.get<NotificationsResponse>(
      API_ENDPOINTS.notifications.getAll,
      { params },
    );
    return data;
  },

  async getUnreadNotifications(): Promise<Notification[]> {
    const { data } = await axiosInstance.get<Notification[]>(
      API_ENDPOINTS.notifications.getUnread,
    );
    return data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await axiosInstance.get<number>(
      API_ENDPOINTS.notifications.getUnreadCount,
    );
    return data;
  },

  async markAsRead(
    notificationId: string,
  ): Promise<NotificationActionResponse> {
    const { data } = await axiosInstance.put<NotificationActionResponse>(
      API_ENDPOINTS.notifications.markRead(notificationId),
    );
    return data;
  },

  async markAllAsRead(): Promise<NotificationActionResponse> {
    const { data } = await axiosInstance.put<NotificationActionResponse>(
      API_ENDPOINTS.notifications.markAllRead,
    );
    return data;
  },

  async deleteNotification(
    notificationId: string,
  ): Promise<NotificationActionResponse> {
    const { data } = await axiosInstance.delete<NotificationActionResponse>(
      API_ENDPOINTS.notifications.delete(notificationId),
    );
    return data;
  },
};
