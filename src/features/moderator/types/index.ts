/**
 * Moderator Feature — Type Definitions
 */

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
  /** Original text of the reported review (populated for type="review") */
  reviewContent?: string;
  /** Username of the review author (populated for type="review") */
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

// ── Shared UI Types ───────────────────────────────────────────

export interface ModeratorToast {
  id: number;
  message: string;
  variant: "success" | "warning" | "destructive";
}

export interface ModeratePlaceFormData {
  name: string;
  category: string;
  district: string;
  description: string;
  priceLevel: 1 | 2 | 3;
  tags: string[];
  image: string;
  phone: string;
  website: string;
}

export interface ModeratePlaceFormErrors {
  name?: string;
  category?: string;
  district?: string;
  description?: string;
  image?: string;
}

export interface ModeratePlaceToast {
  id: string;
  message: string;
  variant: "success" | "error" | "info" | "warning";
}
