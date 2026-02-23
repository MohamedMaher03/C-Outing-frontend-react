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
import type { UserProfile, UserPreferences } from "../types";

// ============ Mock API Data ============

export const MOCK_PROFILE: UserProfile = {
  userId: 1,
  name: "Ahmed Khalil",
  email: "ahmed@couting.app",
};

export const MOCK_PREFERENCES: UserPreferences = {
  interests: ["cafes", "street-food", "rooftops"],
  vibe: 65,
  districts: ["Zamalek", "Downtown", "Maadi"],
  budget: "Medium",
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
