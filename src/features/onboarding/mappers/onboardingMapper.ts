import type { OnboardingPreferences } from "../types";
import {
  normalizeOnboardingPreferences,
  normalizePartialOnboardingPreferences,
} from "../utils/onboardingPreferences";

export const mapSubmitPreferences = (
  preferences: OnboardingPreferences,
): OnboardingPreferences => normalizeOnboardingPreferences(preferences);

export const mapUpdatePreferences = (
  preferences: Partial<OnboardingPreferences>,
): Partial<OnboardingPreferences> =>
  normalizePartialOnboardingPreferences(preferences);
