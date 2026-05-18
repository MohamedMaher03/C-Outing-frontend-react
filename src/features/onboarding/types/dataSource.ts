import type { OnboardingPreferences } from "./index";

export interface OnboardingDataSource {
  submitPreferences: (preferences: OnboardingPreferences) => Promise<void>;
}
