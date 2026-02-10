/**
 * Interaction Service
 * Tracks user interactions and handles ratings/reviews
 */

import { apiClient } from "./client";
import { API_ENDPOINTS } from "../../config/api";
import { Interaction, ApiResponse } from "../../types";

export const interactionService = {
  /**
   * Track user interaction (click, view, etc.)
   */
  async trackInteraction(
    interaction: Omit<Interaction, "interactionId">,
  ): Promise<Interaction> {
    const response = await apiClient.post<ApiResponse<Interaction>>(
      API_ENDPOINTS.interactions.track,
      interaction,
    );
    return response.data!;
  },

  /**
   * Submit venue rating and optional comment
   */
  async submitRating(
    venueId: number,
    ratingValue: number,
    comment?: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.ratings.submit(venueId), {
      ratingValue,
      comment,
    });
  },
};
