/**
 * Notifications Feature — Type Definitions
 */

import type { PaginatedResponse } from "@/types";

/** The source/intent of a notification */
export type NotificationType =
  | "recommendation" // AI recommended a new place for you
  | "favorite_update" // A saved place has an update
  | "review_response" // Someone replied to your review
  | "like" // Someone liked your review
  | "new_place" // A new place matching your interests opened
  | "system" // App-level announcements
  | (string & {});

/** A single in-app notification item */
export interface Notification {
  id: string;
  reviewReportId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  /** Client-side route to navigate when the notification is tapped */
  actionUrl?: string;
  /** Optional sender avatar URL for user-related notifications */
  avatarUrl?: string;
}

/** Query params for paginated notifications feed */
export interface NotificationsQueryParams {
  pageIndex?: number;
  pageSize?: number;
}

/** Paginated feed shape returned by GET /api/v1/Notification */
export type NotificationsResponse = PaginatedResponse<Notification>;

/** Generic success/fail response from mutating notification endpoints */
export type NotificationActionResponse = string | null;
