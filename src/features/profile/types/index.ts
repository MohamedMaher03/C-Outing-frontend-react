import type { PriceLevel } from "@/features/admin/types";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
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
  bio?: string;
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

export interface EditProfileData {
  name: string;
  email: string;
  bio: string;
  phoneNumber: string;
  birthDate: string;
  avatarUrl?: string;
}

export interface NotificationSettings {
  push: {
    recommendations: boolean;
    favorites: boolean;
    reviews: boolean;
    updates: boolean;
  };
  email: {
    monthlyDigest: boolean;
    promotions: boolean;
    tips: boolean;
  };
}

export interface PrivacySettings {
  showFavorites: boolean;
  showActivity: boolean;
  dataCollection: boolean;
  personalization: boolean;
}
