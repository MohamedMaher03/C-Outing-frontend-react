import type { PublicUserProfile, UserReviewActivity } from "../types";
//import { userApi } from "../api/userApi";  (WHEN INTEGRATE WITH BACKEND USE THIS AND REMOVE ONE DOWN)
import { usersMock as userApi } from "../mocks/usersMock";

// ── Public Profile ───────────────────────────────────────────────────────────

/**
 * Fetch a public profile by userId.
 * The `currentUserId` is passed so the service can flag own-profile views.
 */
export const getPublicProfile = async (
  userId: string,
  currentUserId?: string,
): Promise<PublicUserProfile> => {
  try {
    const profile = await userApi.getPublicProfile(userId, currentUserId);
    return profile;
  } catch (error) {
    console.error("Error fetching public profile:", error);
    throw new Error("Failed to load public profile");
  }
};

// ── User Reviews ─────────────────────────────────────────────────────────────

/** Fetch the recent review activity for a given user */
export const getUserReviews = async (
  userId: string,
): Promise<UserReviewActivity[]> => {
  try {
    const reviews = await userApi.getUserReviews(userId);
    return reviews;
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    throw new Error("Failed to load user reviews");
  }
};

// ── Follow / Unfollow ────────────────────────────────────────────────────────

/**
 * Toggle follow status.
 * The mock simply flips isFollowing in memory; the real backend
 * manages the social graph.
 */
export const toggleFollow = async (
  userId: string,
  currentlyFollowing: boolean,
): Promise<{ isFollowing: boolean }> => {
  try {
    const response = await userApi.follow(userId, currentlyFollowing);
    return response;
  } catch (error) {
    console.error("Error toggling follow status:", error);
    throw new Error("Failed to update follow status");
  }
};
