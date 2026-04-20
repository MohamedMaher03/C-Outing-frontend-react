import {
  PRICE_LEVEL_VALUES,
  type CanonicalPriceLevel,
} from "@/utils/priceLevels";
import type { OnboardingPreferences } from "../types";
import { isNonEmptyString } from "@/utils/typeGuards";

const MAX_INTERESTS = 12;
const MAX_DISTRICTS = 12;
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

export const normalizeOnboardingPreferences = (
  preferences: OnboardingPreferences,
): OnboardingPreferences => {
  const normalized: OnboardingPreferences = {
    interests: normalizeStringList(preferences.interests, MAX_INTERESTS),
    vibe: normalizeVibe(preferences.vibe),
    districts: normalizeStringList(preferences.districts, MAX_DISTRICTS),
    budget: normalizeBudget(preferences.budget),
  };

  if (normalized.interests.length < 2) {
    throw new Error("Please choose at least two interests.");
  }

  if (normalized.districts.length < 1) {
    throw new Error("Please choose at least one district.");
  }

  if (!normalized.budget) {
    throw new Error("Please choose a budget range.");
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

  return normalized;
};
