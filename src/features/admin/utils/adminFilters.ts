import type {
  AdminPlace,
  AdminPlaceStatusFilter,
  AdminReview,
  AdminReviewStatusFilter,
  AdminUser,
  AdminUserRoleFilter,
} from "../types";
import { normalizeSearchTerm } from "@/utils/textNormalization";

export const filterUsers = (
  users: AdminUser[],
  search: string,
  roleFilter: AdminUserRoleFilter,
): AdminUser[] => {
  const normalizedSearch = normalizeSearchTerm(search);

  return users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });
};

export const filterPlaces = (
  places: AdminPlace[],
  search: string,
  statusFilter: AdminPlaceStatusFilter,
): AdminPlace[] => {
  const normalizedSearch = normalizeSearchTerm(search);

  return places.filter((place) => {
    const matchesSearch =
      place.name.toLowerCase().includes(normalizedSearch) ||
      place.district.toLowerCase().includes(normalizedSearch);
    const matchesStatus =
      statusFilter === "all" || place.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
};

export const filterReviews = (
  reviews: AdminReview[],
  search: string,
  statusFilter: AdminReviewStatusFilter,
): AdminReview[] => {
  const normalizedSearch = normalizeSearchTerm(search);

  return reviews.filter((review) => {
    const matchesSearch =
      review.userName.toLowerCase().includes(normalizedSearch) ||
      review.placeName.toLowerCase().includes(normalizedSearch) ||
      review.comment.toLowerCase().includes(normalizedSearch);
    const matchesStatus =
      statusFilter === "all" || review.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
};
