/**
 * Onboarding Feature — Public API
 */
export { useOnboarding } from "./hooks/useOnboarding";
export {
  submitOnboardingPreferences,
  updateUserPreferences,
} from "./services/onboardingService";
export type { OnboardingPreferences } from "./services/onboardingService";
