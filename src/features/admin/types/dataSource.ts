import type { PaginatedResponse, QueryParams } from "@/types";
import type {
  AdminStats,
  AdminUserId,
  AdminUsersPage,
  AdminUsersQuery,
  AdminUserStatus,
  AdminPlace,
  AdminReview,
  AdminCategory,
  SystemSettings,
  RecentActivity,
  CreateAdminPlaceInput,
} from "./index";

export interface AdminDataSource {
  getStats: () => Promise<AdminStats>;
  getRecentActivity: () => Promise<RecentActivity[]>;
  getUsers: (params?: AdminUsersQuery) => Promise<AdminUsersPage>;
  updateUserStatus: (
    userId: AdminUserId,
    status: AdminUserStatus,
  ) => Promise<void>;
  getPlaces: (params?: QueryParams) => Promise<PaginatedResponse<AdminPlace>>;
  addPlace: (placeData: CreateAdminPlaceInput) => Promise<void>;
  updatePlaceStatus: (
    placeId: string,
    status: AdminPlace["status"],
  ) => Promise<void>;
  deletePlace: (placeId: string) => Promise<void>;
  getReviews: (
    reviewsQueryParams?: QueryParams,
  ) => Promise<PaginatedResponse<AdminReview>>;
  updateReviewStatus: (
    reviewId: string,
    status: AdminReview["status"],
  ) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  getCategories: () => Promise<AdminCategory[]>;
  updateCategory: (
    categoryId: string,
    categoryData: Partial<AdminCategory>,
  ) => Promise<void>;
  getSettings: () => Promise<SystemSettings>;
  updateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
}
