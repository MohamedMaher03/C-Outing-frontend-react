/**
 * Home Feature — Type Definitions
 */

import type {
  Place,
  Category,
  MoodOption,
  TrendingTag,
} from "@/mocks/mockData";

/** Active filter pill identifiers */
export type FilterType = "all" | "top-rated" | "near-me" | "open-now";

/** Shape returned by the home service (backend-computed sections) */
export interface HomePageData {
  curatedPlaces: Place[];
  trendingPlaces: Place[];
  topRatedPlaces: Place[];
}

/** Props accepted by the PlaceCard component */
export interface PlaceCardProps {
  place: Place;
  variant?: "horizontal" | "grid";
  onToggleSave?: (id: string) => void;
  onClick?: (id: string) => void;
}

// Re-export shared types used within this feature
export type { Place, Category, MoodOption, TrendingTag };
