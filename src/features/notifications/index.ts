/**
 * Notifications Feature — Public API
 */

// Hooks
export { useNotifications } from "./hooks/useNotifications";
export type { NotificationFilterTab } from "./hooks/useNotifications";
export { useNotificationsCount } from "./hooks/useNotificationsCount";

// Context
export { NotificationsCountProvider } from "./context/NotificationsCountContext";

// API layer (exposed for advanced usage / testing)
export { notificationsApi } from "./api/notificationsApi";

// Services
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

// Shared presentation helpers
export {
  groupNotificationsByDate,
  formatRelativeNotificationTime,
} from "./utils/notificationPresentation";

// Components
export { default as NotificationBell } from "./components/NotificationBell";
export { default as NotificationItem } from "./components/NotificationItem";

// Types
export type {
  Notification,
  NotificationType,
  NotificationsQueryParams,
  NotificationsResponse,
  NotificationActionResponse,
} from "./types";

// Mocks (development use)
export { notificationsMock } from "./mocks/notificationsMock";
