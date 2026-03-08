/**
 * Notifications Feature — Type Definitions
 */

/** The source/intent of a notification */
export type NotificationType =
  | "recommendation" // AI recommended a new place for you
  | "favorite_update" // A saved place has an update
  | "review_response" // Someone replied to your review
  | "like" // Someone liked your review
  | "new_place" // A new place matching your interests opened
  | "system"; // App-level announcements

/** A single in-app notification item */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  /** Client-side route to navigate when the notification is tapped */
  actionUrl?: string;
  /** Optional sender avatar URL for user-related notifications */
  avatarUrl?: string;
}

/** Response envelope returned by the notifications feed endpoint */
export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

/** Generic success/fail response from mutating notification endpoints */
export interface NotificationActionResponse {
  success: boolean;
}
