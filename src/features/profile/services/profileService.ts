/**
 * Profile Service
 *
 * Business logic layer — composes datasource calls and applies
 * feature-level validation/normalization in a clean architecture flow:
 *
 * UI/Hook -> Service -> Mapper -> DataSource -> API/Mock
 */

import { profileDataSource } from "./profileDataSource";
import {
  mapEditProfileToUpdatePayload,
  mapPreferenceUpdatePayload,
  mapProfileToEditProfile,
  mapUpdateProfilePayload,
  normalizeBirthDateForInput,
  normalizeNotificationSettings,
  normalizePreferences,
  normalizePrivacySettings,
  normalizeProfile,
} from "../mappers/profileMapper";

import type {
  EditProfileData,
  NotificationSettings,
  PrivacySettings,
  UpdatePreferencesRequest,
  UserProfile,
  UpdateUserProfileRequest,
  UserPreferences,
} from "@/features/profile/types";

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

const FALLBACK_USER_ID = "1";

interface StoredAuthUser {
  userId?: unknown;
  name?: unknown;
}

const getStoredAuthUser = (): StoredAuthUser | null => {
  try {
    const raw = localStorage.getItem("authUser");
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredAuthUser;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const resolveCurrentUserId = (): string => {
  const userId = getStoredAuthUser()?.userId;

  if (typeof userId === "string" && userId.trim().length > 0) {
    return userId.trim();
  }

  return FALLBACK_USER_ID;
};

const getFallbackName = (): string => {
  const rawName = getStoredAuthUser()?.name;
  return typeof rawName === "string" && rawName.trim().length > 1
    ? rawName.trim()
    : "Guest User";
};

// ── Profile ─────────────────────────────────────────────────────────────────

export const getUserProfile = async (): Promise<UserProfile> => {
  const profile = await profileDataSource.getProfile();
  return normalizeProfile(profile, getFallbackName());
};

/**
 * Update user profile via authenticated /api/v1/User/profile endpoint.
 */
export const updateUserProfile = async (
  data: UpdateUserProfileRequest,
  avatarFile?: File,
): Promise<UserProfile> => {
  const current = await getUserProfile();
  const normalizedPayload = mapUpdateProfilePayload(data);

  const payload: UpdateUserProfileRequest = {
    name: normalizedPayload.name ?? current.name,
    phoneNumber: normalizedPayload.phoneNumber ?? current.phoneNumber,
    birthDate:
      normalizedPayload.birthDate ??
      normalizeBirthDateForInput(current.birthDate),
  };

  const updated = await profileDataSource.updateProfile(payload, avatarFile);

  return normalizeProfile(updated, payload.name);
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
  return mapProfileToEditProfile(await getUserProfile());
};

/** Save edit profile form model to backend profile endpoint. */
export const updateEditProfile = async (
  data: Partial<EditProfileData>,
  avatarFile?: File,
): Promise<EditProfileData> => {
  const updated = await updateUserProfile(
    mapEditProfileToUpdatePayload(data),
    avatarFile,
  );

  return mapProfileToEditProfile(updated);
};

// ── Preferences ──────────────────────────────────────────────────────────────

/**
 * Fetch user preferences (interests, vibe, districts, budget).
 * TODO: Uncomment when backend is ready:
 *   return profileApi.getPreferences(CURRENT_USER_ID);
 */
export const getUserPreferences = async (): Promise<UserPreferences> => {
  const userId = resolveCurrentUserId();
  const preferences = await profileDataSource.getPreferences(userId);
  return normalizePreferences(preferences);
};

/**
 * Update user preferences.
 * TODO: Uncomment when backend is ready:
 *   return profileApi.updatePreferences(CURRENT_USER_ID, data);
 */
export const updateUserPreferences = async (
  data: UpdatePreferencesRequest,
): Promise<UserPreferences> => {
  const userId = resolveCurrentUserId();
  const payload = mapPreferenceUpdatePayload(data);

  if (Object.keys(payload).length === 0) {
    return getUserPreferences();
  }

  const updated = await profileDataSource.updatePreferences(userId, payload);
  return normalizePreferences(updated);
};

// ── Notifications ────────────────────────────────────────────────────────────

/**
 * Fetch notification settings.
 * TODO: Uncomment when backend is ready:
 *   return profileApi.getNotifications(CURRENT_USER_ID);
 */
export const getNotificationSettings =
  async (): Promise<NotificationSettings> => {
    const settings = await profileDataSource.getNotifications();
    return normalizeNotificationSettings(settings);
  };

/**
 * Save notification settings.
 * TODO: Uncomment when backend is ready:
 *   return profileApi.updateNotifications(CURRENT_USER_ID, data);
 */
export const updateNotificationSettings = async (
  data: NotificationSettings,
): Promise<NotificationSettings> => {
  const updated = await profileDataSource.updateNotifications(
    normalizeNotificationSettings(data),
  );
  return normalizeNotificationSettings(updated);
};

// ── Privacy ──────────────────────────────────────────────────────────────────

/**
 * Fetch privacy settings.
 * TODO: Uncomment when backend is ready:
 *   return profileApi.getPrivacy(CURRENT_USER_ID);
 */
export const getPrivacySettings = async (): Promise<PrivacySettings> => {
  const settings = await profileDataSource.getPrivacy();
  return normalizePrivacySettings(settings);
};

/**
 * Save privacy settings.
 * TODO: Uncomment when backend is ready:
 *   return profileApi.updatePrivacy(CURRENT_USER_ID, data);
 */
export const updatePrivacySettings = async (
  data: PrivacySettings,
): Promise<PrivacySettings> => {
  const updated = await profileDataSource.updatePrivacy(
    normalizePrivacySettings(data),
  );
  return normalizePrivacySettings(updated);
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
  const blob = await profileDataSource.downloadData();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "c-outing-profile-data.json";
  anchor.click();
  URL.revokeObjectURL(url);
};

/**
 * Permanently delete the user account.
 * TODO: Uncomment when backend is ready:
 *   await profileApi.deleteAccount(CURRENT_USER_ID);
 */
export const deleteUserAccount = async (): Promise<void> => {
  await profileDataSource.deleteAccount();
};

/**
 * Sign out user (clear local session).
 * TODO: Uncomment when backend is ready:
 *   await axiosInstance.post(API_ENDPOINTS.auth.logout);
 */
export const signOut = async (): Promise<void> => {
  await profileDataSource.signOut();
};
