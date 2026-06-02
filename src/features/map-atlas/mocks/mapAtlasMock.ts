import type { MapAtlasDataSource } from "@/features/map-atlas/types/dataSource";
import { homeMock } from "@/features/home/mocks/homeMock";

export const mapAtlasMock: MapAtlasDataSource = {
  fetchPersonalizedRecommendations: homeMock.fetchPersonalizedRecommendations,
  fetchTrendingRecommendations: homeMock.fetchTrendingRecommendations,
  togglePlaceSave: homeMock.togglePlaceSave,
  fetchMoodRecommendations: homeMock.fetchMoodRecommendations,
  fetchVenuesByDistrict: homeMock.fetchVenuesByDistrict,
  fetchVenuesByType: homeMock.fetchVenuesByType,
  fetchVenuesByPriceRange: homeMock.fetchVenuesByPriceRange,
  fetchVenueTopRated: homeMock.fetchVenueTopRated,
  fetchVenueTopRatedInArea: homeMock.fetchVenueTopRatedInArea,
};
