/**
 * Onboarding Feature — Mock Data & UI Constants
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
import { BUDGET_OPTIONS as SHARED_BUDGET_OPTIONS } from "@/utils/priceLevels";

/** Step labels displayed in the progress bar */
export const ONBOARDING_STEPS = ["Interests", "Vibe", "Areas", "Budget"];

/** Budget options for the final onboarding step */
export const BUDGET_OPTIONS = SHARED_BUDGET_OPTIONS;

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
