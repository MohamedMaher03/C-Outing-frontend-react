/**
 * Moderator Service — Business Logic Layer
 *
 * Sits between hooks and the datasource layer.
 * Responsibilities:
 *   • Call moderatorDataSource functions
 *   • Transform DTOs to UI models if needed
 *   • Centralise error handling
 *
 * ┌───────────────────────────────────────────────────────────────────┐
 * │ useModerator* → moderatorService → moderatorDataSource → API/mock │
 * └───────────────────────────────────────────────────────────────────┘
 */

import type {
  ModeratorStats,
  ReportedContent,
  ModerationAction,
} from "../types";
import type {
  AdminCategory,
  AdminPlace,
  AdminPlaceStatus,
  AdminReview,
  AdminReviewStatus,
  CreateAdminPlaceInput,
} from "@/features/admin/types";
import { adminService } from "@/features/admin/services/adminService";
import { moderatorDataSource } from "./moderatorDataSource";
import { withModeratorServiceError } from "./moderatorServiceError";

// ── Moderator Service ─────────────────────────────────────────

export const moderatorService = {
  async getPlaces(): Promise<AdminPlace[]> {
    return withModeratorServiceError(
      () => adminService.getPlaces(),
      "Failed to load places",
    );
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

  async addPlace(placeData: CreateAdminPlaceInput): Promise<AdminPlace> {
    return withModeratorServiceError(
      () => adminService.addPlace(placeData),
      "Failed to add place",
    );
  },

  async getReviews(): Promise<AdminReview[]> {
    return withModeratorServiceError(
      () => adminService.getReviews(),
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
