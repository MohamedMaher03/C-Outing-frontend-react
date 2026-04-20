import { homeApi } from "../api/homeApi";
import { homeMock } from "../mocks/homeMock";
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
import { selectDataSource } from "@/utils/dataSourceResolver";

const homeDataSource = selectDataSource(
  import.meta.env.VITE_HOME_USE_MOCKS,
  homeMock,
  homeApi,
);

const withServiceError = async <T>(
  operation: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> => {
  try {
    return await operation();
  } catch {
    throw new Error(fallbackMessage);
  }
};

export const homeService = {
  async fetchHomePageData(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePageData> {
    return withServiceError(
      () => homeDataSource.fetchHomePageData(params),
      "Failed to fetch home page data",
    );
  },

  async fetchPersonalizedRecommendations(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePlace[]> {
    return withServiceError(
      () => homeDataSource.fetchPersonalizedRecommendations(params),
      "Failed to fetch personalized recommendations",
    );
  },

  async fetchTrendingRecommendations(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePlace[]> {
    return withServiceError(
      () => homeDataSource.fetchTrendingRecommendations(params),
      "Failed to fetch trending recommendations",
    );
  },

  async fetchSimilarRecommendations(
    params: SimilarRecommendationsParams,
  ): Promise<HomePlace[]> {
    return withServiceError(
      () => homeDataSource.fetchSimilarRecommendations(params),
      "Failed to fetch similar recommendations",
    );
  },

  async togglePlaceSave(placeId: string, isSaved: boolean): Promise<void> {
    return withServiceError(
      () => homeDataSource.togglePlaceSave(placeId, isSaved),
      "Failed to toggle place save",
    );
  },

  async fetchPlacesByMood(moodId: string): Promise<HomePlace[]> {
    return withServiceError(
      () => homeDataSource.fetchPlacesByMood(moodId),
      "Failed to fetch mood-based places",
    );
  },

  async fetchVenuesByDistrict(
    params: VenueByDistrictParams,
  ): Promise<HomePlace[]> {
    return withServiceError(
      () => homeDataSource.fetchVenuesByDistrict(params),
      "Failed to fetch venues by district",
    );
  },

  async fetchVenuesByType(params: VenueByTypeParams): Promise<HomePlace[]> {
    return withServiceError(
      () => homeDataSource.fetchVenuesByType(params),
      "Failed to fetch venues by type",
    );
  },

  async fetchVenuesByPriceRange(
    params: VenueByPriceRangeParams,
  ): Promise<HomePlace[]> {
    return withServiceError(
      () => homeDataSource.fetchVenuesByPriceRange(params),
      "Failed to fetch venues by price range",
    );
  },

  async fetchVenueTopRated(): Promise<HomePlace[]> {
    return withServiceError(
      () => homeDataSource.fetchVenueTopRated(),
      "Failed to fetch top-rated venues",
    );
  },

  async fetchVenueTopRatedInArea(
    params: VenueTopRatedInAreaParams,
  ): Promise<HomePlace[]> {
    return withServiceError(
      () => homeDataSource.fetchVenueTopRatedInArea(params),
      "Failed to fetch top-rated venues in area",
    );
  },
};
