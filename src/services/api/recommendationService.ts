/**
 * Recommendation Service
 * Fetches personalized venue recommendations based on user context
 */

import { apiClient } from "./client";
import { API_ENDPOINTS } from "../../config/api";
import { RecommendationResponse, UserContext, ApiResponse } from "../../types";

export const recommendationService = {
  /**
   * Get recommendations for user with context
   */
  async getRecommendations(
    userId: number,
    context?: UserContext,
    limit: number = 10,
    offset: number = 0,
  ): Promise<RecommendationResponse> {
    const params = {
      limit,
      offset,
      ...(context?.mood && { mood: context.mood }),
      ...(context?.companion && { companion: context.companion }),
      ...(context?.budget && { budget: context.budget }),
      ...(context?.timeOfDay && { timeOfDay: context.timeOfDay }),
      ...(context?.weather && { weather: context.weather }),
      ...(context?.location && {
        lat: context.location.lat,
        lng: context.location.lng,
      }),
    };

    const response = await apiClient.get<ApiResponse<RecommendationResponse>>(
      API_ENDPOINTS.recommendations.getByUserId(userId),
      { params },
    );

    return response.data!;
  },
};
