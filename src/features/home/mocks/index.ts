import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  TrendingUp,
  Navigation,
  Clock,
  Bookmark,
  Wifi,
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
import { PRICE_LEVEL_OPTIONS as SHARED_PRICE_LEVEL_OPTIONS } from "@/utils/priceLevels";

export { homeMock } from "./homeMock";
export { LOCATION_DISTANCE_MOCK_CASES } from "./locationDistanceCases";

export interface FilterOption {
  id: FilterType;
  label: string;
  icon: LucideIcon;
}

export const FILTER_OPTIONS: FilterOption[] = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "near-me", label: "Near Me", icon: Navigation },
  { id: "open-now", label: "Open Now", icon: Clock },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "has-wifi", label: "Wi-Fi", icon: Wifi },
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

export const VENUE_PRICE_RANGE_OPTIONS: VenuePriceRangeOption[] =
  SHARED_PRICE_LEVEL_OPTIONS.map((option) => ({
    id: option.value as VenuePriceRange,
    label: option.label,
    caption: `${option.caption} · ${option.symbol}`,
  }));

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

export const MOOD_ICON_MAP: Record<string, LucideIcon> = {
  Coffee,
  Mountain,
  Heart,
  Users,
  Binoculars,
  UtensilsCrossed,
};
