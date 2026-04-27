import type { PaginatedResponse } from "@/types";
import type { CanonicalPriceLevel } from "@/utils/priceLevels";
import type { UserRole } from "@/types";

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
export type AdminUserRole = UserRole;
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

export interface AdminReviewQuery {
  page?: number;
  count?: number;
  searchTerm?: string;
  status?: AdminReviewStatusFilter;
}

export interface AdminPlaceQuery {
  page?: number;
  count?: number;
  searchTerm?: string;
  status?: AdminPlaceStatusFilter;
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
  tags?: string[];
  description?: string;
  whyRecommend?: string;
  priceLevel?: PriceLevel;
  phone?: string;
  website?: string;
}

export type AdminPlaceStatus = "active" | "pending" | "flagged" | "removed";
export type AdminPlaceStatusFilter = AdminFilterValue<AdminPlaceStatus>;

/**
 * "id": "68994951-8326-48d2-8a41-e6a171cf73fc",
        "userId": "00000000-0000-0000-0000-000000000000",
        "userName": "veer semwal",
        "userAvatarUrl": null,
        "venueId": "2be51c7c-54f0-4672-b5f2-df58f56ecb88",
        "venueName": "Raoucha & Kandahar Restaurants",
        "rating": 5,
        "comment": "V.v.v veey good place",
        "status": "Approved",
        "reportCount": 0,
        "createdAt": "2026-04-25"
 */

export interface AdminReview {
  id: string;
  userId: AdminUserId;
  userName: string;
  userAvatar?: string;
  venueId: string;
  venueName: string;
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

export interface CreateAdminPlaceInput {
  venueUrl: string;
}

export interface AdminToast {
  id: string;
  message: string;
  variant: "success" | "error" | "info" | "warning";
}

export interface PlaceFormData {
  venueUrl: string;
}

export interface PlaceFormErrors {
  venueUrl?: string;
}
