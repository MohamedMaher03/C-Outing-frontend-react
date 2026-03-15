/**
 * Home Feature — Public API
 */

// Components
export { default as PlaceCard } from "./components/PlaceCard";

// Hooks
export { useHome } from "./hooks/useHomeHook";

// Types
export type {
  DiscoverySource,
  FilterType,
  HomePageData,
  HomePlace,
  PlaceCardProps,
  VenueByDistrictParams,
  VenueByPriceRangeParams,
  VenueByTypeParams,
  VenuePriceRange,
  VenueTopRatedInAreaParams,
} from "./types";

// API layer (exposed for advanced usage / testing)
export { homeApi } from "./api/homeApi";

// Services
export { homeService } from "./services/homeService";

// Mocks & UI constants
export {
  DISCOVERY_SOURCE_OPTIONS,
  FILTER_OPTIONS,
  CATEGORY_ICON_MAP,
  MOOD_ICON_MAP,
  VENUE_PRICE_RANGE_OPTIONS,
  homeMock,
} from "./mocks";
