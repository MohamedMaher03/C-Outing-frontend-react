import type {
  AdminPlace,
  AdminPlaceStatusFilter,
  AdminReview,
  AdminReviewStatusFilter,
} from "@/features/admin/types";
import type {
  ReportedContent,
  ReportedContentStatusFilter,
  ReportedContentTypeFilter,
} from "@/features/moderator/types";

export const filterModerationPlaces = (
  places: AdminPlace[],
  search: string,
  statusFilter: AdminPlaceStatusFilter,
): AdminPlace[] => {
  const normalizedSearch = search.trim().toLowerCase();

  return places.filter((place) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      place.name.toLowerCase().includes(normalizedSearch) ||
      place.district.toLowerCase().includes(normalizedSearch) ||
      place.category.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" || place.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
};

export const filterModerationReviews = (
  reviews: AdminReview[],
  search: string,
  statusFilter: AdminReviewStatusFilter,
): AdminReview[] => {
  const normalizedSearch = search.trim().toLowerCase();

  return reviews.filter((review) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      review.userName.toLowerCase().includes(normalizedSearch) ||
      review.placeName.toLowerCase().includes(normalizedSearch) ||
      review.comment.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" || review.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
};

export const filterReportedContent = (
  reports: ReportedContent[],
  search: string,
  statusFilter: ReportedContentStatusFilter,
  typeFilter: ReportedContentTypeFilter,
): ReportedContent[] => {
  const normalizedSearch = search.trim().toLowerCase();

  return reports.filter((report) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      report.reportedItemName.toLowerCase().includes(normalizedSearch) ||
      report.reporterName.toLowerCase().includes(normalizedSearch) ||
      report.reason.toLowerCase().includes(normalizedSearch) ||
      report.description.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;

    const matchesType = typeFilter === "all" || report.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });
};
