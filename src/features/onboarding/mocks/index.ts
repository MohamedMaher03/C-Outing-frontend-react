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

export const ONBOARDING_STEPS = ["Interests", "Vibe", "Areas", "Budget"];

export const BUDGET_OPTIONS = SHARED_BUDGET_OPTIONS;

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
