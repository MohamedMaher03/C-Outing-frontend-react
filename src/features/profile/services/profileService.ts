/**
 * Profile Service
 *
 * Business logic layer — composes API calls and applies domain rules.
 * Currently backed by mock data so the UI works without a live backend.
 *
 * ⚠️  HOW TO SWITCH TO THE REAL API:
 *   1. Uncomment the `profileApi` import below.
 *   2. In each exported function, comment out the mock block and
 *      uncomment the `profileApi.*` call directly below it.
 *   Every function is already wired with the correct endpoint via
 *   src/features/profile/api/profileApi.ts.
 */

// import { profileApi } from "../api/profileApi"; // TODO: Uncomment when backend is ready

import type {
  UserProfile,
  UserPreferences,
  UpdatePreferencesRequest,
  EditProfileData,
  NotificationSettings,
  PrivacySettings,
} from "@/features/profile/types";
import {
  MOCK_PROFILE,
  MOCK_PREFERENCES as INITIAL_PREFERENCES,
  MOCK_EDIT_PROFILE,
  MOCK_NOTIFICATION_SETTINGS,
  MOCK_PRIVACY_SETTINGS,
} from "@/features/profile/mocks";

// Re-export types for consumers that import from the service directly
export type {
  UserProfile,
  UserPreferences,
  UpdatePreferencesRequest,
  EditProfileData,
  NotificationSettings,
  PrivacySettings,
};

// ── Mutable mock stores (simulate server state during development) ──────────
let MOCK_PREFERENCES: UserPreferences = { ...INITIAL_PREFERENCES };
let MOCK_EDIT_PROFILE_DATA: EditProfileData = { ...MOCK_EDIT_PROFILE };
let MOCK_NOTIFICATIONS: NotificationSettings = {
  push: { ...MOCK_NOTIFICATION_SETTINGS.push },
  email: { ...MOCK_NOTIFICATION_SETTINGS.email },
};
let MOCK_PRIVACY: PrivacySettings = { ...MOCK_PRIVACY_SETTINGS };

// Placeholder: replace with real user id from auth context when backend is live
const CURRENT_USER_ID = 1;

// ── Profile ─────────────────────────────────────────────────────────────────

/**
 * Fetch user profile.
 * TODO: Uncomment when backend is ready:
 *   return profileApi.getProfile(CURRENT_USER_ID);
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ...MOCK_PROFILE };

  // return profileApi.getProfile(CURRENT_USER_ID);
};

/**
 * Update user profile (used by the main profile preferences page).
 * TODO: Uncomment when backend is ready:
 *   return profileApi.updateProfile(CURRENT_USER_ID, data);
 */
export const updateUserProfile = async (
  data: Partial<UserProfile>,
): Promise<UserProfile> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ...MOCK_PROFILE, ...data };

  // return profileApi.updateProfile(CURRENT_USER_ID, data);
};

// ── Edit Profile (extended fields) ──────────────────────────────────────────

/** * Upload a new avatar image.
 * Returns the URL for the uploaded avatar.
 *
 * Mock: Creates a local blob URL to simulate the upload.
 * TODO: Uncomment when backend is ready:
 *   return profileApi.uploadAvatar(CURRENT_USER_ID, file);
 */
export const uploadAvatar = async (
  file: File,
): Promise<{ avatarUrl: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Mock: create a local object URL to simulate a server-returned URL
  const avatarUrl = URL.createObjectURL(file);
  MOCK_EDIT_PROFILE_DATA = { ...MOCK_EDIT_PROFILE_DATA, avatar: avatarUrl };
  return { avatarUrl };

  // return profileApi.uploadAvatar(CURRENT_USER_ID, file);
};

/** * Fetch extended profile data (name, email, phone, location, bio).
 * TODO: Uncomment when backend is ready:
 *   return profileApi.getProfile(CURRENT_USER_ID) as unknown as EditProfileData;
 */
export const getEditProfile = async (): Promise<EditProfileData> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ...MOCK_EDIT_PROFILE_DATA };

  // return profileApi.getProfile(CURRENT_USER_ID) as unknown as EditProfileData;
};

/**
 * Save extended profile edits.
 * TODO: Uncomment when backend is ready:
 *   return profileApi.updateProfile(CURRENT_USER_ID, data) as unknown as EditProfileData;
 */
export const updateEditProfile = async (
  data: Partial<EditProfileData>,
): Promise<EditProfileData> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  MOCK_EDIT_PROFILE_DATA = { ...MOCK_EDIT_PROFILE_DATA, ...data };
  return { ...MOCK_EDIT_PROFILE_DATA };

  // return profileApi.updateProfile(CURRENT_USER_ID, data) as unknown as EditProfileData;
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
