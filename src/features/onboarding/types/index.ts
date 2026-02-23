/**
 * Onboarding Feature — Type Definitions
 */

/** User onboarding preferences data structure */
export interface OnboardingPreferences {
  interests: string[];
  vibe: number;
  districts: string[];
  budget: "Low" | "Medium" | "High" | null;
}
