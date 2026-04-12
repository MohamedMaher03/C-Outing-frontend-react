/**
 * Admin Feature — Type Definitions
 */

import type { PaginatedResponse } from "@/types";
import type { CanonicalPriceLevel } from "@/utils/priceLevels";

export interface AdminStats {
  totalUsers: number;
  totalPlaces: number;
  totalReviews: number;
  totalReports: number;
  activeUsersToday: number;
  newUsersThisWeek: number;
  pendingReviews: number;
  resolvedReportsThisWeek: number;
  topCategories?: string[];
  systemStatus?: string;
  healthTimestamp?: string;
}

export type PriceLevel = CanonicalPriceLevel;
export type AdminFilterValue<T extends string> = "all" | T;

export type AdminUserId = string;
export type AdminUserRole = "user" | "moderator" | "admin";
export type AdminUserStatus = "active" | "banned" | "suspended";
export type AdminUserRoleFilter = AdminFilterValue<AdminUserRole>;

export interface AdminUser {
  userId: AdminUserId;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  joinedDate: Date;
  lastActive: Date;
  reviewCount: number;
  avatar?: string;
}

export interface AdminUsersQuery {
  page?: number;
  count?: number;
  searchTerm?: string;
  role?: AdminUserRoleFilter;
}

export type AdminUsersPage = PaginatedResponse<AdminUser>;

export interface AdminPlace {
  id: string;
  name: string;
  category: string;
  district: string;
  rating: number;
  reviewCount: number;
  status: AdminPlaceStatus;
  createdAt: Date;
  image: string;
  // Extended fields for the Add/Edit form
  tags?: string[];
  description?: string;
  whyRecommend?: string;
  priceLevel?: PriceLevel;
  phone?: string;
  website?: string;
}

export type AdminPlaceStatus = "active" | "pending" | "flagged" | "removed";
export type AdminPlaceStatusFilter = AdminFilterValue<AdminPlaceStatus>;

export interface AdminReview {
  id: string;
  userId: AdminUserId;
  userName: string;
  userAvatar?: string;
  placeId: string;
  placeName: string;
  rating: number;
  comment: string;
  status: AdminReviewStatus;
  reportCount: number;
  createdAt: Date;
}

export type AdminReviewStatus = "published" | "pending" | "flagged" | "removed";
export type AdminReviewStatusFilter = AdminFilterValue<AdminReviewStatus>;

export interface AdminCategory {
  id: string;
  label: string;
  icon: string;
  count: number;
  color: string;
  status: AdminCategoryStatus;
}

export type AdminCategoryStatus = "active" | "inactive";

export interface SystemSettings {
  siteName: string;
  maintenanceMode: boolean;
  maxUploadSize: number;
  defaultLanguage: string;
  enableNotifications: boolean;
  enableReviews: boolean;
  moderationRequired: boolean;
  autoFlagThreshold: number;
}

export interface RecentActivity {
  id: string;
  type: AdminActivityType;
  description: string;
  timestamp: Date;
  userId?: AdminUserId;
  userName?: string;
}

export type AdminActivityType =
  | "user_joined"
  | "review_posted"
  | "place_added"
  | "report_filed";

export type CreateAdminPlaceInput = Omit<
  AdminPlace,
  "id" | "rating" | "reviewCount" | "createdAt" | "status"
>;

// ── Shared UI Types ───────────────────────────────────────────

export interface AdminToast {
  id: string;
  message: string;
  variant: "success" | "error" | "info" | "warning";
}

export interface PlaceFormData {
  name: string;
  category: string;
  district: string;
  description: string;
  whyRecommend: string;
  priceLevel: PriceLevel;
  tags: string[];
  image: string;
  phone: string;
  website: string;
}

export interface PlaceFormErrors {
  name?: string;
  category?: string;
  district?: string;
  description?: string;
  whyRecommend?: string;
  image?: string;
  phone?: string;
  website?: string;
}
