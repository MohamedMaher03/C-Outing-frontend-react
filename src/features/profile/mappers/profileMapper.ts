import { PRICE_LEVEL_VALUES } from "@/utils/priceLevels";
import type {
  EditProfileData,
  NotificationSettings,
  PrivacySettings,
  UpdatePreferencesRequest,
  UpdateUserProfileRequest,
  UserPreferences,
  UserProfile,
} from "../types";
import { isNonEmptyString } from "@/utils/typeGuards";

const DEFAULT_NAME = "Guest User";
const MAX_NAME_LENGTH = 100;
const MAX_BIO_LENGTH = 500;
const MAX_PHONE_LENGTH = 30;
const MAX_LIST_ITEM_LENGTH = 80;
const MAX_INTERESTS = 20;
const MAX_DISTRICTS = 20;

const PRICE_LEVEL_SET = new Set<string>(PRICE_LEVEL_VALUES);

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  push: {
    recommendations: true,
    favorites: true,
    reviews: false,
    updates: true,
  },
  email: {
    monthlyDigest: true,
    promotions: true,
    tips: true,
  },
};

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  showFavorites: false,
  showActivity: true,
  dataCollection: true,
  personalization: true,
};

const getTodayDateString = (): string => new Date().toISOString().slice(0, 10);

const sanitizeName = (value: unknown): string => {
  if (!isNonEmptyString(value)) return DEFAULT_NAME;
  return value.trim().slice(0, MAX_NAME_LENGTH);
};

const sanitizeBio = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_BIO_LENGTH);
};

const sanitizePhone = (value: unknown): string => {
  if (!isNonEmptyString(value)) return "";
  return value.trim().slice(0, MAX_PHONE_LENGTH);
};

const sanitizeStringList = (input: unknown, maxItems: number): string[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const value of input) {
    if (!isNonEmptyString(value)) continue;

    const trimmed = value.trim().slice(0, MAX_LIST_ITEM_LENGTH);
    const dedupeKey = trimmed.toLocaleLowerCase();

    if (!trimmed || seen.has(dedupeKey)) continue;

    normalized.push(trimmed);
    seen.add(dedupeKey);

    if (normalized.length >= maxItems) break;
  }

  return normalized;
};

const normalizeBudget = (value: unknown): UserPreferences["budget"] => {
  if (typeof value === "string" && PRICE_LEVEL_SET.has(value.trim())) {
    return value.trim() as UserPreferences["budget"];
  }

  return "mid_range";
};

export const normalizeBirthDateForInput = (birthDate?: string): string => {
  if (!birthDate) return getTodayDateString();

  const datePart = birthDate.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return getTodayDateString();

  const [year] = datePart.split("-");
  if (!year || Number(year) <= 1) return getTodayDateString();

  return datePart;
};

export const normalizeProfile = (
  profile: Partial<UserProfile> | null | undefined,
  fallbackName?: string,
): UserProfile => {
  const fallback = sanitizeName(fallbackName);

  return {
    id: typeof profile?.id === "string" ? profile.id : "",
    name: sanitizeName(profile?.name ?? fallback),
    email: typeof profile?.email === "string" ? profile.email.trim() : "",
    bio: sanitizeBio(profile?.bio),
    phoneNumber: sanitizePhone(profile?.phoneNumber),
    birthDate: normalizeBirthDateForInput(profile?.birthDate),
    age:
      typeof profile?.age === "number" && Number.isFinite(profile.age)
        ? Math.max(0, Math.floor(profile.age))
        : 0,
    role:
      typeof profile?.role === "number" && Number.isFinite(profile.role)
        ? profile.role
        : 0,
    totalInteractions:
      typeof profile?.totalInteractions === "number" &&
      Number.isFinite(profile.totalInteractions)
        ? Math.max(0, Math.floor(profile.totalInteractions))
        : 0,
    isBanned: Boolean(profile?.isBanned),
    isEmailVerified: Boolean(profile?.isEmailVerified),
    avatarUrl:
      typeof profile?.avatarUrl === "string" && profile.avatarUrl.trim()
        ? profile.avatarUrl.trim()
        : undefined,
    createdAt: typeof profile?.createdAt === "string" ? profile.createdAt : "",
    updatedAt: typeof profile?.updatedAt === "string" ? profile.updatedAt : "",
  };
};

export const mapProfileToEditProfile = (
  profile: UserProfile,
): EditProfileData => ({
  name: sanitizeName(profile.name),
  email: profile.email,
  bio: sanitizeBio(profile.bio),
  phoneNumber: sanitizePhone(profile.phoneNumber),
  birthDate: normalizeBirthDateForInput(profile.birthDate),
  avatarUrl: profile.avatarUrl,
});

export const mapEditProfileToUpdatePayload = (
  input: Partial<EditProfileData>,
): UpdateUserProfileRequest => {
  const payload: UpdateUserProfileRequest = {};

  if (input.name !== undefined) {
    payload.name = sanitizeName(input.name);
  }

  if (input.bio !== undefined) {
    payload.bio = sanitizeBio(input.bio);
  }

  if (input.phoneNumber !== undefined) {
    payload.phoneNumber = sanitizePhone(input.phoneNumber);
  }

  if (input.birthDate !== undefined) {
    payload.birthDate = normalizeBirthDateForInput(input.birthDate);
  }

  return payload;
};

export const mapUpdateProfilePayload = (
  input: UpdateUserProfileRequest,
): UpdateUserProfileRequest => {
  const payload: UpdateUserProfileRequest = {};

  if (input.name !== undefined) {
    payload.name = sanitizeName(input.name);
  }

  if (input.bio !== undefined) {
    payload.bio = sanitizeBio(input.bio);
  }

  if (input.phoneNumber !== undefined) {
    payload.phoneNumber = sanitizePhone(input.phoneNumber);
  }

  if (input.birthDate !== undefined) {
    payload.birthDate = normalizeBirthDateForInput(input.birthDate);
  }

  return payload;
};

export const normalizePreferences = (
  preferences: Partial<UserPreferences> | null | undefined,
): UserPreferences => ({
  interests: sanitizeStringList(preferences?.interests, MAX_INTERESTS),
  vibe:
    typeof preferences?.vibe === "number" && Number.isFinite(preferences.vibe)
      ? Math.min(100, Math.max(0, Math.round(preferences.vibe)))
      : 50,
  districts: sanitizeStringList(preferences?.districts, MAX_DISTRICTS),
  budget: normalizeBudget(preferences?.budget),
});

export const mapPreferenceUpdatePayload = (
  payload: UpdatePreferencesRequest,
): UpdatePreferencesRequest => {
  const normalized = normalizePreferences(payload);

  const mapped: UpdatePreferencesRequest = {};

  if (payload.interests !== undefined) mapped.interests = normalized.interests;
  if (payload.vibe !== undefined) mapped.vibe = normalized.vibe;
  if (payload.districts !== undefined) mapped.districts = normalized.districts;
  if (payload.budget !== undefined) mapped.budget = normalized.budget;

  return mapped;
};

export const normalizeNotificationSettings = (
  input: Partial<NotificationSettings> | null | undefined,
): NotificationSettings => ({
  push: {
    recommendations:
      input?.push?.recommendations ??
      DEFAULT_NOTIFICATION_SETTINGS.push.recommendations,
    favorites:
      input?.push?.favorites ?? DEFAULT_NOTIFICATION_SETTINGS.push.favorites,
    reviews: input?.push?.reviews ?? DEFAULT_NOTIFICATION_SETTINGS.push.reviews,
    updates: input?.push?.updates ?? DEFAULT_NOTIFICATION_SETTINGS.push.updates,
  },
  email: {
    monthlyDigest:
      input?.email?.monthlyDigest ??
      DEFAULT_NOTIFICATION_SETTINGS.email.monthlyDigest,
    promotions:
      input?.email?.promotions ??
      DEFAULT_NOTIFICATION_SETTINGS.email.promotions,
    tips: input?.email?.tips ?? DEFAULT_NOTIFICATION_SETTINGS.email.tips,
  },
});

export const normalizePrivacySettings = (
  input: Partial<PrivacySettings> | null | undefined,
): PrivacySettings => ({
  showFavorites: input?.showFavorites ?? DEFAULT_PRIVACY_SETTINGS.showFavorites,
  showActivity: input?.showActivity ?? DEFAULT_PRIVACY_SETTINGS.showActivity,
  dataCollection:
    input?.dataCollection ?? DEFAULT_PRIVACY_SETTINGS.dataCollection,
  personalization:
    input?.personalization ?? DEFAULT_PRIVACY_SETTINGS.personalization,
});
