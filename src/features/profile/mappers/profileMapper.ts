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
import { INTERESTS, POPULAR_DISTRICTS } from "@/mocks/mockData";
import {
  FAVORITE_ACTIVITIES,
  COMPANION_TYPES,
} from "@/features/onboarding/mocks";
import type { PriceLevel } from "@/features/place-detail";

const DEFAULT_NAME = "Guest User";
const MAX_NAME_LENGTH = 100;
const MAX_BIO_LENGTH = 500;
const MAX_PHONE_LENGTH = 30;
const MAX_LIST_ITEM_LENGTH = 80;
const MAX_INTERESTS = 20;
const MAX_DISTRICTS = 20;
const MAX_ACTIVITIES = 12;
const MAX_COMPANIONS = 6;

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

  return "midrange";
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

const storedBudgetToPreferenceLevel: Record<string, PriceLevel> = {
  Economy: "cheapest",
  Value: "cheap",
  Standard: "midrange",
  Premium: "expensive",
  Luxury: "luxury",
};

const preferenceLevelToStoredBudget: Record<PriceLevel, string> = {
  cheapest: "Economy",
  cheap: "Value",
  midrange: "Standard",
  expensive: "Premium",
  luxury: "Luxury",
};

export interface StoredOutingPreferences {
  loveInterests: string[];
  vibeLevel: number;
  preferredDistricts: string[];
  preferredBudget: string;
  favoriteActivities: string[];
  companionType: string[];
}

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
  favoriteActivities: sanitizeStringList(
    preferences?.favoriteActivities,
    MAX_ACTIVITIES,
  ),
  companionTypes: sanitizeStringList(
    preferences?.companionTypes,
    MAX_COMPANIONS,
  ),
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
  if (payload.favoriteActivities !== undefined)
    mapped.favoriteActivities = normalized.favoriteActivities;
  if (payload.companionTypes !== undefined)
    mapped.companionTypes = normalized.companionTypes;

  return mapped;
};

// Stored labels to app selection ids.
const storedInterestLabelToId = new Map<string, string>();
INTERESTS.forEach((item) =>
  storedInterestLabelToId.set(item.label.toLowerCase(), item.id),
);

const storedActivityLabelToId = new Map<string, string>();
FAVORITE_ACTIVITIES.forEach((item) =>
  storedActivityLabelToId.set(item.label.toLowerCase(), item.id),
);

const storedCompanionLabelToId = new Map<string, string>();
COMPANION_TYPES.forEach((item) =>
  storedCompanionLabelToId.set(item.label.toLowerCase(), item.id),
);

const storedDistrictLabelToName = new Map<string, string>();
POPULAR_DISTRICTS.forEach((item) => {
  storedDistrictLabelToName.set(item.name.toLowerCase(), item.name);
  if (item.name === "Downtown") {
    storedDistrictLabelToName.set("downtown cairo", "Downtown");
  }
});

// App selection ids to stored labels.
const preferenceInterestIdToLabel = new Map<string, string>();
INTERESTS.forEach((item) =>
  preferenceInterestIdToLabel.set(item.id, item.label),
);

const preferenceActivityIdToLabel = new Map<string, string>();
FAVORITE_ACTIVITIES.forEach((item) =>
  preferenceActivityIdToLabel.set(item.id, item.label),
);

const preferenceCompanionIdToLabel = new Map<string, string>();
COMPANION_TYPES.forEach((item) =>
  preferenceCompanionIdToLabel.set(item.id, item.label),
);

const preferenceDistrictNameToLabel = new Map<string, string>();
POPULAR_DISTRICTS.forEach((item) => {
  preferenceDistrictNameToLabel.set(item.name, item.name);
  if (item.name === "Downtown") {
    preferenceDistrictNameToLabel.set("Downtown", "Downtown Cairo");
  }
});

export const mapStoredOutingPreferencesToUserPreferences = (
  storedPreferences: Partial<StoredOutingPreferences> | null | undefined,
): UserPreferences => {
  const loveInterests = (storedPreferences?.loveInterests || []).map((val) => {
    const clean = val.trim();
    return storedInterestLabelToId.get(clean.toLowerCase()) || clean;
  });

  const vibeLevel =
    storedPreferences?.vibeLevel != null ? storedPreferences.vibeLevel : 50;

  const preferredDistricts = (storedPreferences?.preferredDistricts || []).map(
    (val) => {
      const clean = val.trim();
      return storedDistrictLabelToName.get(clean.toLowerCase()) || clean;
    },
  );

  const preferredBudget = storedPreferences?.preferredBudget || "Standard";

  const favoriteActivities = (storedPreferences?.favoriteActivities || []).map(
    (val) => {
      const clean = val.trim();
      return storedActivityLabelToId.get(clean.toLowerCase()) || clean;
    },
  );

  const companionType = (storedPreferences?.companionType || []).map((val) => {
    const clean = val.trim();
    return storedCompanionLabelToId.get(clean.toLowerCase()) || clean;
  });

  const budgetVal = PRICE_LEVEL_SET.has(preferredBudget)
    ? (preferredBudget as PriceLevel)
    : storedBudgetToPreferenceLevel[preferredBudget] || "midrange";

  return normalizePreferences({
    interests: loveInterests,
    vibe: vibeLevel,
    districts: preferredDistricts,
    budget: budgetVal,
    favoriteActivities: favoriteActivities,
    companionTypes: companionType,
  });
};

export const mapUserPreferencesToStoredOutingPreferences = (
  payload: UpdatePreferencesRequest,
): Partial<StoredOutingPreferences> => {
  const mapped: Partial<StoredOutingPreferences> = {};

  if (payload.interests !== undefined) {
    mapped.loveInterests = payload.interests.map(
      (id) => preferenceInterestIdToLabel.get(id) || id,
    );
  }
  if (payload.vibe !== undefined) {
    mapped.vibeLevel = payload.vibe;
  }
  if (payload.districts !== undefined) {
    mapped.preferredDistricts = payload.districts.map(
      (name) => preferenceDistrictNameToLabel.get(name) || name,
    );
  }
  if (payload.budget !== undefined) {
    mapped.preferredBudget =
      preferenceLevelToStoredBudget[payload.budget] || "Standard";
  }
  if (payload.favoriteActivities !== undefined) {
    mapped.favoriteActivities = payload.favoriteActivities.map(
      (id) => preferenceActivityIdToLabel.get(id) || id,
    );
  }
  if (payload.companionTypes !== undefined) {
    mapped.companionType = payload.companionTypes.map(
      (id) => preferenceCompanionIdToLabel.get(id) || id,
    );
  }

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
