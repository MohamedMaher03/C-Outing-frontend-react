import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type { OnboardingPreferences } from "../types";
import type { OnboardingDataSource } from "../types/dataSource";


interface OnboardingRequestBody {
  loveInterests: string[];
  vibeLevel: number;
  preferredDistricts: string[];
  preferredBudget: string;
  favoriteActivities: string[];
  companionType: string[];
}

export const onboardingApi: OnboardingDataSource = {
  // _userId is normalized by the service layer; JWT carries identity to the server.
  async submitPreferences(_userId: string, preferences: OnboardingPreferences): Promise<void> {
    const body: OnboardingRequestBody = {
      loveInterests: preferences.interests,
      vibeLevel: preferences.vibe,
      preferredDistricts: preferences.districts,
      preferredBudget: preferences.budget ?? "",
      favoriteActivities: preferences.favoriteActivities,
      companionType: preferences.companionTypes,
    };

    await axiosInstance.post(API_ENDPOINTS.onboarding.submit, body);
  },

  // Partial preference updates — implement when the backend endpoint is available.
  async updatePreferences(_userId: string, _preferences: Partial<OnboardingPreferences>): Promise<void> {
    // TODO: wire up PATCH /preferences endpoint
  },
};
