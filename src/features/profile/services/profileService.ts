/**
 * Profile Service
 *
 * Business logic layer — composes API calls and applies feature-level mapping.
 * Profile read/update is wired to backend API.
 * Preferences/notifications/privacy remain mock-backed until their API contracts are finalized.
 */

import { profileApi } from "../api/profileApi";

import type {
  UserProfile,
  UpdateUserProfileRequest,
  UserPreferences,
  UpdatePreferencesRequest,
  EditProfileData,
  NotificationSettings,
  PrivacySettings,
} from "@/features/profile/types";
import {
  MOCK_PREFERENCES as INITIAL_PREFERENCES,
  MOCK_NOTIFICATION_SETTINGS,
  MOCK_PRIVACY_SETTINGS,
} from "@/features/profile/mocks";

// Re-export types for consumers that import from the service directly
export type {
  UserProfile,
  UpdateUserProfileRequest,
  UserPreferences,
  UpdatePreferencesRequest,
  EditProfileData,
  NotificationSettings,
  PrivacySettings,
};

// ── Mutable mock stores (simulate server state during development) ──────────
let MOCK_PREFERENCES: UserPreferences = { ...INITIAL_PREFERENCES };
let MOCK_NOTIFICATIONS: NotificationSettings = {
  push: { ...MOCK_NOTIFICATION_SETTINGS.push },
  email: { ...MOCK_NOTIFICATION_SETTINGS.email },
};
let MOCK_PRIVACY: PrivacySettings = { ...MOCK_PRIVACY_SETTINGS };

const CURRENT_USER_ID = "1";

const getTodayDateString = (): string => new Date().toISOString().slice(0, 10);

const normalizeBirthDateForInput = (birthDate?: string): string => {
  if (!birthDate) return getTodayDateString();

  const datePart = birthDate.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return getTodayDateString();

  const [year] = datePart.split("-");
  if (!year || Number(year) <= 1) return getTodayDateString();

  return datePart;
};

const buildFallbackProfile = (): UserProfile => ({
  id: "",
  name: getFallbackName(),
  email: "",
  phoneNumber: "",
  birthDate: getTodayDateString(),
  age: 0,
  role: 0,
  totalInteractions: 0,
  isBanned: false,
  isEmailVerified: false,
  avatarUrl: undefined,
  createdAt: "",
  updatedAt: "",
});

const normalizeProfile = (
  profile: Partial<UserProfile> | null | undefined,
  fallback?: UserProfile,
): UserProfile => {
  const base = fallback ?? buildFallbackProfile();

  const normalizedName =
    typeof profile?.name === "string" && profile.name.trim().length > 0
      ? profile.name.trim()
      : base.name;

  return {
    ...base,
    ...profile,
    name: normalizedName,
    email: profile?.email ?? base.email,
    phoneNumber: profile?.phoneNumber ?? base.phoneNumber,
    birthDate: profile?.birthDate ?? base.birthDate,
    age: profile?.age ?? base.age,
    role: profile?.role ?? base.role,
    totalInteractions: profile?.totalInteractions ?? base.totalInteractions,
    isBanned: profile?.isBanned ?? base.isBanned,
    isEmailVerified: profile?.isEmailVerified ?? base.isEmailVerified,
    avatarUrl: profile?.avatarUrl ?? base.avatarUrl,
    createdAt: profile?.createdAt ?? base.createdAt,
    updatedAt: profile?.updatedAt ?? base.updatedAt,
  };
};

const getFallbackName = (): string => {
  try {
    const raw = localStorage.getItem("authUser");
    if (!raw) return "Guest User";

    const parsed = JSON.parse(raw) as { name?: string };
    const name = parsed?.name?.trim();
    return name && name.length >= 2 ? name : "Guest User";
  } catch {
    return "Guest User";
  }
};

// ── Profile ─────────────────────────────────────────────────────────────────

export const getUserProfile = async (): Promise<UserProfile> => {
  const profile = (await profileApi.getProfile()) as UserProfile | null;

  return normalizeProfile(profile);
};

/**
 * Update user profile via authenticated /api/v1/User/profile endpoint.
 */
export const updateUserProfile = async (
  data: UpdateUserProfileRequest,
  avatarFile?: File,
): Promise<UserProfile> => {
  const current = await getUserProfile();

  const resolvedName =
    data.name?.trim() || current.name?.trim() || "Guest User";
  const resolvedPhoneNumber =
    data.phoneNumber?.trim() || current.phoneNumber || "";
  const resolvedBirthDate =
    data.birthDate || normalizeBirthDateForInput(current.birthDate);

  const updated = (await profileApi.updateProfile(
    {
      name: resolvedName,
      phoneNumber: resolvedPhoneNumber,
      birthDate: resolvedBirthDate,
    },
    avatarFile,
  )) as UserProfile | null;

  return normalizeProfile(updated, {
    ...current,
    name: resolvedName,
    phoneNumber: resolvedPhoneNumber,
    birthDate: resolvedBirthDate,
  });
};

/**
 * Backward-compatible avatar upload helper.
 * Kept to avoid stale HMR imports while profile update is now unified.
 */
export const uploadAvatar = async (
  file: File,
): Promise<{ avatarUrl: string }> => {
  const updated = await updateUserProfile({}, file);
  return { avatarUrl: updated.avatarUrl ?? "" };
};

// ── Edit Profile (extended fields) ──────────────────────────────────────────

/** Fetch edit profile form model mapped from backend profile payload. */
export const getEditProfile = async (): Promise<EditProfileData> => {
  const profile = await getUserProfile();
  return {
    name: profile.name,
    email: profile.email,
    phoneNumber: profile.phoneNumber ?? "",
    birthDate: normalizeBirthDateForInput(profile.birthDate),
    avatarUrl: profile.avatarUrl,
  };
};

/** Save edit profile form model to backend profile endpoint. */
export const updateEditProfile = async (
  data: Partial<EditProfileData>,
  avatarFile?: File,
): Promise<EditProfileData> => {
  const payload: UpdateUserProfileRequest = {
    name: data.name?.trim(),
    phoneNumber: data.phoneNumber?.trim(),
    birthDate: data.birthDate,
  };

  const updated = await updateUserProfile(payload, avatarFile);

  return {
    name: updated.name,
    email: updated.email,
    phoneNumber: updated.phoneNumber ?? "",
    birthDate: normalizeBirthDateForInput(updated.birthDate),
    avatarUrl: updated.avatarUrl,
  };
};

// ── Preferences ──────────────────────────────────────────────────────────────

/**
 * Fetch user preferences (interests, vibe, districts, budget).
 * TODO: Uncomment when backend is ready:
 *   return profileApi.getPreferences(CURRENT_USER_ID);
 */
export const getUserPreferences = async (): Promise<UserPreferences> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ...MOCK_PREFERENCES };

  // return profileApi.getPreferences(CURRENT_USER_ID);
};

/**
 * Update user preferences.
 * TODO: Uncomment when backend is ready:
 *   return profileApi.updatePreferences(CURRENT_USER_ID, data);
 */
export const updateUserPreferences = async (
  data: UpdatePreferencesRequest,
): Promise<UserPreferences> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  MOCK_PREFERENCES = { ...MOCK_PREFERENCES, ...data };
  return { ...MOCK_PREFERENCES };

  // return profileApi.updatePreferences(CURRENT_USER_ID, data);
};

// ── Notifications ────────────────────────────────────────────────────────────

/**
 * Fetch notification settings.
 * TODO: Uncomment when backend is ready:
 *   return profileApi.getNotifications(CURRENT_USER_ID);
 */
export const getNotificationSettings =
  async (): Promise<NotificationSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      push: { ...MOCK_NOTIFICATIONS.push },
      email: { ...MOCK_NOTIFICATIONS.email },
    };

    // return profileApi.getNotifications(CURRENT_USER_ID);
  };

/**
 * Save notification settings.
 * TODO: Uncomment when backend is ready:
 *   return profileApi.updateNotifications(CURRENT_USER_ID, data);
 */
export const updateNotificationSettings = async (
  data: NotificationSettings,
): Promise<NotificationSettings> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  MOCK_NOTIFICATIONS = {
    push: { ...data.push },
    email: { ...data.email },
  };
  return { ...MOCK_NOTIFICATIONS };

  // return profileApi.updateNotifications(CURRENT_USER_ID, data);
};

// ── Privacy ──────────────────────────────────────────────────────────────────

/**
 * Fetch privacy settings.
 * TODO: Uncomment when backend is ready:
 *   return profileApi.getPrivacy(CURRENT_USER_ID);
 */
export const getPrivacySettings = async (): Promise<PrivacySettings> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { ...MOCK_PRIVACY };

  // return profileApi.getPrivacy(CURRENT_USER_ID);
};

/**
 * Save privacy settings.
 * TODO: Uncomment when backend is ready:
 *   return profileApi.updatePrivacy(CURRENT_USER_ID, data);
 */
export const updatePrivacySettings = async (
  data: PrivacySettings,
): Promise<PrivacySettings> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  MOCK_PRIVACY = { ...data };
  return { ...MOCK_PRIVACY };

  // return profileApi.updatePrivacy(CURRENT_USER_ID, data);
};

// ── Account Management ───────────────────────────────────────────────────────

/**
 * Request data export (returns a downloadable Blob).
 * TODO: Uncomment when backend is ready:
 *   const blob = await profileApi.downloadData(CURRENT_USER_ID);
 *   const url = URL.createObjectURL(blob);
 *   const a = document.createElement("a");
 *   a.href = url; a.download = "my-data.json"; a.click();
 *   URL.revokeObjectURL(url);
 */
export const requestDataDownload = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("[Mock] Data download requested for user", CURRENT_USER_ID);

  // const blob = await profileApi.downloadData(CURRENT_USER_ID);
  // const url = URL.createObjectURL(blob);
  // const a = document.createElement("a");
  // a.href = url; a.download = "my-data.json"; a.click();
  // URL.revokeObjectURL(url);
};

/**
 * Permanently delete the user account.
 * TODO: Uncomment when backend is ready:
 *   await profileApi.deleteAccount(CURRENT_USER_ID);
 */
export const deleteUserAccount = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("[Mock] Account deletion requested for user", CURRENT_USER_ID);

  // await profileApi.deleteAccount(CURRENT_USER_ID);
};

/**
 * Sign out user (clear local session).
 * TODO: Uncomment when backend is ready:
 *   await axiosInstance.post(API_ENDPOINTS.auth.logout);
 */
export const signOut = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // await axiosInstance.post(API_ENDPOINTS.auth.logout);
};
