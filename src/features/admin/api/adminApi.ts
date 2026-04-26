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
  mapReportedVenueIds,
  mapStats,
  toRecentActivity,
  toSystemSettings,
} from "./adminApi.mapper";
import type { PaginatedResponse } from "@/types";

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

const getPlaces = async (
  params: VenuesParams = {},
): Promise<PaginatedResponse<AdminPlace>> => {
  const [reportedVenueIds, venuesResponse] = await Promise.all([
    getReportedVenueIds(),
    axiosInstance.get(
      `${API_ENDPOINTS.admin.getVenues}?${toQueryParams({
        page: params.page ?? 1,
        count: params.count ?? 10,
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
    count: params.count ?? 10,
    status: params.status,
    searchTerm: params.searchTerm,
  });

  const { data } = await axiosInstance.get(
    `${API_ENDPOINTS.admin.getReviews}?${query.toString()}`,
  );

  return mapAdminReviews(data);
};

export const adminApi = {
  async getStats(): Promise<AdminStats> {
    const [statsResponse, healthResponse, reportsResponse] = await Promise.all([
      axiosInstance.get(API_ENDPOINTS.admin.getStats),
      axiosInstance.get(API_ENDPOINTS.admin.getSystemHealth),
      axiosInstance.get(API_ENDPOINTS.admin.getReportedVenues),
    ]);

    const reports = mapReportedVenueIds(reportsResponse.data).size;

    return mapStats(statsResponse.data, healthResponse.data, reports);
  },

  async getRecentActivity(): Promise<RecentActivity[]> {
    const [statsResponse, healthResponse] = await Promise.all([
      axiosInstance.get(API_ENDPOINTS.admin.getStats),
      axiosInstance.get(API_ENDPOINTS.admin.getSystemHealth),
    ]);

    return toRecentActivity(statsResponse.data, healthResponse.data);
  },

  async getUsers(params: AdminUsersQuery = {}): Promise<AdminUsersPage> {
    return getUsers({
      page: params.page ?? 1,
      count: params.count ?? 10,
      role: params.role,
      searchTerm: params.searchTerm,
    });
  },

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

  async getPlaces(
    params: VenuesParams = {},
  ): Promise<PaginatedResponse<AdminPlace>> {
    return getPlaces({ page: params.page ?? 1, count: params.count ?? 10 });
  },

  async addPlace(placeData: CreateAdminPlaceInput): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.places.scrapeInitiate, {
      venueUrl: placeData.venueUrl,
    });
  },

  async updatePlaceStatus(
    placeId: string,
    status: AdminPlace["status"],
  ): Promise<void> {
    await axiosInstance.patch(API_ENDPOINTS.admin.updateVenueStatus(placeId), {
      status,
    });
  },

  async deletePlace(placeId: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.admin.deleteVenue(placeId));
  },

  async getReviews(): Promise<AdminReview[]> {
    return getReviews({ page: 1, count: 10 });
  },

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

  async deleteReview(reviewId: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.admin.deleteReview(reviewId));
  },

  async getCategories(): Promise<AdminCategory[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.admin.getCategories);
    return mapAdminCategories(data);
  },

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

  async getSettings(): Promise<SystemSettings> {
    const { data } = await axiosInstance.get(
      API_ENDPOINTS.admin.getSystemHealth,
    );
    return toSystemSettings(data);
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    void settings;
    throw new Error(
      "System settings update endpoint is not available in current backend APIs",
    );
  },
};
