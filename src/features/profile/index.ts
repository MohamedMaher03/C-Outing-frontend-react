export { useProfile } from "./hooks/useProfile";
export { useProfilePage } from "./hooks/useProfilePage";
export { useEditProfile } from "./hooks/useEditProfile";
export { useEditProfilePage } from "./hooks/useEditProfilePage";
export { usePrivacy } from "./hooks/usePrivacy";
export { usePrivacyPage } from "./hooks/usePrivacyPage";
export { useNotifications } from "./hooks/useNotifications";
export { useNotificationsPage } from "./hooks/useNotificationsPage";
export { useHelpSupportPage } from "./hooks/useHelpSupportPage";

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
