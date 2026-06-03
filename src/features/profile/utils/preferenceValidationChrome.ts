import type { PreferenceValidationField } from "@/features/onboarding/utils/onboardingPreferences";
import type { PreferenceValidationIssue } from "@/features/onboarding/utils/onboardingPreferences";

export const PREFERENCE_SECTION_IDS: Record<PreferenceValidationField, string> =
  {
    interests: "preference-section-interests",
    vibe: "preference-section-vibe",
    districts: "preference-section-districts",
    budget: "preference-section-budget",
    favoriteActivities: "preference-section-activities",
    companionTypes: "preference-section-companions",
  };

export const scrollToPreferenceSection = (
  field: PreferenceValidationField,
): void => {
  const section = document.getElementById(PREFERENCE_SECTION_IDS[field]);
  if (!section) {
    return;
  }

  section.scrollIntoView({ behavior: "smooth", block: "center" });

  window.setTimeout(() => {
    if (section instanceof HTMLElement) {
      section.focus({ preventScroll: true });
    }
  }, 350);
};

export const preferenceFieldHasIssue = (
  issues: readonly PreferenceValidationIssue[],
  field: PreferenceValidationField,
): boolean => issues.some((issue) => issue.field === field);

export const buildPreferenceFieldIssueLookup = (
  issues: readonly PreferenceValidationIssue[],
): Partial<Record<PreferenceValidationField, true>> =>
  Object.fromEntries(
    issues.map((issue) => [issue.field, true] as const),
  ) as Partial<Record<PreferenceValidationField, true>>;
