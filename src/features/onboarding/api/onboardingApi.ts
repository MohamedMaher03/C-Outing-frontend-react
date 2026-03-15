/**
 * Onboarding API Layer
 *
 * Pure HTTP functions — no business logic, no side effects, no storage.
 * Each function maps 1-to-1 with a backend endpoint.
 *
 * The shared axios instance (src/config/axios.config.ts) handles:
 *   • Attaching the Authorization header on every request
 *   • Handling 401 responses globally
 *
 * To switch to mocks during development, swap the import in onboardingService.ts:
 *   import { onboardingMock as onboardingApi } from "../mocks/onboardingMock";
 */

import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type { OnboardingPreferences } from "../types";

/** Transformed payload sent to the backend */
interface OnboardingPayload {
  interests: string[];
  vibe: number;
  preferredDistricts: string[];
  budgetRange: string | null;
}

export const onboardingApi = {
  /**
   * POST /users/:userId/preferences
   * Submits the initial onboarding preferences.
   */
  async submitPreferences(
    userId: string,
    preferences: OnboardingPreferences,
  ): Promise<void> {
    const payload: OnboardingPayload = {
      interests: preferences.interests,
      vibe: preferences.vibe,
      preferredDistricts: preferences.districts,
      budgetRange: preferences.budget ?? null,
    };
    await axiosInstance.post(
      API_ENDPOINTS.onboarding.submitPreferences(userId),
      payload,
    );
  },

  /**
   * PATCH /users/:userId/preferences
   * Updates preferences after the initial onboarding has been completed.
   * Transforms frontend field names to the backend payload shape.
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<OnboardingPreferences>,
  ): Promise<void> {
    const payload: Partial<OnboardingPayload> = {};
    if (preferences.interests !== undefined)
      payload.interests = preferences.interests;
    if (preferences.vibe !== undefined) payload.vibe = preferences.vibe;
    if (preferences.districts !== undefined)
      payload.preferredDistricts = preferences.districts;
    if (preferences.budget !== undefined)
      payload.budgetRange = preferences.budget ?? null;
    await axiosInstance.patch(
      API_ENDPOINTS.onboarding.updatePreferences(userId),
      payload,
    );
  },
};
