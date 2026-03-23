import type { PublicUserProfile, UserReviewActivity } from "../types";
import {
  userApi,
  type BackendUserProfileDto,
  type BackendUserReviewDto,
} from "../api/userApi";

// ── Public Profile ───────────────────────────────────────────────────────────

const mapProfileDtoToPublicProfile = (
  dto: BackendUserProfileDto,
  reviewCount?: number,
): PublicUserProfile => ({
  userId: dto.id,
  name: dto.name,
  email: dto.email,
  avatar: dto.avatarUrl,
  bio: dto.bio,
  reviewCount: reviewCount ?? 0,
  joinedDate: dto.createdAt,
  age: dto.age,
  role: dto.role,
  totalInteractions: dto.totalInteractions,
  isBanned: dto.isBanned,
  isEmailVerified: dto.isEmailVerified,
});

const mapReviewDtoToActivity = (dto: BackendUserReviewDto): UserReviewActivity => ({
  reviewId: dto.id,
  placeId: dto.venueId,
  placeName: dto.venueName,
  rating: dto.rating,
  comment: dto.comment,
  date: dto.createdAt,
  sentimentScore: dto.sentimentScore,
  userAvatar: dto.userAvatar,
});

interface PublicProfileBundle {
  profile: PublicUserProfile;
  reviews: UserReviewActivity[];
}

/**
 * Fetches public profile data + recent reviews with backend-aware fallbacks.
 *
 * For own profile, uses /api/v1/User/profile.
 * For any user, uses /api/v1/Review/user/{userId} for review activity.
 * If dedicated public-profile-by-id is not available yet, review payload is
 * used as a graceful profile fallback for public pages.
 */
export const getPublicProfileBundle = async (
  userId: string,
  currentUserId?: string,
): Promise<PublicProfileBundle> => {
  try {
    const reviewsResult = await userApi.getUserReviews(userId, 1, 10);
    const reviews = reviewsResult.items.map(mapReviewDtoToActivity);

    if (currentUserId && currentUserId === userId) {
      const ownProfile = await userApi.getCurrentProfile();
      return {
        profile: mapProfileDtoToPublicProfile(ownProfile, reviewsResult.totalCount),
        reviews,
      };
    }

    try {
      const publicProfile = await userApi.getPublicProfile(userId);
      return {
        profile: mapProfileDtoToPublicProfile(
          publicProfile,
          reviewsResult.totalCount,
        ),
        reviews,
      };
    } catch {
      const fallbackName = reviewsResult.items[0]?.userName ?? "Outing User";
      const fallbackAvatar = reviewsResult.items[0]?.userAvatar;

      return {
        profile: {
          userId,
          name: fallbackName,
          avatar: fallbackAvatar,
          reviewCount: reviewsResult.totalCount,
          joinedDate: undefined,
        },
        reviews,
      };
    }
  } catch (error) {
    console.error("Error fetching public profile bundle:", error);
    throw new Error("Failed to load public profile");
  }
};
