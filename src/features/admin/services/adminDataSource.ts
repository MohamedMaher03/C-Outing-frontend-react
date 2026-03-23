import { adminApi } from "../api/adminApi";
import { adminMock } from "../mocks/adminMock";
import type {
  AdminStats,
  AdminUser,
  AdminUserId,
  AdminUserStatus,
  AdminPlace,
  AdminReview,
  AdminCategory,
  SystemSettings,
  RecentActivity,
  CreateAdminPlaceInput,
} from "../types";

export interface AdminDataSource {
  getStats: () => Promise<AdminStats>;
  getRecentActivity: () => Promise<RecentActivity[]>;
  getUsers: () => Promise<AdminUser[]>;
  updateUserStatus: (
    userId: AdminUserId,
    status: AdminUserStatus,
  ) => Promise<void>;
  getPlaces: () => Promise<AdminPlace[]>;
  addPlace: (placeData: CreateAdminPlaceInput) => Promise<AdminPlace>;
  updatePlaceStatus: (
    placeId: string,
    status: AdminPlace["status"],
  ) => Promise<void>;
  deletePlace: (placeId: string) => Promise<void>;
  getReviews: () => Promise<AdminReview[]>;
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

const shouldUseMocks =
  import.meta.env.VITE_ADMIN_USE_MOCKS === undefined
    ? false
    : import.meta.env.VITE_ADMIN_USE_MOCKS === "true";

export const adminDataSource: AdminDataSource = shouldUseMocks
  ? adminMock
  : adminApi;
