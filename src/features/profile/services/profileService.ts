import { profileDataSource } from "./profileDataSource";
import { isApiError } from "@/utils/apiError";
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

const isMissingPreferencesEndpointError = (error: unknown): boolean =>
  isApiError(error) && error.statusCode === 404;

export const getUserProfile = async (): Promise<UserProfile> => {
  const profile = await profileDataSource.getProfile();
  return normalizeProfile(profile, getFallbackName());
};

export const updateUserProfile = async (
  data: UpdateUserProfileRequest,
  avatarFile?: File,
): Promise<UserProfile> => {
  const current = await getUserProfile();
  const normalizedPayload = mapUpdateProfilePayload(data);

  const payload: UpdateUserProfileRequest = {
    name: normalizedPayload.name ?? current.name,
    bio: normalizedPayload.bio ?? current.bio,
    phoneNumber: normalizedPayload.phoneNumber ?? current.phoneNumber,
    birthDate:
      normalizedPayload.birthDate ??
      normalizeBirthDateForInput(current.birthDate),
  };

  const updated = await profileDataSource.updateProfile(payload, avatarFile);

  return normalizeProfile(updated, payload.name);
};

export const uploadAvatar = async (
  file: File,
): Promise<{ avatarUrl: string }> => {
  const updated = await updateUserProfile({}, file);
  return { avatarUrl: updated.avatarUrl ?? "" };
};

export const getEditProfile = async (): Promise<EditProfileData> => {
  return mapProfileToEditProfile(await getUserProfile());
};

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

export const getUserPreferences = async (): Promise<UserPreferences> => {
  const userId = resolveCurrentUserId();
  try {
    const preferences = await profileDataSource.getPreferences(userId);
    return normalizePreferences(preferences);
  } catch (error) {
    // Some environments do not expose preferences endpoints yet.
    // Keep profile page usable with safe defaults instead of hard-failing.
    if (isMissingPreferencesEndpointError(error)) {
      return normalizePreferences(undefined);
    }

    throw error;
  }
};

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

export const getNotificationSettings =
  async (): Promise<NotificationSettings> => {
    const settings = await profileDataSource.getNotifications();
    return normalizeNotificationSettings(settings);
  };

export const updateNotificationSettings = async (
  data: NotificationSettings,
): Promise<NotificationSettings> => {
  const updated = await profileDataSource.updateNotifications(
    normalizeNotificationSettings(data),
  );
  return normalizeNotificationSettings(updated);
};

export const getPrivacySettings = async (): Promise<PrivacySettings> => {
  const settings = await profileDataSource.getPrivacy();
  return normalizePrivacySettings(settings);
};

export const updatePrivacySettings = async (
  data: PrivacySettings,
): Promise<PrivacySettings> => {
  const updated = await profileDataSource.updatePrivacy(
    normalizePrivacySettings(data),
  );
  return normalizePrivacySettings(updated);
};

export const requestDataDownload = async (): Promise<void> => {
  const blob = await profileDataSource.downloadData();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "c-outing-profile-data.json";
  anchor.click();
  URL.revokeObjectURL(url);
};

export const deleteUserAccount = async (): Promise<void> => {
  await profileDataSource.deleteAccount();
};

export const signOut = async (): Promise<void> => {
  await profileDataSource.signOut();
};
