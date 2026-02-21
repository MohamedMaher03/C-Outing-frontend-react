/**
 * Profile Feature — Public API
 */
export { useProfile } from "./hooks/useProfile";
export {
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences,
  signOut,
} from "./services/profileService";
export type {
  UserProfile,
  UserPreferences,
  UpdatePreferencesRequest,
} from "./services/profileService";
