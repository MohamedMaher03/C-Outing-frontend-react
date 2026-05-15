import type { PriceLevel } from "@/features/admin/types";
export interface OnboardingPreferences {
  interests: string[];
  vibe: number;
  districts: string[];
  budget: PriceLevel | null;
  favoriteActivities: string[];
  companionTypes: string[];
}

export type { OnboardingDataSource } from "./dataSource";
