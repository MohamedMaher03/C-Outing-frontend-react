import type { OnboardingPreferences } from "@/features/onboarding/types";
import {
  mapSubmitPreferences,
  mapUpdatePreferences,
} from "../mappers/onboardingMapper";
import { normalizeUserId } from "../utils/onboardingPreferences";
import { onboardingDataSource } from "./onboardingDataSource";

export const onboardingService = {
  async submitPreferences(
    userId: string,
    preferences: OnboardingPreferences,
  ): Promise<void> {
    const normalizedUserId = normalizeUserId(userId);
    await onboardingDataSource.submitPreferences(
      normalizedUserId,
      mapSubmitPreferences(preferences),
    );
  },

  async updatePreferences(
    userId: string,
    preferences: Partial<OnboardingPreferences>,
  ): Promise<void> {
    const normalizedUserId = normalizeUserId(userId);
    const mapped = mapUpdatePreferences(preferences);
    if (Object.keys(mapped).length === 0) return;
    await onboardingDataSource.updatePreferences(normalizedUserId, mapped);
  },
};

export const submitOnboardingPreferences =
  onboardingService.submitPreferences.bind(onboardingService);
export const updateUserPreferences =
  onboardingService.updatePreferences.bind(onboardingService);
