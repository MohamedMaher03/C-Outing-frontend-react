/**
 * Onboarding Feature — Type Definitions
 */

import type { PriceLevel } from "@/features/admin/types";

/** User onboarding preferences data structure */
export interface OnboardingPreferences {
  interests: string[];
  vibe: number;
  districts: string[];
  budget: PriceLevel | null;
}

export type { OnboardingDataSource } from "./dataSource";
