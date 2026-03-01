/**
 * Users API Layer
 *
 * Pure HTTP functions for the public users endpoints.
 * Uses the shared axiosInstance so the auth token is injected automatically.
 *
 * ⚠️  CURRENTLY UNUSED — userService.ts uses mock data.
 *     Uncomment these calls in the service when the backend is ready.
 */

import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type { PublicUserProfile, UserReviewActivity } from "../types";
// NOTE: All axiosInstance calls below use `T` as the generic (not `ApiResponse<T>`).
// The axiosInstance response interceptor automatically unwraps the
// { success, data: T, message } envelope, so response.data IS T directly.

export const userApi = {
  /**
   * GET /users/me
   * Returns the authenticated user's own public-facing profile snapshot.
   */
  async getMe(): Promise<PublicUserProfile> {
    const { data } = await axiosInstance.get<PublicUserProfile>(
      API_ENDPOINTS.users.getMe,
    );
    return data;
  },

  /**
   * GET /users/:id
   * Returns the public profile for any user by ID.
   */
  async getPublicProfile(userId: string): Promise<PublicUserProfile> {
    const { data } = await axiosInstance.get<PublicUserProfile>(
      API_ENDPOINTS.users.getPublicProfile(userId),
    );
    return data;
  },

  /**
   * GET /users/:id/reviews
   * Returns the recent review activity for the given user.
   */
  async getUserReviews(userId: string): Promise<UserReviewActivity[]> {
    const { data } = await axiosInstance.get<UserReviewActivity[]>(
      API_ENDPOINTS.users.getReviews(userId),
    );
    return data;
  },

  /**
   * POST /users/:id/follow
   * Toggle follow status for another user.
   */
  async follow(userId: string): Promise<{ isFollowing: boolean }> {
    const { data } = await axiosInstance.post<{ isFollowing: boolean }>(
      API_ENDPOINTS.users.follow(userId),
    );
    return data;
  },
};
