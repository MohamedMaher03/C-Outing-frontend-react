/**
 * Profile Feature — Public API
 */
export { useProfile } from "./hooks/useProfile";
export { useEditProfile } from "./hooks/useEditProfile";
export { usePrivacy } from "./hooks/usePrivacy";
export { useNotifications } from "./hooks/useNotifications";
export {
  getUserProfile,
  updateUserProfile,
  getEditProfile,
  updateEditProfile,
  getUserPreferences,
  updateUserPreferences,
  getNotificationSettings,
  updateNotificationSettings,
  getPrivacySettings,
  updatePrivacySettings,
  requestDataDownload,
  deleteUserAccount,
  signOut,
} from "./services/profileService";
export type {
  UserProfile,
  UserPreferences,
  UpdatePreferencesRequest,
  EditProfileData,
  NotificationSettings,
  PrivacySettings,
} from "./types";
