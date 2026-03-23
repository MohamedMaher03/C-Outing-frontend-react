/**
 * Users API Layer
 *
 * Pure HTTP functions for the users/public profile endpoints.
 * Uses the shared axiosInstance so the auth token is injected automatically.
 */

import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type { PaginatedResponse } from "@/types";

export interface BackendUserProfileDto {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  age: number;
  role: number;
  totalInteractions: number;
  isBanned: boolean;
  isEmailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  bio?: string;
}

export interface BackendUserReviewDto {
  id: string;
  venueId: string;
  venueName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  rating: number;
  sentimentScore: number;
  createdAt: string;
  updatedAt: string;
}

// NOTE: All axiosInstance calls below use `T` as the generic (not `ApiResponse<T>`).
// The axiosInstance response interceptor automatically unwraps the
// { success, data: T, message } envelope, so response.data IS T directly.

export const userApi = {
  /**
   * GET /api/v1/User/profile
   * Returns the authenticated current user's profile payload.
   */
  async getCurrentProfile(): Promise<BackendUserProfileDto> {
    const { data } = await axiosInstance.get<BackendUserProfileDto>(
      API_ENDPOINTS.profile.getCurrentProfile,
    );
    return data;
  },

  /**
   * GET /api/v1/User/{userId}/profile
   * Public profile endpoint for another user (pending backend confirmation).
   */
  async getPublicProfile(userId: string): Promise<BackendUserProfileDto> {
    const { data } = await axiosInstance.get<BackendUserProfileDto>(
      API_ENDPOINTS.users.getPublicProfile(userId),
    );
    return data;
  },

  /**
   * GET /api/v1/Review/user/{userId}
   * Returns the recent review activity for the given user.
   */
  async getUserReviews(
    userId: string,
    pageIndex = 1,
    pageSize = 10,
  ): Promise<PaginatedResponse<BackendUserReviewDto>> {
    const { data } = await axiosInstance.get<PaginatedResponse<BackendUserReviewDto>>(
      API_ENDPOINTS.users.getReviews(userId),
      {
        params: { pageIndex, pageSize },
      },
    );
    return data;
  },
};
