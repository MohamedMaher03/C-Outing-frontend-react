export { default as MapAtlasPage } from "./pages/MapAtlasPage";
export { default as MapAtlasCanvas } from "./components/MapAtlasCanvas";
export { useMapAtlas } from "./hooks";

// API layer (exposed for advanced usage / testing)
export { mapAtlasApi } from "./api/mapAtlasApi";
export type { MapAtlasDataSource } from "./types/dataSource";

// Services
export {
  mapAtlasService,
  fetchMapAtlasHomePageData,
  fetchMapAtlasPersonalizedRecommendations,
  fetchMapAtlasTrendingRecommendations,
  fetchMapAtlasSimilarRecommendations,
  toggleMapAtlasPlaceSave,
  fetchMapAtlasPlacesByMood,
  fetchMapAtlasVenuesByDistrict,
  fetchMapAtlasVenuesByType,
  fetchMapAtlasVenuesByPriceRange,
  fetchMapAtlasVenueTopRated,
  fetchMapAtlasVenueTopRatedInArea,
} from "./services/mapAtlasService";

export type {
  MapAtlasSource,
  MapAtlasSourceOption,
  ClusterPointProperties,
  MapAtlasStats,
  ClusteredPlace,
} from "./types";

// Mocks (development use)
export { mapAtlasMock } from "./mocks";
