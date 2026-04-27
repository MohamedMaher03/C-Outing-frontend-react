/**
 * Application Constants
 * Shared constants used across the application
 */

import { PRICE_LEVEL_VALUES } from "@/utils/priceLevels";

// Categories
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

// Budget Levels
export const BUDGET_LEVELS = PRICE_LEVEL_VALUES;

// Moods
export const MOODS = ["relaxed", "energetic", "social", "romantic"] as const;

// Companions
export const COMPANIONS = ["solo", "friends", "family", "partner"] as const;

// Time of Day
export const TIME_OF_DAY = [
  "morning",
  "afternoon",
  "evening",
  "night",
] as const;

// Weather Conditions
export const WEATHER_CONDITIONS = ["sunny", "cloudy", "rainy", "hot"] as const;

// Action Types for Interactions
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

// Default Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Cairo & Giza Location Bounds
export const CAIRO_GIZA_BOUNDS = {
  north: 30.1858,
  south: 29.8363,
  east: 31.5466,
  west: 31.0042,
};
