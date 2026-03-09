/**
 * Onboarding Service — Business Logic Layer
 *
 * Sits between hooks/components and the HTTP layer (onboardingApi).
 * Responsibilities:
 *   • Call onboardingApi functions
 *   • Transform DTOs to UI models if needed
 *   • Centralise error handling
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  useOnboarding  →  onboardingService  →  onboardingApi  →  axios│
 * └──────────────────────────────────────────────────────────────────┘
 *
 * 🔧 To use mocks during development, swap the import:
 *   import { onboardingMock as onboardingApi } from "../mocks/onboardingMock";
 */

// import { onboardingApi } from "../api/onboardingApi"; // (WHEN INTEGRATE WITH BACKEND USE THIS AND REMOVE ONE DOWN)
import { onboardingMock as onboardingApi } from "../mocks/onboardingMock";
import type { OnboardingPreferences } from "@/features/onboarding/types";

// ── Onboarding Service ───────────────────────────────────────

export const onboardingService = {
  /**
   * Submit user onboarding preferences.
   */
  async submitPreferences(
    userId: string,
    preferences: OnboardingPreferences,
  ): Promise<void> {
    try {
      await onboardingApi.submitPreferences(userId, preferences);
    } catch (error) {
      console.error("Error submitting onboarding preferences:", error);
      throw new Error("Failed to submit preferences");
    }
  },

  /**
   * Update user preferences (can be called after initial onboarding).
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<OnboardingPreferences>,
  ): Promise<void> {
    try {
      await onboardingApi.updatePreferences(userId, preferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      throw new Error("Failed to update preferences");
    }
  },
};

// ── Legacy named exports (keep backward compatibility with hooks) ──

export const submitOnboardingPreferences = onboardingService.submitPreferences;
export const updateUserPreferences = onboardingService.updatePreferences;
