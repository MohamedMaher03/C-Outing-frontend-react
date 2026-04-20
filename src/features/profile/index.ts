export { useProfile } from "./hooks/useProfile";
export { useEditProfile } from "./hooks/useEditProfile";
export { usePrivacy } from "./hooks/usePrivacy";
export { useNotifications } from "./hooks/useNotifications";

export { profileApi } from "./api/profileApi";

export {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
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
export { profileDataSource } from "./services/profileDataSource";

export type {
  UserProfile,
  UserPreferences,
  UpdatePreferencesRequest,
  EditProfileData,
  NotificationSettings,
  PrivacySettings,
} from "./types";
export type { ProfileDataSource } from "./types/dataSource";
