import type {
  AdminPlaceStatus,
  AdminPlaceStatusFilter,
  AdminReviewStatus,
  AdminReviewStatusFilter,
  AdminUserRole,
  AdminUserRoleFilter,
} from "../types";

type FilterOption<T extends string> = {
  value: T;
  label: string;
};

export const USER_ROLE_FILTER_OPTIONS: ReadonlyArray<
  FilterOption<AdminUserRoleFilter>
> = [
  { value: "all", label: "All" },
  { value: "user", label: "User" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" },
];

export const PLACE_STATUS_FILTER_OPTIONS: ReadonlyArray<
  FilterOption<AdminPlaceStatusFilter>
> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
  { value: "removed", label: "Removed" },
];

export const REVIEW_STATUS_FILTER_OPTIONS: ReadonlyArray<
  FilterOption<AdminReviewStatusFilter>
> = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
  { value: "removed", label: "Removed" },
];

export const MANAGEABLE_REVIEW_STATUSES: ReadonlyArray<
  Exclude<AdminReviewStatus, "published">
> = ["pending", "flagged", "removed"];

export const MANAGEABLE_PLACE_STATUSES: ReadonlyArray<AdminPlaceStatus> = [
  "active",
  "pending",
  "flagged",
  "removed",
];

export const MANAGEABLE_USER_ROLES: ReadonlyArray<AdminUserRole> = [
  "user",
  "moderator",
  "admin",
];
