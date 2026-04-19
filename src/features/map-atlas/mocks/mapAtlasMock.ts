import type { MapAtlasDataSource } from "@/features/map-atlas/types/dataSource";
import { homeMock } from "@/features/home/mocks/homeMock";

export const mapAtlasMock: MapAtlasDataSource = {
  fetchHomePageData: homeMock.fetchHomePageData,
  fetchPersonalizedRecommendations: homeMock.fetchPersonalizedRecommendations,
  fetchTrendingRecommendations: homeMock.fetchTrendingRecommendations,
  fetchSimilarRecommendations: homeMock.fetchSimilarRecommendations,
  togglePlaceSave: homeMock.togglePlaceSave,
  fetchPlacesByMood: homeMock.fetchPlacesByMood,
  fetchVenuesByDistrict: homeMock.fetchVenuesByDistrict,
  fetchVenuesByType: homeMock.fetchVenuesByType,
  fetchVenuesByPriceRange: homeMock.fetchVenuesByPriceRange,
  fetchVenueTopRated: homeMock.fetchVenueTopRated,
  fetchVenueTopRatedInArea: homeMock.fetchVenueTopRatedInArea,
};
