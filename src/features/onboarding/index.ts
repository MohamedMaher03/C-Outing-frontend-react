/**
 * Onboarding Feature — Public API
 */

// Hooks
export { useOnboarding } from "./hooks/useOnboarding";

// API layer (exposed for advanced usage / testing)
export { onboardingApi } from "./api/onboardingApi";

// Services
export {
  onboardingService,
  submitOnboardingPreferences,
  updateUserPreferences,
} from "./services/onboardingService";

// Types
export type { OnboardingPreferences } from "./types";

// Mocks (development use)
export { onboardingMock } from "./mocks/onboardingMock";
