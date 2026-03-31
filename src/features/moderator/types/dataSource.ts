import type {
  ModeratorStats,
  ReportedContent,
  ModerationAction,
} from "./index";

export interface ModeratorDataSource {
  getStats: () => Promise<ModeratorStats>;
  getReportedContent: () => Promise<ReportedContent[]>;
  updateReportStatus: (
    reportId: string,
    status: ReportedContent["status"],
  ) => Promise<void>;
  getRecentActions: () => Promise<ModerationAction[]>;
  deleteReview: (reportId: string) => Promise<void>;
  warnUser: (reportId: string) => Promise<void>;
  banUser: (reportId: string) => Promise<void>;
}
