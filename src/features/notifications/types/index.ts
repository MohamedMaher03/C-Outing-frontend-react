import type { PaginatedResponse } from "@/types";

export type NotificationType =
  | "recommendation"
  | "favorite_update"
  | "review_response"
  | "like"
  | "new_place"
  | "system"
  | (string & {});

export interface Notification {
  id: string;
  reviewReportId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  actionUrl?: string;
  avatarUrl?: string;
}

export interface NotificationsQueryParams {
  pageIndex?: number;
  pageSize?: number;
}

export type NotificationsResponse = PaginatedResponse<Notification>;

export type NotificationActionResponse = string | null;

export type { NotificationsDataSource } from "./dataSource";
