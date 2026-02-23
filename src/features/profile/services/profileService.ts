/**
 * Profile Service
 * Handles all API calls related to user profile and preferences
 */

// import { apiClient } from "./client"; // TODO: Uncomment when backend is ready

import type {
  UserProfile,
  UserPreferences,
  UpdatePreferencesRequest,
} from "@/features/profile/types";
import {
  MOCK_PROFILE,
  MOCK_PREFERENCES as INITIAL_PREFERENCES,
} from "@/features/profile/mocks";

// Re-export types for backward compatibility
export type { UserProfile, UserPreferences, UpdatePreferencesRequest };

// Mutable copy of preferences for mock mutations
let MOCK_PREFERENCES: UserPreferences = { ...INITIAL_PREFERENCES };

// ============ Service Functions ============

/**
 * Fetch user profile
 * TODO: Replace with real API call when backend is ready
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return Promise.resolve(MOCK_PROFILE);

  // TODO: Uncomment when backend is ready
  // return apiClient.get<UserProfile>("/profile");
};

/**
 * Update user profile
 * TODO: Replace with real API call when backend is ready
 */
export const updateUserProfile = async (
  data: Partial<UserProfile>,
): Promise<UserProfile> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return Promise.resolve({ ...MOCK_PROFILE, ...data });

  // TODO: Uncomment when backend is ready
  // return apiClient.put<UserProfile>("/profile", data);
};

/**
 * Fetch user preferences
 * TODO: Replace with real API call when backend is ready
 */
export const getUserPreferences = async (): Promise<UserPreferences> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return Promise.resolve(MOCK_PREFERENCES);

  // TODO: Uncomment when backend is ready
  // return apiClient.get<UserPreferences>("/profile/preferences");
};

/**
 * Update user preferences
 * TODO: Replace with real API call when backend is ready
 */
export const updateUserPreferences = async (
  data: UpdatePreferencesRequest,
): Promise<UserPreferences> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  MOCK_PREFERENCES = { ...MOCK_PREFERENCES, ...data };
  return Promise.resolve(MOCK_PREFERENCES);

  // TODO: Uncomment when backend is ready
  // return apiClient.put<UserPreferences>("/profile/preferences", data);
};

/**
 * Sign out user
 * TODO: Replace with real API call when backend is ready
 */
export const signOut = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return Promise.resolve();

  // TODO: Uncomment when backend is ready
  // await apiClient.post("/auth/logout");
  // apiClient.clearToken();
};
