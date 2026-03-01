/**
 * Profile Feature — Public API
 */

// Hooks
export { useProfile } from "./hooks/useProfile";
export { useEditProfile } from "./hooks/useEditProfile";
export { usePrivacy } from "./hooks/usePrivacy";
export { useNotifications } from "./hooks/useNotifications";

// API layer (exposed for advanced usage / testing)
export { profileApi } from "./api/profileApi";

// Services
export {
  getUserProfile,
  updateUserProfile,
  getEditProfile,
  updateEditProfile,
  uploadAvatar,
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

// Types
export type {
  UserProfile,
  UserPreferences,
  UpdatePreferencesRequest,
  EditProfileData,
  NotificationSettings,
  PrivacySettings,
} from "./types";
