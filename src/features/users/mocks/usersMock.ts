/**
  users mock implemenation
  Drop-in replacement for userApi — mirrors the same interface so it can
    be swapped in userService.ts without changing any other code:
    // userService.ts — swap this one line:
    import { usersMock as userApi } from "../mocks/usersMock";
    Simulates realistic network latency and in-memory data storage.
 */

import { MOCK_PUBLIC_PROFILES, MOCK_USER_REVIEWS } from "./index";
import type { PublicUserProfile, UserReviewActivity } from "../types";

// ── Helper ───────────────────────────────────────────────────

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const usersMock = {
  async getPublicProfile(
    userId: string,
    _currentUserId?: string,
  ): Promise<PublicUserProfile> {
    await delay(500);
    const profile = MOCK_PUBLIC_PROFILES[userId];
    if (!profile) {
      throw new Error("Profile not found");
    }
    return profile;
  },

  /**
   * Mock getUserReviews
   */
  async getUserReviews(userId: string): Promise<UserReviewActivity[]> {
    await delay(300);
    return MOCK_USER_REVIEWS[userId] ?? [];
  },
};
