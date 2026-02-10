/**
 * User Service
 * Handles user profile and preferences management
 */

import { apiClient } from "./client";
import { API_ENDPOINTS } from "../../config/api";
import { User, UserPreferences, ApiResponse } from "../../types";

export const userService = {
  /**
   * Get user profile
   */
  async getProfile(userId: number): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.users.getProfile(userId),
    );
    return response.data!;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: number, data: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.users.updateProfile(userId),
      data,
    );
    return response.data!;
  },

  /**
   * Get user preferences
   */
  async getPreferences(userId: number): Promise<UserPreferences> {
    const response = await apiClient.get<ApiResponse<UserPreferences>>(
      API_ENDPOINTS.users.getPreferences(userId),
    );
    return response.data!;
  },

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: number,
    preferences: Partial<UserPreferences>,
  ): Promise<UserPreferences> {
    const response = await apiClient.put<ApiResponse<UserPreferences>>(
      API_ENDPOINTS.users.updatePreferences(userId),
      preferences,
    );
    return response.data!;
  },
};
