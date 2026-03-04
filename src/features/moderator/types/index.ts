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
  status: "open" | "investigating" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high";
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ModerationAction {
  id: string;
  action: "approved" | "removed" | "warned" | "escalated";
  moderatorName: string;
  itemType: string;
  itemName: string;
  timestamp: Date;
  note?: string;
}
