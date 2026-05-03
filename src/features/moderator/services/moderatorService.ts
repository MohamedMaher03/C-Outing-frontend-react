import type {
  ModeratorStats,
  ReportedContent,
  ModerationAction,
} from "../types";
import type {
  AdminCategory,
  AdminPlace,
  AdminPlaceQuery,
  AdminPlaceStatus,
  AdminReview,
  AdminReviewQuery,
  AdminReviewStatus,
  CreateAdminPlaceInput,
} from "@/features/admin/types";
import { adminService } from "@/features/admin/services/adminService";
import {
  mapAdminVenuesPage,
  mapReportedVenueIds,
} from "@/features/admin/api/adminApi.mapper";
import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type { PaginatedResponse } from "@/types";
import { moderatorDataSource } from "./moderatorDataSource";
import { withModeratorServiceError } from "./moderatorServiceError";
import { isApiError } from "@/utils/apiError";

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

export const moderatorService = {
  async getPlaces(
    params: AdminPlaceQuery = {},
  ): Promise<PaginatedResponse<AdminPlace>> {
    return withModeratorServiceError(async () => {
      const venuesQuery = toQueryParams({
        page: params.page ?? 1,
        count: params.count ?? 10,
        searchTerm: params.searchTerm,
        status: params.status !== "all" ? params.status : undefined,
      }).toString();

      const venuesRequest = axiosInstance.get(
        `${API_ENDPOINTS.admin.getVenues}?${venuesQuery}`,
      );

      let reportedVenueIds = new Set<string>();
      let reportedForbidden = false;
      try {
        const reportedResponse = await axiosInstance.get(
          API_ENDPOINTS.admin.getReportedVenues,
        );
        reportedVenueIds = mapReportedVenueIds(reportedResponse.data);
      } catch (error) {
        if (!isApiError(error) || error.statusCode !== 403) {
          throw error;
        }
        reportedForbidden = true;
      }

      if (reportedForbidden && params.status === "all") {
        const baseQuery = {
          page: 1,
          count: 1,
          status: "flagged",
        };

        const firstFlaggedResponse = await axiosInstance.get(
          `${API_ENDPOINTS.admin.getVenues}?${toQueryParams(baseQuery)}`,
        );
        const firstFlaggedPage = mapAdminVenuesPage(
          firstFlaggedResponse.data,
          new Set<string>(),
          "flagged",
        );

        const flaggedTotal = Math.max(0, firstFlaggedPage.totalCount);
        if (flaggedTotal > firstFlaggedPage.items.length) {
          const fullFlaggedResponse = await axiosInstance.get(
            `${API_ENDPOINTS.admin.getVenues}?${toQueryParams({
              page: 1,
              count: flaggedTotal,
              status: "flagged",
            })}`,
          );
          const fullFlaggedPage = mapAdminVenuesPage(
            fullFlaggedResponse.data,
            new Set<string>(),
            "flagged",
          );
          reportedVenueIds = new Set(fullFlaggedPage.items.map((item) => item.id));
        } else {
          reportedVenueIds = new Set(firstFlaggedPage.items.map((item) => item.id));
        }
      }

      const venuesResponse = await venuesRequest;
      return mapAdminVenuesPage(
        venuesResponse.data,
        reportedVenueIds,
        params.status,
      );
    }, "Failed to load places");
  },

  async getCategories(): Promise<AdminCategory[]> {
    return withModeratorServiceError(
      () => adminService.getCategories(),
      "Failed to load categories",
    );
  },

  async updatePlaceStatus(
    placeId: string,
    status: AdminPlaceStatus,
  ): Promise<void> {
    return withModeratorServiceError(
      () => adminService.updatePlaceStatus(placeId, status),
      "Failed to update place status",
    );
  },

  async deletePlace(placeId: string): Promise<void> {
    return withModeratorServiceError(
      () => adminService.deletePlace(placeId),
      "Failed to delete place",
    );
  },

  async addPlace(placeData: CreateAdminPlaceInput): Promise<void> {
    return withModeratorServiceError(
      () => adminService.addPlace(placeData),
      "Failed to start venue scraping",
    );
  },

  async getReviews(
    reviewsQueryParams?: AdminReviewQuery,
  ): Promise<PaginatedResponse<AdminReview>> {
    return withModeratorServiceError(
      () => adminService.getReviews(reviewsQueryParams),
      "Failed to load reviews",
    );
  },

  async updateReviewStatus(
    reviewId: string,
    status: AdminReviewStatus,
  ): Promise<void> {
    return withModeratorServiceError(
      () => adminService.updateReviewStatus(reviewId, status),
      "Failed to update review status",
    );
  },

  async getStats(): Promise<ModeratorStats> {
    return withModeratorServiceError(
      () => moderatorDataSource.getStats(),
      "Failed to load moderator stats",
    );
  },

  async getReportedContent(): Promise<ReportedContent[]> {
    return withModeratorServiceError(
      () => moderatorDataSource.getReportedContent(),
      "Failed to load reported content",
    );
  },

  async updateReportStatus(
    reportId: string,
    status: ReportedContent["status"],
  ): Promise<void> {
    return withModeratorServiceError(
      () => moderatorDataSource.updateReportStatus(reportId, status),
      "Failed to update report status",
    );
  },

  async getRecentActions(): Promise<ModerationAction[]> {
    return withModeratorServiceError(
      () => moderatorDataSource.getRecentActions(),
      "Failed to load recent actions",
    );
  },

  async deleteReview(reportId: string): Promise<void> {
    return withModeratorServiceError(
      () => moderatorDataSource.deleteReview(reportId),
      "Failed to delete review",
    );
  },

  async warnUser(reportId: string): Promise<void> {
    return withModeratorServiceError(
      () => moderatorDataSource.warnUser(reportId),
      "Failed to send warning",
    );
  },

  async banUser(reportId: string): Promise<void> {
    return withModeratorServiceError(
      () => moderatorDataSource.banUser(reportId),
      "Failed to escalate user ban",
    );
  },
};
