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
  MapPin,
  Tags,
  BadgeDollarSign,
  AreaChart,
} from "lucide-react";
import type { DiscoverySource, FilterType, VenuePriceRange } from "../types";

// Re-export mock API for convenient access
export { homeMock } from "./homeMock";

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

export interface DiscoverySourceOption {
  id: DiscoverySource;
  label: string;
  icon: LucideIcon;
}

export const DISCOVERY_SOURCE_OPTIONS: DiscoverySourceOption[] = [
  { id: "district", label: "District", icon: MapPin },
  { id: "type", label: "Venue Type", icon: Tags },
  { id: "price-range", label: "Price Range", icon: BadgeDollarSign },
  { id: "top-rated", label: "Top Rated", icon: TrendingUp },
  { id: "top-rated-area", label: "Top Rated In Area", icon: AreaChart },
];

export interface VenuePriceRangeOption {
  id: VenuePriceRange;
  label: string;
  caption: string;
}

export const VENUE_PRICE_RANGE_OPTIONS: VenuePriceRangeOption[] = [
  {
    id: "price_cheapest",
    label: "$",
    caption: "Cheapest",
  },
  {
    id: "cheap",
    label: "$$",
    caption: "Budget",
  },
  {
    id: "mid_range",
    label: "$$$",
    caption: "Mid Range",
  },
  {
    id: "expensive",
    label: "$$$$",
    caption: "Premium",
  },
  {
    id: "luxury",
    label: "$$$$$",
    caption: "Luxury",
  },
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
