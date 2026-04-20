import { MOCK_PUBLIC_PROFILES, MOCK_USER_REVIEWS } from "./index";
import type { PaginatedResponse } from "@/types";
import type {
  UserProfileDto,
  UserReviewDto,
  UsersDataSource,
} from "../types/dataSource";

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const toIsoString = (value: Date | string | undefined): string | undefined => {
  if (!value) return undefined;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

const resolveMockUserId = (rawUserId: string): string | null => {
  const normalized = rawUserId.trim();
  if (!normalized) return null;

  if (MOCK_PUBLIC_PROFILES[normalized]) return normalized;
  const prefixed = `u${normalized}`;
  if (MOCK_PUBLIC_PROFILES[prefixed]) return prefixed;
  return null;
};

const profileToDto = (resolvedUserId: string): UserProfileDto => {
  const profile = MOCK_PUBLIC_PROFILES[resolvedUserId];

  return {
    id: profile.userId,
    name: profile.name,
    email: `${profile.userId}@mock.couting.local`,
    age: profile.age,
    role: profile.role ?? 1,
    totalInteractions: profile.totalInteractions ?? profile.reviewCount,
    isBanned: profile.isBanned ?? false,
    isEmailVerified: profile.isEmailVerified ?? true,
    avatarUrl: profile.avatar,
    createdAt: toIsoString(profile.joinedDate) ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bio: profile.bio,
  };
};

const reviewToDto = (
  review: (typeof MOCK_USER_REVIEWS)[string][number],
  fallbackProfileName: string,
  fallbackAvatar?: string,
): UserReviewDto => ({
  id: review.reviewId,
  venueId: review.placeId,
  venueName: review.placeName,
  userId: "",
  userName: fallbackProfileName,
  userAvatar: review.userAvatar ?? fallbackAvatar,
  comment: review.comment,
  rating: review.rating,
  sentimentScore: review.sentimentScore,
  createdAt: toIsoString(review.date) ?? new Date().toISOString(),
  updatedAt: toIsoString(review.date) ?? new Date().toISOString(),
});

const paginate = <T>(
  items: T[],
  pageIndex: number,
  pageSize: number,
): PaginatedResponse<T> => {
  const safePageSize = Math.max(1, Number.isFinite(pageSize) ? pageSize : 10);
  const safePageIndex = Math.max(1, Number.isFinite(pageIndex) ? pageIndex : 1);
  const start = (safePageIndex - 1) * safePageSize;
  const pagedItems = items.slice(start, start + safePageSize);
  const totalCount = items.length;
  const totalPages =
    totalCount === 0 ? 0 : Math.ceil(totalCount / safePageSize);

  return {
    items: pagedItems,
    pageIndex: safePageIndex,
    pageSize: safePageSize,
    totalCount,
    totalPages,
    hasPreviousPage: safePageIndex > 1,
    hasNextPage: totalPages > 0 && safePageIndex < totalPages,
  };
};

const getDefaultResolvedUserId = (): string => {
  if (MOCK_PUBLIC_PROFILES["1"]) return "1";
  if (MOCK_PUBLIC_PROFILES.u1) return "u1";

  const firstProfileKey = Object.keys(MOCK_PUBLIC_PROFILES)[0];
  return firstProfileKey;
};

export const usersMock: UsersDataSource = {
  async getCurrentProfile(): Promise<UserProfileDto> {
    await delay(300);

    const resolvedUserId = getDefaultResolvedUserId();
    if (!resolvedUserId) {
      throw new Error("No mock user profiles are configured.");
    }

    return profileToDto(resolvedUserId);
  },

  async getPublicProfile(userId: string): Promise<UserProfileDto> {
    await delay(450);

    const resolvedUserId = resolveMockUserId(userId);
    if (!resolvedUserId) {
      throw new Error("Profile not found");
    }

    return profileToDto(resolvedUserId);
  },

  async getUserReviews(
    userId: string,
    pageIndex = 1,
    pageSize = 10,
  ): Promise<PaginatedResponse<UserReviewDto>> {
    await delay(250);

    const resolvedUserId = resolveMockUserId(userId);
    if (!resolvedUserId) {
      return paginate([], pageIndex, pageSize);
    }

    const profile = MOCK_PUBLIC_PROFILES[resolvedUserId];
    const mappedReviews = (MOCK_USER_REVIEWS[resolvedUserId] ?? []).map(
      (review) => reviewToDto(review, profile.name, profile.avatar),
    );

    return paginate(mappedReviews, pageIndex, pageSize);
  },
};
