import type { PaginatedResponse } from "@/types";
import type { PublicUserProfile, UserReviewActivity } from "../types";
import type { UserProfileDto, UserReviewDto } from "../types/dataSource";
import {
  clampRating,
  coerceOptionalIsoDateString,
  coerceTrimmedString,
} from "@/mapper";

export const mapProfileDtoToPublicProfile = (
  dto: UserProfileDto,
  reviewCount = 0,
): PublicUserProfile => ({
  userId: String(dto.id ?? ""),
  name: coerceTrimmedString(dto.name) ?? "Outing User",
  email: coerceTrimmedString(dto.email),
  avatar: dto.avatarUrl,
  bio: coerceTrimmedString(dto.bio),
  reviewCount: Number.isFinite(reviewCount) ? Math.max(0, reviewCount) : 0,
  joinedDate: coerceOptionalIsoDateString(dto.createdAt),
  age: Number.isFinite(dto.age) ? Math.max(0, Number(dto.age)) : undefined,
  role: Number.isFinite(dto.role) ? Number(dto.role) : undefined,
  totalInteractions: Number.isFinite(dto.totalInteractions)
    ? Math.max(0, Number(dto.totalInteractions))
    : undefined,
  isBanned: Boolean(dto.isBanned),
  isEmailVerified: Boolean(dto.isEmailVerified),
});

export const mapReviewDtoToActivity = (
  dto: UserReviewDto,
): UserReviewActivity => ({
  reviewId: String(dto.id ?? ""),
  placeId: String(dto.venueId ?? ""),
  placeName: coerceTrimmedString(dto.venueName) ?? "Unknown place",
  rating: clampRating(dto.rating),
  comment: coerceTrimmedString(dto.comment) ?? "No comment provided.",
  date: coerceOptionalIsoDateString(dto.createdAt) ?? new Date(0).toISOString(),
  sentimentScore:
    typeof dto.sentimentScore === "number" &&
    Number.isFinite(dto.sentimentScore)
      ? dto.sentimentScore
      : undefined,
  userAvatar: dto.userAvatar,
});

export const mapReviewsPageToActivity = (
  reviewsPage: PaginatedResponse<UserReviewDto>,
): UserReviewActivity[] =>
  Array.isArray(reviewsPage.items)
    ? reviewsPage.items.map(mapReviewDtoToActivity)
    : [];

export const buildFallbackPublicProfileFromReviews = (
  userId: string,
  reviewsPage: PaginatedResponse<UserReviewDto>,
): PublicUserProfile => {
  const firstReview = reviewsPage.items[0];

  return {
    userId,
    name: coerceTrimmedString(firstReview?.userName) ?? "Outing User",
    avatar: firstReview?.userAvatar,
    reviewCount: Math.max(0, reviewsPage.totalCount || 0),
    joinedDate: undefined,
  };
};
