import type { OnboardingPreferences } from "@/features/onboarding/types";
import { mapSubmitPreferences } from "../mappers/onboardingMapper";
import { onboardingDataSource } from "./onboardingDataSource";

export const onboardingService = {
  async submitPreferences(preferences: OnboardingPreferences): Promise<void> {
    await onboardingDataSource.submitPreferences(
      mapSubmitPreferences(preferences),
    );
  },
};

export const submitOnboardingPreferences = onboardingService.submitPreferences;
