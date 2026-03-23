/**
 * Admin API Layer
 *
 * Pure HTTP functions — no business logic, no side effects, no storage.
 * Each function maps 1-to-1 with a backend endpoint.
 *
 * The shared axios instance (src/config/axios.config.ts) handles:
 *   • Attaching the Authorization header on every request
 *   • Handling 401 responses globally
 *
 * To switch to mocks during development, swap the import in adminService.ts:
 *   import { adminMock as adminApi } from "../mocks/adminMock";
 */

import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type {
  AdminStats,
  AdminUser,
  AdminUserId,
  AdminUserRole,
  AdminUserStatus,
  AdminPlace,
  AdminReview,
  AdminCategory,
  SystemSettings,
  RecentActivity,
  CreateAdminPlaceInput,
} from "../types";

export const adminApi = {
  /**
   * GET /admin/stats
   * Returns system-wide aggregate statistics.
   */
  async getStats(): Promise<AdminStats> {
    const { data } = await axiosInstance.get<AdminStats>(
      API_ENDPOINTS.admin.getStats,
    );
    return data;
  },

  /**
   * GET /admin/activity
   * Returns recent system activity feed.
   */
  async getRecentActivity(): Promise<RecentActivity[]> {
    const { data } = await axiosInstance.get<RecentActivity[]>(
      API_ENDPOINTS.admin.getRecentActivity,
    );
    return data;
  },

  /**
   * GET /admin/users
   * Returns all registered users.
   */
  async getUsers(): Promise<AdminUser[]> {
    const { data } = await axiosInstance.get<AdminUser[]>(
      API_ENDPOINTS.admin.getUsers,
    );
    return data;
  },

  /**
   * PATCH /admin/users/:userId/role
   * Updates a user's role.
   */
  async updateUserRole(
    userId: AdminUserId,
    role: AdminUserRole,
  ): Promise<void> {
    await axiosInstance.patch(
      API_ENDPOINTS.admin.updateUserRole(String(userId)),
      {
        role,
      },
    );
  },

  /**
   * PATCH /admin/users/:userId/status
   * Updates a user's account status.
   */
  async updateUserStatus(
    userId: AdminUserId,
    status: AdminUserStatus,
  ): Promise<void> {
    await axiosInstance.patch(
      API_ENDPOINTS.admin.updateUserStatus(String(userId)),
      {
        status,
      },
    );
  },

  /**
   * GET /admin/places
   * Returns all places.
   */
  async getPlaces(): Promise<AdminPlace[]> {
    const { data } = await axiosInstance.get<AdminPlace[]>(
      API_ENDPOINTS.admin.getPlaces,
    );
    return data;
  },

  /**
   * POST /admin/places
   * Creates a new place.
   */
  async addPlace(placeData: CreateAdminPlaceInput): Promise<AdminPlace> {
    const { data } = await axiosInstance.post<AdminPlace>(
      API_ENDPOINTS.admin.addPlace,
      placeData,
    );
    return data;
  },

  /**
   * PATCH /admin/places/:placeId/status
   * Updates the moderation status of a place.
   */
  async updatePlaceStatus(
    placeId: string,
    status: AdminPlace["status"],
  ): Promise<void> {
    await axiosInstance.patch(API_ENDPOINTS.admin.updatePlaceStatus(placeId), {
      status,
    });
  },

  /**
   * DELETE /admin/places/:placeId
   * Permanently deletes a place.
   */
  async deletePlace(placeId: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.admin.deletePlace(placeId));
  },

  /**
   * GET /admin/reviews
   * Returns all reviews.
   */
  async getReviews(): Promise<AdminReview[]> {
    const { data } = await axiosInstance.get<AdminReview[]>(
      API_ENDPOINTS.admin.getReviews,
    );
    return data;
  },

  /**
   * PATCH /admin/reviews/:reviewId/status
   * Updates the moderation status of a review.
   */
  async updateReviewStatus(
    reviewId: string,
    status: AdminReview["status"],
  ): Promise<void> {
    await axiosInstance.patch(
      API_ENDPOINTS.admin.updateReviewStatus(reviewId),
      { status },
    );
  },

  /**
   * DELETE /admin/reviews/:reviewId
   * Permanently deletes a review.
   */
  async deleteReview(reviewId: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.admin.deleteReview(reviewId));
  },

  /**
   * GET /admin/categories
   * Returns all venue categories.
   */
  async getCategories(): Promise<AdminCategory[]> {
    const { data } = await axiosInstance.get<AdminCategory[]>(
      API_ENDPOINTS.admin.getCategories,
    );
    return data;
  },

  /**
   * PATCH /admin/categories/:categoryId
   * Partially updates a category.
   */
  async updateCategory(
    categoryId: string,
    categoryData: Partial<AdminCategory>,
  ): Promise<void> {
    await axiosInstance.patch(
      API_ENDPOINTS.admin.updateCategory(categoryId),
      categoryData,
    );
  },

  /**
   * GET /admin/settings
   * Returns system-wide configuration.
   */
  async getSettings(): Promise<SystemSettings> {
    const { data } = await axiosInstance.get<SystemSettings>(
      API_ENDPOINTS.admin.getSettings,
    );
    return data;
  },

  /**
   * PATCH /admin/settings
   * Updates system-wide configuration.
   */
  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    await axiosInstance.patch(API_ENDPOINTS.admin.updateSettings, settings);
  },
};
