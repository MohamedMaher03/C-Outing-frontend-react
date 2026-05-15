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

export const ONBOARDING_STEPS = [
  "Interests",
  "Vibe",
  "Areas",
  "Budget",
  "Activities",
  "Companions",
];

export const BUDGET_OPTIONS = SHARED_BUDGET_OPTIONS;

export const FAVORITE_ACTIVITIES = [
  { id: "cafe", label: "Cafe" },
  { id: "restaurant", label: "Restaurant" },
  { id: "workspace-office", label: "Workspace / Office" },
  { id: "cinema-theater", label: "Cinema / Theater" },
  { id: "entertainment-gaming", label: "Entertainment / Gaming" },
  { id: "bar-nightlife", label: "Bar / Nightlife" },
  { id: "community-public-spaces", label: "Community & Public Spaces" },
  { id: "retail-shopping", label: "Retail / Shopping" },
  { id: "dessert-bakery", label: "Dessert / Bakery" },
  { id: "arts-culture", label: "Arts & Culture" },
  { id: "outdoors-recreation", label: "Outdoors / Recreation" },
];

export const COMPANION_TYPES = [
  { id: "couple", label: "Couple" },
  { id: "small-group", label: "Small Group (3-4)" },
  { id: "medium-group", label: "Medium Group (5-8)" },
  { id: "large-group", label: "Large Group (9+)" },
  { id: "solo", label: "Solo" },
];

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
