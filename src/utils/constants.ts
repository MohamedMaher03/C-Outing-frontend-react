
import { PRICE_LEVEL_VALUES } from "@/utils/priceLevels";

export const VENUE_CATEGORIES = [
  "Restaurant",
  "Cafe",
  "Bar",
  "Club",
  "Hotel",
  "Entertainment",
  "Theme Park",
  "Museum",
  "Shopping Mall",
  "Gym",
];

export const BUDGET_LEVELS = PRICE_LEVEL_VALUES;

export const MOODS = ["relaxed", "energetic", "social", "romantic"] as const;

export const COMPANIONS = ["solo", "friends", "family", "partner"] as const;

export const TIME_OF_DAY = [
  "morning",
  "afternoon",
  "evening",
  "night",
] as const;

export const WEATHER_CONDITIONS = ["sunny", "cloudy", "rainy", "hot"] as const;

export const INTERACTION_ACTIONS = [
  "favorite",
  "review",
  "rate",
  "like",
  "share",
  "directions",
  "long_view",
  "view_photos",
  "view",
] as const;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const CAIRO_GIZA_BOUNDS = {
  north: 30.1858,
  south: 29.8363,
  east: 31.5466,
  west: 31.0042,
};
