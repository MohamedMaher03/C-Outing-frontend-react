import type {
  ModeratorPlaceStatusFilter,
  ModeratorReviewStatusFilter,
  ReportedContentStatusFilter,
  ReportedContentTypeFilter,
} from "@/features/moderator/types";

type ModeratorFilterOption<T extends string> = {
  value: T;
  label: string;
};

export const MODERATOR_PLACE_STATUS_FILTER_OPTIONS: ReadonlyArray<
  ModeratorFilterOption<ModeratorPlaceStatusFilter>
> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
  { value: "active", label: "Active" },
  { value: "removed", label: "Removed" },
];

export const MODERATOR_REVIEW_STATUS_FILTER_OPTIONS: ReadonlyArray<
  ModeratorFilterOption<ModeratorReviewStatusFilter>
> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
  { value: "published", label: "Published" },
  { value: "removed", label: "Removed" },
];

export const MODERATOR_REPORT_STATUS_FILTER_OPTIONS: ReadonlyArray<
  ModeratorFilterOption<ReportedContentStatusFilter>
> = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

export const MODERATOR_REPORT_TYPE_FILTER_OPTIONS: ReadonlyArray<
  ModeratorFilterOption<ReportedContentTypeFilter>
> = [
  { value: "all", label: "All Types" },
  { value: "review", label: "Reviews" },
  { value: "place", label: "Places" },
  { value: "user", label: "Users" },
];
