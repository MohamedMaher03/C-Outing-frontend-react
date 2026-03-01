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

// ============ Mock API Data ============

export const MOCK_PROFILE: UserProfile = {
  userId: 1,
  name: "Ahmed Khalil",
  email: "ahmed@couting.app",
  bio: "Food lover | Explorer | Coffee enthusiast",
  avatar: "https://i.pravatar.cc/150?img=3",
};

export const MOCK_PREFERENCES: UserPreferences = {
  interests: ["cafes", "street-food", "rooftops"],
  vibe: 65,
  districts: ["Zamalek", "Downtown", "Maadi"],
  budget: "Medium",
};

export const MOCK_EDIT_PROFILE: EditProfileData = {
  name: "Ahmed Khalil",
  email: "ahmed@couting.app",
  phone: "+20 123 456 7890",
  location: "Cairo, Egypt",
  bio: "Food lover | Explorer | Coffee enthusiast",
  avatar: undefined,
};

export const MOCK_NOTIFICATION_SETTINGS: NotificationSettings = {
  push: {
    recommendations: true,
    favorites: true,
    reviews: false,
    messages: true,
    updates: true,
  },
  email: {
    weekly: true,
    monthly: false,
    promotions: true,
    tips: true,
  },
};

export const MOCK_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisible: true,
  showLocation: true,
  showFavorites: false,
  showActivity: true,
  dataCollection: true,
  personalization: true,
};

// ============ Icon Maps ============

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
