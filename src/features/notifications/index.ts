/**
 * Notifications Feature — Public API
 */

// Hooks
export { useNotifications } from "./hooks/useNotifications";
export type { NotificationFilterTab } from "./hooks/useNotifications";

// Context
export {
  NotificationsCountProvider,
  useNotificationsCount,
} from "./context/NotificationsCountContext";

// API layer (exposed for advanced usage / testing)
export { notificationsApi } from "./api/notificationsApi";

// Services
export {
  notificationsService,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "./services/notificationsService";

// Components
export { default as NotificationBell } from "./components/NotificationBell";
export { default as NotificationItem } from "./components/NotificationItem";

// Types
export type {
  Notification,
  NotificationType,
  NotificationsResponse,
  NotificationActionResponse,
} from "./types";

// Mocks (development use)
export { notificationsMock } from "./mocks/notificationsMock";
