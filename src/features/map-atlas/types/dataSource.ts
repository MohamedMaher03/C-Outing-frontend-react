import type {
  HomePageData,
  HomePlace,
  HomeRecommendationsQuery,
  SimilarRecommendationsParams,
  VenueByDistrictParams,
  VenueByPriceRangeParams,
  VenueByTypeParams,
  VenueTopRatedInAreaParams,
} from "@/features/home/types";

export interface MapAtlasDataSource {
  fetchHomePageData: (
    params?: HomeRecommendationsQuery,
  ) => Promise<HomePageData>;
  fetchPersonalizedRecommendations: (
    params?: HomeRecommendationsQuery,
  ) => Promise<HomePlace[]>;
  fetchTrendingRecommendations: (
    params?: HomeRecommendationsQuery,
  ) => Promise<HomePlace[]>;
  fetchSimilarRecommendations: (
    params: SimilarRecommendationsParams,
  ) => Promise<HomePlace[]>;
  togglePlaceSave: (placeId: string, isSaved: boolean) => Promise<void>;
  fetchPlacesByMood: (moodId: string) => Promise<HomePlace[]>;
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
