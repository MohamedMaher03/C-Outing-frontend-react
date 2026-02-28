/**
 * Home Feature — Public API
 */

// Components
export { default as PlaceCard } from "./components/PlaceCard";

// Hooks
export { useHome } from "./hooks/useHome";

// Types
export type { FilterType, HomePageData, PlaceCardProps } from "./types";

// API layer (exposed for advanced usage / testing)
export { homeApi } from "./api/homeApi";

// Services
export { homeService } from "./services/homeService";

// Mocks & UI constants
export {
  FILTER_OPTIONS,
  CATEGORY_ICON_MAP,
  MOOD_ICON_MAP,
  homeMock,
} from "./mocks";
