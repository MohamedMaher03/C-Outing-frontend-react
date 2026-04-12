/**
 * Home Feature — Type Definitions
 */

import type {
  Place as PlaceDetails,
  Category,
  MoodOption,
  TrendingTag,
} from "@/mocks/mockData";
import type { CanonicalPriceLevel } from "@/utils/priceLevels";

/** Active filter pill identifiers */
export type FilterType = "all" | "near-me" | "open-now" | "saved" | "has-wifi";

/** Canonical backend budget bands used by Venue/price-range. */
export type VenuePriceRange = CanonicalPriceLevel;

export type DiscoverySource =
  | "district"
  | "type"
  | "price-range"
  | "top-rated"
  | "top-rated-area";

export interface UserLocationCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export type UserLocationStatus =
  | "idle"
  | "loading"
  | "granted"
  | "denied"
  | "unsupported"
  | "unavailable"
  | "error";

export interface UserLocationState {
  status: UserLocationStatus;
  coordinates: UserLocationCoordinates | null;
  message: string | null;
  errorCode: number | null;
  requestLocation: () => void;
}

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
}

export interface HomeRecommendationsQuery {
  count?: number;
}

export interface SimilarRecommendationsParams extends HomeRecommendationsQuery {
  venueId: string;
}

export type HomeRecommendationCollection = "curated" | "trending";

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
  userLocation?: UserLocationState | null;
  onToggleSave?: (id: string) => void;
  isSavePending?: boolean;
  hideTopRatedBadge?: boolean;
  onClick?: (id: string) => void;
}

// Re-export shared types used within this feature
export type { PlaceDetails, Category, MoodOption, TrendingTag };
