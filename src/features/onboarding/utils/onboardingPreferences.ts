import {
  PRICE_LEVEL_VALUES,
  type CanonicalPriceLevel,
} from "@/utils/priceLevels";
import type { OnboardingPreferences } from "../types";
import { isNonEmptyString } from "@/utils/typeGuards";

const MAX_INTERESTS = 12;
const MAX_DISTRICTS = 12;
const MAX_ACTIVITIES = 12;
const MAX_COMPANIONS = 6;
const MAX_ITEM_LENGTH = 80;

const normalizeStringList = (input: unknown, maxItems: number): string[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const value of input) {
    if (!isNonEmptyString(value)) {
      continue;
    }

    const trimmed = value.trim().slice(0, MAX_ITEM_LENGTH);
    const dedupeKey = trimmed.toLocaleLowerCase();

    if (!trimmed || seen.has(dedupeKey)) {
      continue;
    }

    normalized.push(trimmed);
    seen.add(dedupeKey);

    if (normalized.length >= maxItems) {
      break;
    }
  }

  return normalized;
};

export const normalizeUserId = (userId: string): string => {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    throw new Error("Missing user identity. Please sign in again.");
  }

  return normalizedUserId;
};

export const normalizeVibe = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 50;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
};

const PRICE_LEVEL_SET = new Set<string>(PRICE_LEVEL_VALUES);

export const normalizeBudget = (value: unknown): CanonicalPriceLevel | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return PRICE_LEVEL_SET.has(normalized)
    ? (normalized as CanonicalPriceLevel)
    : null;
};

export type PreferenceValidationCode =
  | "interests_min"
  | "districts_min"
  | "budget_required"
  | "activities_min"
  | "companions_min";

export type PreferenceValidationField = keyof OnboardingPreferences;

export interface PreferenceValidationIssue {
  code: PreferenceValidationCode;
  field: PreferenceValidationField;
}

const VALIDATION_THROW_MESSAGES: Record<PreferenceValidationCode, string> = {
  interests_min: "Please choose at least two interests.",
  districts_min: "Please choose at least one district.",
  budget_required: "Please choose a budget range.",
  activities_min: "Please choose at least one favorite activity.",
  companions_min: "Please choose at least one companion type.",
};

export const normalizeOnboardingPreferenceFields = (
  preferences: OnboardingPreferences,
): OnboardingPreferences => ({
  interests: normalizeStringList(preferences.interests, MAX_INTERESTS),
  vibe: normalizeVibe(preferences.vibe),
  districts: normalizeStringList(preferences.districts, MAX_DISTRICTS),
  budget: normalizeBudget(preferences.budget),
  favoriteActivities: normalizeStringList(
    preferences.favoriteActivities,
    MAX_ACTIVITIES,
  ),
  companionTypes: normalizeStringList(
    preferences.companionTypes,
    MAX_COMPANIONS,
  ),
});

export const validateOnboardingPreferences = (
  preferences: OnboardingPreferences,
): PreferenceValidationIssue[] => {
  const normalized = normalizeOnboardingPreferenceFields(preferences);
  const issues: PreferenceValidationIssue[] = [];

  if (normalized.interests.length < 2) {
    issues.push({ code: "interests_min", field: "interests" });
  }

  if (normalized.districts.length < 1) {
    issues.push({ code: "districts_min", field: "districts" });
  }

  if (!normalized.budget) {
    issues.push({ code: "budget_required", field: "budget" });
  }

  if (normalized.favoriteActivities.length < 1) {
    issues.push({ code: "activities_min", field: "favoriteActivities" });
  }

  if (normalized.companionTypes.length < 1) {
    issues.push({ code: "companions_min", field: "companionTypes" });
  }

  return issues;
};

export const normalizeOnboardingPreferences = (
  preferences: OnboardingPreferences,
): OnboardingPreferences => {
  const normalized = normalizeOnboardingPreferenceFields(preferences);
  const issues = validateOnboardingPreferences(preferences);

  if (issues.length > 0) {
    throw new Error(VALIDATION_THROW_MESSAGES[issues[0].code]);
  }

  return normalized;
};

export const normalizePartialOnboardingPreferences = (
  preferences: Partial<OnboardingPreferences>,
): Partial<OnboardingPreferences> => {
  const normalized: Partial<OnboardingPreferences> = {};

  if (preferences.interests !== undefined) {
    normalized.interests = normalizeStringList(
      preferences.interests,
      MAX_INTERESTS,
    );
  }

  if (preferences.vibe !== undefined) {
    normalized.vibe = normalizeVibe(preferences.vibe);
  }

  if (preferences.districts !== undefined) {
    normalized.districts = normalizeStringList(
      preferences.districts,
      MAX_DISTRICTS,
    );
  }

  if (preferences.budget !== undefined) {
    normalized.budget = normalizeBudget(preferences.budget);
  }

  if (preferences.favoriteActivities !== undefined) {
    normalized.favoriteActivities = normalizeStringList(
      preferences.favoriteActivities,
      MAX_ACTIVITIES,
    );
  }

  if (preferences.companionTypes !== undefined) {
    normalized.companionTypes = normalizeStringList(
      preferences.companionTypes,
      MAX_COMPANIONS,
    );
  }

  return normalized;
};
