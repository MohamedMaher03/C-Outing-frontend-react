import type { OnboardingPreferences } from "./index";

export interface OnboardingDataSource {
  submitPreferences: (
    userId: string,
    preferences: OnboardingPreferences,
  ) => Promise<void>;
  updatePreferences: (
    userId: string,
    preferences: Partial<OnboardingPreferences>,
  ) => Promise<void>;
}
