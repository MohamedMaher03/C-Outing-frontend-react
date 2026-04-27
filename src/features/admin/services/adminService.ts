import type { PaginatedResponse } from "@/types";
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
  AdminReviewQuery,
  AdminPlaceQuery,
} from "../types";
import { adminDataSource } from "./adminDataSource";
import { withAdminServiceError } from "./adminServiceError";

export const adminService = {
  async getStats(): Promise<AdminStats> {
    return withAdminServiceError(
      () => adminDataSource.getStats(),
      "Failed to load admin stats",
    );
  },

  async getRecentActivity(): Promise<RecentActivity[]> {
    return withAdminServiceError(
      () => adminDataSource.getRecentActivity(),
      "Failed to load recent activity",
    );
  },

  async getUsers(params: AdminUsersQuery = {}): Promise<AdminUsersPage> {
    return withAdminServiceError(
      () => adminDataSource.getUsers(params),
      "Failed to load users",
    );
  },

  async updateUserStatus(
    userId: AdminUserId,
    status: AdminUserStatus,
  ): Promise<void> {
    return withAdminServiceError(
      () => adminDataSource.updateUserStatus(userId, status),
      "Failed to update user status",
    );
  },

  async getPlaces(
    placesQueryParams?: AdminPlaceQuery,
  ): Promise<PaginatedResponse<AdminPlace>> {
    return withAdminServiceError(
      () => adminDataSource.getPlaces(placesQueryParams),
      "Failed to load places",
    );
  },

  async addPlace(placeData: CreateAdminPlaceInput): Promise<void> {
    return withAdminServiceError(
      () => adminDataSource.addPlace(placeData),
      "Failed to start venue scraping",
    );
  },

  async updatePlaceStatus(
    placeId: string,
    status: AdminPlace["status"],
  ): Promise<void> {
    return withAdminServiceError(
      () => adminDataSource.updatePlaceStatus(placeId, status),
      "Failed to update place status",
    );
  },

  async deletePlace(placeId: string): Promise<void> {
    return withAdminServiceError(
      () => adminDataSource.deletePlace(placeId),
      "Failed to delete place",
    );
  },

  async getReviews(
    reviewsQueryParams?: AdminReviewQuery,
  ): Promise<PaginatedResponse<AdminReview>> {
    return withAdminServiceError(
      () => adminDataSource.getReviews(reviewsQueryParams),
      "Failed to load reviews",
    );
  },

  async updateReviewStatus(
    reviewId: string,
    status: AdminReview["status"],
  ): Promise<void> {
    return withAdminServiceError(
      () => adminDataSource.updateReviewStatus(reviewId, status),
      "Failed to update review status",
    );
  },

  async deleteReview(reviewId: string): Promise<void> {
    return withAdminServiceError(
      () => adminDataSource.deleteReview(reviewId),
      "Failed to delete review",
    );
  },

  async getCategories(): Promise<AdminCategory[]> {
    return withAdminServiceError(
      () => adminDataSource.getCategories(),
      "Failed to load categories",
    );
  },

  async updateCategory(
    categoryId: string,
    data: Partial<AdminCategory>,
  ): Promise<void> {
    return withAdminServiceError(
      () => adminDataSource.updateCategory(categoryId, data),
      "Failed to update category",
    );
  },

  async getSettings(): Promise<SystemSettings> {
    return withAdminServiceError(
      () => adminDataSource.getSettings(),
      "Failed to load settings",
    );
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    return withAdminServiceError(
      () => adminDataSource.updateSettings(settings),
      "Failed to update settings",
    );
  },
};
