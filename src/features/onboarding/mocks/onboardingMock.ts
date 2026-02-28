/**
 * Onboarding Mock Implementations
 *
 * Drop-in replacement for onboardingApi — mirrors the same interface so it
 * can be swapped in onboardingService.ts without changing any other code:
 *
 *   // onboardingService.ts — swap this one line:
 *   import { onboardingMock as onboardingApi } from "../mocks/onboardingMock";
 *
 * Simulates realistic network latency.
 */

import type { OnboardingPreferences } from "../types";

// ── Helper ───────────────────────────────────────────────────

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ── Mock Onboarding API ──────────────────────────────────────
// Interface intentionally mirrors onboardingApi so they are interchangeable.

export const onboardingMock = {
  /**
   * Mock POST /users/:userId/preferences
   */
  async submitPreferences(
    userId: number,
    preferences: OnboardingPreferences,
  ): Promise<void> {
    await delay(500);
    console.log(
      "[Mock] Submitting onboarding preferences for user:",
      userId,
      preferences,
    );
  },

  /**
   * Mock PATCH /users/:userId/preferences
   */
  async updatePreferences(
    userId: number,
    preferences: Partial<OnboardingPreferences>,
  ): Promise<void> {
    await delay(400);
    console.log("[Mock] Updating preferences for user:", userId, preferences);
  },
};
