/**
 * Profile Feature — Type Definitions
 */

export interface UserProfile {
  userId: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export interface UserPreferences {
  interests: string[];
  vibe: number;
  districts: string[];
  budget: "Low" | "Medium" | "High";
}

export interface UpdatePreferencesRequest {
  interests?: string[];
  vibe?: number;
  districts?: string[];
  budget?: "Low" | "Medium" | "High";
}

/** Data shape used by EditProfilePage */
export interface EditProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar?: string;
}

/** Push + email notification toggles */
export interface NotificationSettings {
  push: {
    recommendations: boolean;
    favorites: boolean;
    reviews: boolean;
    messages: boolean;
    updates: boolean;
  };
  email: {
    weekly: boolean;
    monthly: boolean;
    promotions: boolean;
    tips: boolean;
  };
}

/** Privacy & data-collection toggles */
export interface PrivacySettings {
  profileVisible: boolean;
  showLocation: boolean;
  showFavorites: boolean;
  showActivity: boolean;
  dataCollection: boolean;
  personalization: boolean;
}
