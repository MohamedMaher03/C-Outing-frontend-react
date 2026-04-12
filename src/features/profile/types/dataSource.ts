import type {
  NotificationSettings,
  PrivacySettings,
  UpdatePreferencesRequest,
  UpdateUserProfileRequest,
  UserPreferences,
  UserProfile,
} from "./index";

export interface ProfileDataSource {
  getProfile: () => Promise<UserProfile>;
  updateProfile: (
    payload: UpdateUserProfileRequest,
    avatarFile?: File,
  ) => Promise<UserProfile>;

  getPreferences: (userId: string) => Promise<UserPreferences>;
  updatePreferences: (
    userId: string,
    payload: UpdatePreferencesRequest,
  ) => Promise<UserPreferences>;

  getNotifications: () => Promise<NotificationSettings>;
  updateNotifications: (
    payload: NotificationSettings,
  ) => Promise<NotificationSettings>;

  getPrivacy: () => Promise<PrivacySettings>;
  updatePrivacy: (payload: PrivacySettings) => Promise<PrivacySettings>;

  downloadData: () => Promise<Blob>;
  deleteAccount: () => Promise<void>;
  signOut: () => Promise<void>;
}
