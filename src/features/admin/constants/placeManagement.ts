import type { PriceLevel } from "../types";
import { PRICE_LEVEL_OPTIONS as SHARED_PRICE_LEVEL_OPTIONS } from "@/utils/priceLevels";

export const COMMON_PLACE_TAGS = [
  "Outdoor",
  "Romantic",
  "Scenic",
  "Street Food",
  "Casual",
  "Local",
  "Art",
  "Culture",
  "Free Entry",
  "Co-working",
  "Tech",
  "Historical",
  "Shopping",
  "Iconic",
  "Nightlife",
  "Live Music",
  "Parks",
  "Family-friendly",
  "Rooftop",
  "Fine Dining",
  "Nile View",
  "Late Night",
  "Hidden Gem",
  "Budget Friendly",
  "Pet Friendly",
  "Instagrammable",
] as const;

export const PRICE_LEVEL_OPTIONS: Array<{
  value: PriceLevel;
  label: string;
  caption: string;
  symbol: string;
}> = SHARED_PRICE_LEVEL_OPTIONS.map((option) => ({
  value: option.value as PriceLevel,
  label: option.label,
  caption: option.caption,
  symbol: option.symbol,
}));
