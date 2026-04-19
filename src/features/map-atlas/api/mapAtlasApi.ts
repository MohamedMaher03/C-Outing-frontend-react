import type { MapAtlasDataSource } from "@/features/map-atlas/types/dataSource";
import { homeApi } from "@/features/home/api/homeApi";

export const mapAtlasApi: MapAtlasDataSource = {
  fetchHomePageData: homeApi.fetchHomePageData,
  fetchPersonalizedRecommendations: homeApi.fetchPersonalizedRecommendations,
  fetchTrendingRecommendations: homeApi.fetchTrendingRecommendations,
  fetchSimilarRecommendations: homeApi.fetchSimilarRecommendations,
  togglePlaceSave: homeApi.togglePlaceSave,
  fetchPlacesByMood: homeApi.fetchPlacesByMood,
  fetchVenuesByDistrict: homeApi.fetchVenuesByDistrict,
  fetchVenuesByType: homeApi.fetchVenuesByType,
  fetchVenuesByPriceRange: homeApi.fetchVenuesByPriceRange,
  fetchVenueTopRated: homeApi.fetchVenueTopRated,
  fetchVenueTopRatedInArea: homeApi.fetchVenueTopRatedInArea,
};
