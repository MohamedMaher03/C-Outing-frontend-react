import type { OnboardingPreferences } from "../types";
import { normalizeOnboardingPreferences } from "../utils/onboardingPreferences";

export const mapSubmitPreferences = (
  preferences: OnboardingPreferences,
): OnboardingPreferences => normalizeOnboardingPreferences(preferences);
