export { useNotifications } from "./hooks/useNotifications";
export type { NotificationFilterTab } from "./hooks/useNotifications";
export { useNotificationsCount } from "./hooks/useNotificationsCount";

export { NotificationsCountProvider } from "./context/NotificationsCountContext";

export { notificationsApi } from "./api/notificationsApi";

export {
  notificationsService,
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "./services/notificationsService";
export { notificationsDataSource } from "./services/notificationsDataSource";

export type { NotificationsDataSource } from "./types/dataSource";

export {
  groupNotificationsByDate,
  formatRelativeNotificationTime,
} from "./utils/notificationPresentation";

export { default as NotificationBell } from "./components/NotificationBell";
export { default as NotificationItem } from "./components/NotificationItem";

export type {
  Notification,
  NotificationType,
  NotificationsQueryParams,
  NotificationsResponse,
  NotificationActionResponse,
} from "./types";

export { notificationsMock } from "./mocks/notificationsMock";
