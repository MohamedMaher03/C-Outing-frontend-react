/**
 * Moderator API Layer
 *
 * Pure HTTP functions — no business logic, no side effects, no storage.
 * Each function maps 1-to-1 with a backend endpoint.
 *
 * The shared axios instance (src/config/axios.config.ts) handles:
 *   • Attaching the Authorization header on every request
 *   • Handling 401 responses globally
 *
 * To switch to mocks during development, swap the import in moderatorService.ts:
 *   import { moderatorMock as moderatorApi } from "../mocks/moderatorMock";
 */

import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type {
  ModeratorStats,
  ReportedContent,
  ModerationAction,
} from "../types";

export const moderatorApi = {
  /**
   * GET /moderator/stats
   * Returns moderation queue statistics.
   */
  async getStats(): Promise<ModeratorStats> {
    const { data } = await axiosInstance.get<ModeratorStats>(
      API_ENDPOINTS.moderator.getStats,
    );
    return data;
  },

  /**
   * GET /moderator/reports
   * Returns all reported content items.
   */
  async getReportedContent(): Promise<ReportedContent[]> {
    const { data } = await axiosInstance.get<ReportedContent[]>(
      API_ENDPOINTS.moderator.getReportedContent,
    );
    return data;
  },

  /**
   * PATCH /moderator/reports/:reportId/status
   * Updates the status of a reported content item.
   */
  async updateReportStatus(
    reportId: string,
    status: ReportedContent["status"],
  ): Promise<void> {
    await axiosInstance.patch(
      API_ENDPOINTS.moderator.updateReportStatus(reportId),
      { status },
    );
  },

  /**
   * GET /moderator/actions
   * Returns recent moderation actions.
   */
  async getRecentActions(): Promise<ModerationAction[]> {
    const { data } = await axiosInstance.get<ModerationAction[]>(
      API_ENDPOINTS.moderator.getRecentActions,
    );
    return data;
  },

  /**
   * POST /moderator/reports/:reportId/delete-review
   * Deletes the review associated with a report and resolves it.
   */
  async deleteReview(reportId: string): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.moderator.deleteReview(reportId));
  },

  /**
   * POST /moderator/reports/:reportId/warn
   * Sends a warning to the user associated with a report and resolves it.
   */
  async warnUser(reportId: string): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.moderator.warnUser(reportId));
  },

  /**
   * POST /moderator/reports/:reportId/ban
   * Escalates the user for ban review and resolves the report.
   */
  async banUser(reportId: string): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.moderator.banUser(reportId));
  },
};
