/**
 * Profile Feature — Mock Data & UI Constants
 */

import type { LucideIcon } from "lucide-react";
import {
  Ship,
  Utensils,
  Palette,
  Laptop,
  Moon,
  Landmark,
  Coffee,
  ShoppingBag,
  Trees,
  Dumbbell,
  Music,
  Building2,
} from "lucide-react";
import type {
  UserProfile,
  UserPreferences,
  EditProfileData,
  NotificationSettings,
  PrivacySettings,
} from "../types";

export const MOCK_PROFILE: UserProfile = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Ahmed Khalil",
  email: "ahmed@couting.app",
  bio: "Cairo explorer sharing favorite hangouts and hidden gems.",
  phoneNumber: "+20 123 456 7890",
  birthDate: "1998-07-12T00:00:00.000Z",
  age: 27,
  role: 0,
  totalInteractions: 42,
  isBanned: false,
  isEmailVerified: true,
  avatarUrl: "https://i.pravatar.cc/150?img=3",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-03-20T10:00:00.000Z",
};

export const MOCK_PREFERENCES: UserPreferences = {
  interests: ["cafes", "street-food", "rooftops"],
  vibe: 65,
  districts: ["Zamalek", "Downtown", "Maadi"],
  budget: "mid_range",
};

export const MOCK_EDIT_PROFILE: EditProfileData = {
  name: "Ahmed Khalil",
  email: "ahmed@couting.app",
  bio: "Cairo explorer sharing favorite hangouts and hidden gems.",
  phoneNumber: "+20 123 456 7890",
  birthDate: "1998-07-12",
  avatarUrl: undefined,
};

export const MOCK_NOTIFICATION_SETTINGS: NotificationSettings = {
  push: {
    recommendations: true,
    favorites: true,
    reviews: false,
    updates: true,
  },
  email: {
    monthlyDigest: true,
    promotions: true,
    tips: true,
  },
};

export const MOCK_PRIVACY_SETTINGS: PrivacySettings = {
  showFavorites: false,
  showActivity: true,
  dataCollection: true,
  personalization: true,
};

/** Maps interest icon names to Lucide icon components */
export const INTEREST_ICON_MAP: Record<string, LucideIcon> = {
  Ship,
  Utensils,
  Palette,
  Laptop,
  Moon,
  Landmark,
  Coffee,
  ShoppingBag,
  Trees,
  Dumbbell,
  Music,
  Building2,
};
