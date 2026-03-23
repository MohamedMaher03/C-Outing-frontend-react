/**
 * Profile Feature — Type Definitions
 */

import type { PriceLevel } from "@/features/admin/types";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  age: number;
  role: number;
  totalInteractions: number;
  isBanned: boolean;
  isEmailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  phoneNumber?: string;
  birthDate?: string;
}

export interface UserPreferences {
  interests: string[];
  vibe: number;
  districts: string[];
  budget: PriceLevel;
}

export interface UpdatePreferencesRequest {
  interests?: string[];
  vibe?: number;
  districts?: string[];
  budget?: PriceLevel;
}

/** Data shape used by EditProfilePage */
export interface EditProfileData {
  name: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  avatarUrl?: string;
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
