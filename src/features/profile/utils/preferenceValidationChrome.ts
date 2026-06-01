import type { PreferenceValidationField } from "@/features/onboarding/utils/onboardingPreferences";
import type { PreferenceValidationIssue } from "@/features/onboarding/utils/onboardingPreferences";

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
