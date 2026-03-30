/**
 * Onboarding Service — Business Logic Layer
 *
 * Sits between hooks/components and the datasource layer.
 * Responsibilities:
 *   • Call onboardingDataSource functions
 *   • Transform DTOs to UI models if needed
 *   • Validate and normalize payloads
 *
 * ┌────────────────────────────────────────────────────────────────────┐
 * │ useOnboarding → onboardingService → onboardingDataSource → API/mock │
 * └────────────────────────────────────────────────────────────────────┘
 */

import type { OnboardingPreferences } from "@/features/onboarding/types";
import {
  mapSubmitPreferences,
  mapUpdatePreferences,
} from "../mappers/onboardingMapper";
import { onboardingDataSource } from "./onboardingDataSource";
import { normalizeUserId } from "../utils/onboardingPreferences";

// ── Onboarding Service ───────────────────────────────────────

export const onboardingService = {
  /**
   * Submit user onboarding preferences.
   */
  async submitPreferences(
    userId: string,
    preferences: OnboardingPreferences,
  ): Promise<void> {
    await onboardingDataSource.submitPreferences(
      normalizeUserId(userId),
      mapSubmitPreferences(preferences),
    );
  },

  /**
   * Update user preferences (can be called after initial onboarding).
   */
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

// ── Legacy named exports (keep backward compatibility with hooks) ──

export const submitOnboardingPreferences = onboardingService.submitPreferences;
export const updateUserPreferences = onboardingService.updatePreferences;
