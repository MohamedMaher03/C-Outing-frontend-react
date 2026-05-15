import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type { OnboardingPreferences } from "../types";
import type { OnboardingDataSource } from "../types/dataSource";

interface OnboardingPayload {
  interests: string[];
  vibe: number;
  preferredDistricts: string[];
  budgetRange: string | null;
  favorite_activities: string[];
  companion_type: string[];
}

export const onboardingApi: OnboardingDataSource = {
  async submitPreferences(
    userId: string,
    preferences: OnboardingPreferences,
  ): Promise<void> {
    const payload: OnboardingPayload = {
      interests: preferences.interests,
      vibe: preferences.vibe,
      preferredDistricts: preferences.districts,
      budgetRange: preferences.budget ?? null,
      favorite_activities: preferences.favoriteActivities,
      companion_type: preferences.companionTypes,
    };
    await axiosInstance.post(
      API_ENDPOINTS.onboarding.submitPreferences(userId),
      payload,
    );
  },

  async updatePreferences(
    userId: string,
    preferences: Partial<OnboardingPreferences>,
  ): Promise<void> {
    const payload: Partial<OnboardingPayload> = {};
    if (preferences.interests !== undefined)
      payload.interests = preferences.interests;
    if (preferences.vibe !== undefined) payload.vibe = preferences.vibe;
    if (preferences.districts !== undefined)
      payload.preferredDistricts = preferences.districts;
    if (preferences.budget !== undefined)
      payload.budgetRange = preferences.budget ?? null;
    if (preferences.favoriteActivities !== undefined)
      payload.favorite_activities = preferences.favoriteActivities;
    if (preferences.companionTypes !== undefined)
      payload.companion_type = preferences.companionTypes;
    await axiosInstance.patch(
      API_ENDPOINTS.onboarding.updatePreferences(userId),
      payload,
    );
  },
};
