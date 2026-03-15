/**
 * Home Feature — Type Definitions
 */

import type {
  Place as PlaceDetails,
  Category,
  MoodOption,
  TrendingTag,
} from "@/mocks/mockData";

/** Active filter pill identifiers */
export type FilterType = "all" | "top-rated" | "near-me" | "open-now";

/** Canonical backend budget bands used by Venue/price-range. */
export type VenuePriceRange =
  | "price_cheapest"
  | "cheap"
  | "mid_range"
  | "expensive"
  | "luxury";

export type DiscoverySource =
  | "district"
  | "type"
  | "price-range"
  | "top-rated"
  | "top-rated-area";

/**
 * Lightweight venue shape used by the homepage lists/cards.
 * Keep rich venue metadata on the base Place model for detail pages.
 */
export type HomePlace = Pick<
  PlaceDetails,
  | "id"
  | "name"
  | "category"
  | "latitude"
  | "longitude"
  | "address"
  | "rating"
  | "reviewCount"
  | "image"
  | "priceLevel"
  | "isOpen"
  | "atmosphereTags"
  | "hasWifi"
  | "isSaved"
  | "matchScore"
>;

/** Shape returned by the home service (backend-computed sections) */
export interface HomePageData {
  curatedPlaces: HomePlace[];
  trendingPlaces: HomePlace[];
  topRatedPlaces: HomePlace[];
}

export interface VenueByDistrictParams {
  district: string;
}

export interface VenueByTypeParams {
  type: string;
}

export interface VenueByPriceRangeParams {
  priceRange: VenuePriceRange;
}

export interface VenueTopRatedInAreaParams {
  area: string;
}

/** Props accepted by the PlaceCard component */
export interface PlaceCardProps {
  place: HomePlace;
  variant?: "horizontal" | "grid";
  onToggleSave?: (id: string) => void;
  onClick?: (id: string) => void;
}

// Re-export shared types used within this feature
export type { PlaceDetails, Category, MoodOption, TrendingTag };
