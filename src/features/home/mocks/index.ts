/**
 * Home Feature — Mock Data & UI Constants
 * All hardcoded arrays and static configuration used by the home page.
 */

import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  TrendingUp,
  Navigation,
  Clock,
  UtensilsCrossed,
  Moon,
  Palette,
  Trees,
  ShoppingBag,
  Heart,
  Compass,
  Laptop,
  Coffee,
  Mountain,
  Users,
  Binoculars,
} from "lucide-react";
import type { FilterType } from "../types";

// ============ Filter Pills ============

export interface FilterOption {
  id: FilterType;
  label: string;
  icon: LucideIcon;
}

export const FILTER_OPTIONS: FilterOption[] = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "top-rated", label: "Top Rated", icon: TrendingUp },
  { id: "near-me", label: "Near Me", icon: Navigation },
  { id: "open-now", label: "Open Now", icon: Clock },
];

// ============ Icon Maps ============

/** Maps category icon names (from backend) to Lucide icon components */
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Moon,
  Palette,
  Trees,
  ShoppingBag,
  Heart,
  Compass,
  Laptop,
};

/** Maps mood icon names (from backend) to Lucide icon components */
export const MOOD_ICON_MAP: Record<string, LucideIcon> = {
  Coffee,
  Mountain,
  Heart,
  Users,
  Binoculars,
  UtensilsCrossed,
};
