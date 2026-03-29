import type {
  Notification,
  NotificationsQueryParams,
  NotificationsResponse,
  NotificationActionResponse,
} from "./index";

export interface NotificationsDataSource {
  getNotifications: (
    params?: NotificationsQueryParams,
  ) => Promise<NotificationsResponse>;
  getUnreadNotifications: () => Promise<Notification[]>;
  getUnreadCount: () => Promise<number>;
  markAsRead: (notificationId: string) => Promise<NotificationActionResponse>;
  markAllAsRead: () => Promise<NotificationActionResponse>;
  deleteNotification: (
    notificationId: string,
  ) => Promise<NotificationActionResponse>;
}
