import type { PriceLevel } from "../types";

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

export const PRICE_LEVEL_OPTIONS: Array<{ value: PriceLevel; signs: number }> =
  [
    { value: "price_cheapest", signs: 1 },
    { value: "cheap", signs: 2 },
    { value: "mid_range", signs: 3 },
    { value: "expensive", signs: 4 },
    { value: "luxury", signs: 5 },
  ];
