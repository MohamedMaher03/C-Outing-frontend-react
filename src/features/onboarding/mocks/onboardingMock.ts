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
import type { OnboardingDataSource } from "../types/dataSource";

// ── Helper ───────────────────────────────────────────────────

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ── Mock Onboarding API ──────────────────────────────────────
// Interface intentionally mirrors onboardingApi so they are interchangeable.

export const onboardingMock: OnboardingDataSource = {
  /**
   * Mock POST /users/:userId/preferences
   */
  async submitPreferences(
    _userId: string,
    _preferences: OnboardingPreferences,
  ): Promise<void> {
    await delay(500);
  },

  /**
   * Mock PATCH /users/:userId/preferences
   */
  async updatePreferences(
    _userId: string,
    _preferences: Partial<OnboardingPreferences>,
  ): Promise<void> {
    await delay(400);
  },
};
