import type { OnboardingPreferences } from "@/features/onboarding/types";
import {
  mapSubmitPreferences,
  mapUpdatePreferences,
} from "../mappers/onboardingMapper";
import { onboardingDataSource } from "./onboardingDataSource";
import { normalizeUserId } from "../utils/onboardingPreferences";

export const onboardingService = {
  async submitPreferences(
    userId: string,
    preferences: OnboardingPreferences,
  ): Promise<void> {
    await onboardingDataSource.submitPreferences(
      normalizeUserId(userId),
      mapSubmitPreferences(preferences),
    );
  },

  async updatePreferences(
    userId: string,
    preferences: Partial<OnboardingPreferences>,
  ): Promise<void> {
    const mappedPreferences = mapUpdatePreferences(preferences);

    if (Object.keys(mappedPreferences).length === 0) {
      return;
    }

    await onboardingDataSource.updatePreferences(
      normalizeUserId(userId),
      mappedPreferences,
    );
  },
};

export const submitOnboardingPreferences = onboardingService.submitPreferences;
export const updateUserPreferences = onboardingService.updatePreferences;
