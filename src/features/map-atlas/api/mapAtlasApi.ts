import type { MapAtlasDataSource } from "@/features/map-atlas/types/dataSource";
import { homeApi } from "@/features/home/api/homeApi";

export const mapAtlasApi: MapAtlasDataSource = {
  fetchPersonalizedRecommendations: homeApi.fetchPersonalizedRecommendations,
  fetchTrendingRecommendations: homeApi.fetchTrendingRecommendations,
  togglePlaceSave: homeApi.togglePlaceSave,
  fetchMoodRecommendations: homeApi.fetchMoodRecommendations,
  fetchVenuesByDistrict: homeApi.fetchVenuesByDistrict,
  fetchVenuesByType: homeApi.fetchVenuesByType,
  fetchVenuesByPriceRange: homeApi.fetchVenuesByPriceRange,
  fetchVenueTopRated: homeApi.fetchVenueTopRated,
  fetchVenueTopRatedInArea: homeApi.fetchVenueTopRatedInArea,
};
