import type { PreferenceValidationCode, PreferenceValidationIssue } from "./onboardingPreferences";

export const PREFERENCE_VALIDATION_I18N_KEYS: Record<
  PreferenceValidationCode,
  string
> = {
  interests_min: "preferences.validation.interestsMin",
  districts_min: "preferences.validation.districtsMin",
  budget_required: "preferences.validation.budgetRequired",
  activities_min: "preferences.validation.activitiesMin",
  companions_min: "preferences.validation.companionsMin",
};

type TranslateFn = (
  key: string,
  params?: Record<string, string | number>,
) => string;

export const formatPreferenceValidationIssues = (
  issues: PreferenceValidationIssue[],
  t: TranslateFn,
): string[] =>
  issues.map((issue) => t(PREFERENCE_VALIDATION_I18N_KEYS[issue.code]));
