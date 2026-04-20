import type {
  AdminFilterValue,
  AdminPlaceStatus,
  AdminReviewStatus,
} from "@/features/admin/types";

export interface ModeratorStats {
  pendingReviews: number;
  flaggedPlaces: number;
  openReports: number;
  resolvedToday: number;
  resolvedThisWeek: number;
  totalModerated: number;
}

export interface ReportedContent {
  id: string;
  type: "review" | "place" | "user";
  reportedItemId: string;
  reportedItemName: string;
  reporterName: string;
  reporterId: number;
  reason: string;
  description: string;
  reviewContent?: string;
  reviewAuthorName?: string;
  status: "open" | "investigating" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high";
  createdAt: Date;
  resolvedAt?: Date;
}

export type ModerationResolutionAction =
  | "delete_review"
  | "warn_user"
  | "ban_user"
  | "escalate_admin";

export interface ModerationAction {
  id: string;
  action: "approved" | "removed" | "warned" | "escalated";
  moderatorName: string;
  itemType: string;
  itemName: string;
  timestamp: Date;
  note?: string;
}

export interface ModeratorToast {
  id: string;
  message: string;
  variant: "success" | "warning" | "destructive" | "error" | "info";
}

export interface ModeratePlaceFormData {
  venueUrl: string;
}

export interface ModeratePlaceFormErrors {
  venueUrl?: string;
}

export interface ModeratePlaceToast {
  id: string;
  message: string;
  variant: "success" | "error" | "info" | "warning";
}

export type ModeratorPlaceStatusFilter = AdminFilterValue<AdminPlaceStatus>;
export type ModeratorReviewStatusFilter = AdminFilterValue<AdminReviewStatus>;
export type ReportedContentStatusFilter = AdminFilterValue<
  ReportedContent["status"]
>;
export type ReportedContentTypeFilter = AdminFilterValue<
  ReportedContent["type"]
>;
