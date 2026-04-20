import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type {
  ModeratorStats,
  ReportedContent,
  ModerationAction,
} from "../types";

const toValidDate = (value: unknown): Date => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? new Date(0) : value;
  }

  const parsedDate = new Date(typeof value === "string" ? value : "");
  return Number.isNaN(parsedDate.getTime()) ? new Date(0) : parsedDate;
};

const unwrapPayload = <T>(payload: unknown): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data?: unknown }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

const normalizeReportedContent = (item: ReportedContent): ReportedContent => ({
  ...item,
  createdAt: toValidDate(item.createdAt),
  ...(item.resolvedAt ? { resolvedAt: toValidDate(item.resolvedAt) } : {}),
});

const normalizeAction = (item: ModerationAction): ModerationAction => ({
  ...item,
  timestamp: toValidDate(item.timestamp),
});

export const moderatorApi = {
  async getStats(): Promise<ModeratorStats> {
    const { data } = await axiosInstance.get<ModeratorStats>(
      API_ENDPOINTS.moderator.getStats,
    );
    return unwrapPayload<ModeratorStats>(data);
  },

  async getReportedContent(): Promise<ReportedContent[]> {
    const { data } = await axiosInstance.get<ReportedContent[]>(
      API_ENDPOINTS.moderator.getReportedContent,
    );

    const payload = unwrapPayload<ReportedContent[]>(data);
    return payload.map(normalizeReportedContent);
  },

  async updateReportStatus(
    reportId: string,
    status: ReportedContent["status"],
  ): Promise<void> {
    await axiosInstance.patch(
      API_ENDPOINTS.moderator.updateReportStatus(reportId),
      { status },
    );
  },

  async getRecentActions(): Promise<ModerationAction[]> {
    const { data } = await axiosInstance.get<ModerationAction[]>(
      API_ENDPOINTS.moderator.getRecentActions,
    );

    const payload = unwrapPayload<ModerationAction[]>(data);
    return payload.map(normalizeAction);
  },

  async deleteReview(reportId: string): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.moderator.deleteReview(reportId));
  },

  async warnUser(reportId: string): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.moderator.warnUser(reportId));
  },

  async banUser(reportId: string): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.moderator.banUser(reportId));
  },
};
