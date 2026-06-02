import type {
  HomePlace,
  HomeRecommendationsQuery,
  VenueByDistrictParams,
  VenueByPriceRangeParams,
  VenueByTypeParams,
  VenueTopRatedInAreaParams,
} from "@/features/home/types";

export interface MapAtlasDataSource {
  fetchPersonalizedRecommendations: (
    params?: HomeRecommendationsQuery,
  ) => Promise<HomePlace[]>;
  fetchTrendingRecommendations: (
    params?: HomeRecommendationsQuery,
  ) => Promise<HomePlace[]>;
  togglePlaceSave: (placeId: string, isSaved: boolean) => Promise<void>;
  fetchMoodRecommendations: (
    moodId: string,
    count?: number,
  ) => Promise<HomePlace[]>;
  fetchVenuesByDistrict: (
    params: VenueByDistrictParams,
  ) => Promise<HomePlace[]>;
  fetchVenuesByType: (params: VenueByTypeParams) => Promise<HomePlace[]>;
  fetchVenuesByPriceRange: (
    params: VenueByPriceRangeParams,
  ) => Promise<HomePlace[]>;
  fetchVenueTopRated: () => Promise<HomePlace[]>;
  fetchVenueTopRatedInArea: (
    params: VenueTopRatedInAreaParams,
  ) => Promise<HomePlace[]>;
}
