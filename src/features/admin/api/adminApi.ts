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
  AdminUserId,
  AdminUserRoleFilter,
  AdminUsersPage,
  AdminUsersQuery,
  AdminUserStatus,
  AdminPlace,
  AdminReview,
  AdminCategory,
  SystemSettings,
  RecentActivity,
  CreateAdminPlaceInput,
} from "../types";
import {
  mapAdminCategories,
  mapAdminReviews,
  mapAdminUsersPage,
  mapAdminVenuesPage,
  mapCreatedAdminPlace,
  mapReportedVenueIds,
  mapStats,
  toRecentActivity,
  toSystemSettings,
} from "./adminApi.mapper";

interface UsersParams extends AdminUsersQuery {
  isBanned?: boolean;
}

interface VenuesParams {
  page?: number;
  count?: number;
}

interface ReviewsParams {
  page?: number;
  count?: number;
  status?: AdminReview["status"];
  searchTerm?: string;
}

const toQueryParams = (params: Record<string, unknown>): URLSearchParams => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    query.set(key, String(value));
  });

  return query;
};

const mapRoleFilterToApiRole = (
  roleFilter: AdminUserRoleFilter | undefined,
): string | undefined => {
  if (!roleFilter || roleFilter === "all") {
    return undefined;
  }

  if (roleFilter === "admin") {
    return "Admin";
  }

  if (roleFilter === "moderator") {
    return "Moderator";
  }

  return "User";
};

const getUsers = async (params: UsersParams = {}): Promise<AdminUsersPage> => {
  const query = toQueryParams({
    SearchTerm: params.searchTerm,
    Role: mapRoleFilterToApiRole(params.role),
    IsBanned: params.isBanned,
    page: params.page ?? 1,
    count: params.count ?? 10,
  });

  const { data } = await axiosInstance.get(
    `${API_ENDPOINTS.admin.getUsers}?${query.toString()}`,
  );

  return mapAdminUsersPage(data);
};

const getReportedVenueIds = async (): Promise<Set<string>> => {
  const { data } = await axiosInstance.get(
    API_ENDPOINTS.admin.getReportedVenues,
  );
  return mapReportedVenueIds(data);
};

const getPlaces = async (params: VenuesParams = {}): Promise<AdminPlace[]> => {
  const [reportedVenueIds, venuesResponse] = await Promise.all([
    getReportedVenueIds(),
    axiosInstance.get(
      `${API_ENDPOINTS.admin.getVenues}?${toQueryParams({
        page: params.page ?? 1,
        count: params.count ?? 100,
      }).toString()}`,
    ),
  ]);

  return mapAdminVenuesPage(venuesResponse.data, reportedVenueIds);
};

const getReviews = async (
  params: ReviewsParams = {},
): Promise<AdminReview[]> => {
  const query = toQueryParams({
    page: params.page ?? 1,
    count: params.count ?? 100,
    status: params.status,
    searchTerm: params.searchTerm,
  });

  const { data } = await axiosInstance.get(
    `${API_ENDPOINTS.admin.getReviews}?${query.toString()}`,
  );

  return mapAdminReviews(data);
};

export const adminApi = {
  /**
   * GET /admin/stats
   * Returns system-wide aggregate statistics.
   */
  async getStats(): Promise<AdminStats> {
    const [statsResponse, healthResponse, reportsResponse] = await Promise.all([
      axiosInstance.get(API_ENDPOINTS.admin.getStats),
      axiosInstance.get(API_ENDPOINTS.admin.getSystemHealth),
      axiosInstance.get(API_ENDPOINTS.admin.getReportedVenues),
    ]);

    const reports = mapReportedVenueIds(reportsResponse.data).size;

    return mapStats(statsResponse.data, healthResponse.data, reports);
  },

  /**
   * GET /admin/activity
   * Returns recent system activity feed.
   */
  async getRecentActivity(): Promise<RecentActivity[]> {
    const [statsResponse, healthResponse] = await Promise.all([
      axiosInstance.get(API_ENDPOINTS.admin.getStats),
      axiosInstance.get(API_ENDPOINTS.admin.getSystemHealth),
    ]);

    return toRecentActivity(statsResponse.data, healthResponse.data);
  },

  /**
   * GET /admin/users
   * Returns paginated users.
   */
  async getUsers(params: AdminUsersQuery = {}): Promise<AdminUsersPage> {
    return getUsers({
      page: params.page ?? 1,
      count: params.count ?? 10,
      role: params.role,
      searchTerm: params.searchTerm,
    });
  },

  /**
   * PATCH /api/v1/Admin/users/:userId/ban and /unban
   * Updates a user's account status.
   */
  async updateUserStatus(
    userId: AdminUserId,
    status: AdminUserStatus,
  ): Promise<void> {
    if (status === "active") {
      await axiosInstance.patch(API_ENDPOINTS.admin.unbanUser(String(userId)));
      return;
    }

    if (status === "banned") {
      await axiosInstance.patch(API_ENDPOINTS.admin.banUser(String(userId)));
      return;
    }

    throw new Error("Suspend status is not supported by current backend APIs");
  },

  /**
   * GET /admin/places
   * Returns all places.
   */
  async getPlaces(): Promise<AdminPlace[]> {
    return getPlaces({ page: 1, count: 100 });
  },

  /**
   * POST /admin/places
   * Creates a new place.
   */
  async addPlace(placeData: CreateAdminPlaceInput): Promise<AdminPlace> {
    const payload = {
      name: placeData.name,
      category: placeData.category,
      district: placeData.district,
      image: placeData.image,
      tags: placeData.tags ?? [],
      description: placeData.description ?? "",
      priceLevel: placeData.priceLevel ?? "mid_range",
      phone: placeData.phone ?? "",
      website: placeData.website ?? "",
    };

    const { data } = await axiosInstance.post(
      API_ENDPOINTS.admin.createVenue,
      payload,
    );

    return mapCreatedAdminPlace(data);
  },

  /**
   * PATCH /admin/places/:placeId/status
   * Updates the moderation status of a place.
   */
  async updatePlaceStatus(
    placeId: string,
    status: AdminPlace["status"],
  ): Promise<void> {
    await axiosInstance.patch(API_ENDPOINTS.admin.updateVenueStatus(placeId), {
      status,
    });
  },

  /**
   * DELETE /admin/places/:placeId
   * Permanently deletes a place.
   */
  async deletePlace(placeId: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.admin.deleteVenue(placeId));
  },

  /**
   * GET /admin/reviews
   * Returns all reviews.
   */
  async getReviews(): Promise<AdminReview[]> {
    return getReviews({ page: 1, count: 100 });
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
      {
        status,
      },
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
    const { data } = await axiosInstance.get(API_ENDPOINTS.admin.getCategories);
    return mapAdminCategories(data);
  },

  /**
   * PATCH /admin/categories/:categoryId
   * Partially updates a category.
   */
  async updateCategory(
    categoryId: string,
    categoryData: Partial<AdminCategory>,
  ): Promise<void> {
    void categoryId;
    void categoryData;
    throw new Error(
      "Category update endpoint is not available in current backend APIs",
    );
  },

  /**
   * GET /admin/settings
   * Returns system-wide configuration.
   */
  async getSettings(): Promise<SystemSettings> {
    const { data } = await axiosInstance.get(
      API_ENDPOINTS.admin.getSystemHealth,
    );
    return toSystemSettings(data);
  },

  /**
   * PATCH /admin/settings
   * Updates system-wide configuration.
   */
  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    void settings;
    throw new Error(
      "System settings update endpoint is not available in current backend APIs",
    );
  },
};
