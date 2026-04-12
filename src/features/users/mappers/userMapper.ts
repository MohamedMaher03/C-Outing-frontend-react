import type { PaginatedResponse } from "@/types";
import type { PublicUserProfile, UserReviewActivity } from "../types";
import type { UserProfileDto, UserReviewDto } from "../types/dataSource";

const clampRating = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.min(5, Math.max(0, Math.round(value)));
};

const normalizeDateString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

export const mapProfileDtoToPublicProfile = (
  dto: UserProfileDto,
  reviewCount = 0,
): PublicUserProfile => {
  const safeName = dto.name?.trim() || "Outing User";

  return {
    userId: String(dto.id ?? ""),
    name: safeName,
    email: dto.email?.trim() || undefined,
    avatar: dto.avatarUrl,
    bio: dto.bio?.trim() || undefined,
    reviewCount: Number.isFinite(reviewCount) ? Math.max(0, reviewCount) : 0,
    joinedDate: normalizeDateString(dto.createdAt),
    age: Number.isFinite(dto.age) ? Math.max(0, Number(dto.age)) : undefined,
    role: Number.isFinite(dto.role) ? Number(dto.role) : undefined,
    totalInteractions: Number.isFinite(dto.totalInteractions)
      ? Math.max(0, Number(dto.totalInteractions))
      : undefined,
    isBanned: Boolean(dto.isBanned),
    isEmailVerified: Boolean(dto.isEmailVerified),
  };
};

export const mapReviewDtoToActivity = (
  dto: UserReviewDto,
): UserReviewActivity => {
  const safePlaceName = dto.venueName?.trim() || "Unknown place";

  return {
    reviewId: String(dto.id ?? ""),
    placeId: String(dto.venueId ?? ""),
    placeName: safePlaceName,
    rating: clampRating(dto.rating),
    comment: dto.comment?.trim() || "No comment provided.",
    date: normalizeDateString(dto.createdAt) ?? new Date(0).toISOString(),
    sentimentScore:
      typeof dto.sentimentScore === "number" &&
      Number.isFinite(dto.sentimentScore)
        ? dto.sentimentScore
        : undefined,
    userAvatar: dto.userAvatar,
  };
};

export const mapReviewsPageToActivity = (
  reviewsPage: PaginatedResponse<UserReviewDto>,
): UserReviewActivity[] => {
  if (!Array.isArray(reviewsPage.items)) return [];
  return reviewsPage.items.map(mapReviewDtoToActivity);
};

export const buildFallbackPublicProfileFromReviews = (
  userId: string,
  reviewsPage: PaginatedResponse<UserReviewDto>,
): PublicUserProfile => {
  const firstReview = reviewsPage.items[0];

  return {
    userId,
    name: firstReview?.userName?.trim() || "Outing User",
    avatar: firstReview?.userAvatar,
    reviewCount: Math.max(0, reviewsPage.totalCount || 0),
    joinedDate: undefined,
  };
};
