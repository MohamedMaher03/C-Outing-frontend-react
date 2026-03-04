/**
 * Moderator Service — Business Logic Layer
 *
 * Sits between hooks and the HTTP layer (moderatorApi).
 * Responsibilities:
 *   • Call moderatorApi functions
 *   • Transform DTOs to UI models if needed
 *   • Centralise error handling
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  useModerator*  →  moderatorService  →  moderatorApi  →  axios       │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * 🔧 To use mocks during development, swap the import:
 *   import { moderatorMock as moderatorApi } from "../mocks/moderatorMock";
 */

// import { moderatorApi } from "../api/moderatorApi"; // (WHEN INTEGRATE WITH BACKEND USE THIS AND REMOVE ONE DOWN)
import { moderatorMock as moderatorApi } from "../mocks/moderatorMock";
import type {
  ModeratorStats,
  ReportedContent,
  ModerationAction,
} from "../types";

// ── Moderator Service ─────────────────────────────────────────

export const moderatorService = {
  async getStats(): Promise<ModeratorStats> {
    try {
      return await moderatorApi.getStats();
    } catch (error) {
      console.error("Error fetching moderator stats:", error);
      throw new Error("Failed to load moderator stats");
    }
  },

  async getReportedContent(): Promise<ReportedContent[]> {
    try {
      return await moderatorApi.getReportedContent();
    } catch (error) {
      console.error("Error fetching reported content:", error);
      throw new Error("Failed to load reported content");
    }
  },

  async updateReportStatus(
    reportId: string,
    status: ReportedContent["status"],
  ): Promise<void> {
    try {
      await moderatorApi.updateReportStatus(reportId, status);
    } catch (error) {
      console.error("Error updating report status:", error);
      throw new Error("Failed to update report status");
    }
  },

  async getRecentActions(): Promise<ModerationAction[]> {
    try {
      return await moderatorApi.getRecentActions();
    } catch (error) {
      console.error("Error fetching recent actions:", error);
      throw new Error("Failed to load recent actions");
    }
  },

  async deleteReview(reportId: string): Promise<void> {
    try {
      await moderatorApi.deleteReview(reportId);
    } catch (error) {
      console.error("Error deleting review:", error);
      throw new Error("Failed to delete review");
    }
  },

  async warnUser(reportId: string): Promise<void> {
    try {
      await moderatorApi.warnUser(reportId);
    } catch (error) {
      console.error("Error warning user:", error);
      throw new Error("Failed to send warning");
    }
  },

  async banUser(reportId: string): Promise<void> {
    try {
      await moderatorApi.banUser(reportId);
    } catch (error) {
      console.error("Error escalating user ban:", error);
      throw new Error("Failed to escalate user ban");
    }
  },
};
