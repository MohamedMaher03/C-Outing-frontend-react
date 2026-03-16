/**
 * Home API Layer
 *
 * Pure HTTP functions — no business logic, no side effects, no storage.
 * Each function maps 1-to-1 with a backend endpoint.
 *
 * The shared axios instance (src/config/axios.config.ts) handles:
 *   • Attaching the Authorization header on every request
 *   • Handling 401 responses globally
 *
 * To switch to mocks during development, swap the import in homeService.ts:
 *   import { homeMock as homeApi } from "../mocks/homeMock";
 */

import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type {
  HomePageData,
  HomePlace,
  HomeRecommendationsQuery,
  SimilarRecommendationsParams,
  VenueByDistrictParams,
  VenueByPriceRangeParams,
  VenueByTypeParams,
  VenueTopRatedInAreaParams,
} from "../types";

export const homeApi = {
  /**
   * GET /recommendations/:userId  (curated — personalized)
   * GET /recommendations/trending           (same for all users)
   *
   * curatedPlaces MUST carry a userId because the backend ranks them using
   * the user's preference vector.
   */
  async fetchHomePageData(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePageData> {
    const count = params?.count;
    const [curated, trending] = await Promise.all([
      axiosInstance.get<HomePlace[]>(API_ENDPOINTS.recommendations.curated, {
        params: { count },
      }),
      axiosInstance.get<HomePlace[]>(API_ENDPOINTS.recommendations.trending, {
        params: { count },
      }),
    ]);

    return {
      curatedPlaces: curated.data,
      trendingPlaces: trending.data,
    };
  },

  /** GET /api/v1/Recommendation/personalized?count={count} */
  async fetchPersonalizedRecommendations(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePlace[]> {
    const { data } = await axiosInstance.get<HomePlace[]>(
      API_ENDPOINTS.recommendations.curated,
      {
        params: { count: params?.count },
      },
    );
    return data;
  },

  /** GET /api/v1/Recommendation/trending?count={count} */
  async fetchTrendingRecommendations(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePlace[]> {
    const { data } = await axiosInstance.get<HomePlace[]>(
      API_ENDPOINTS.recommendations.trending,
      {
        params: { count: params?.count },
      },
    );
    return data;
  },

  /** GET /api/v1/Recommendation/similar/{venueId}?count={count} */
  async fetchSimilarRecommendations(
    params: SimilarRecommendationsParams,
  ): Promise<HomePlace[]> {
    const { data } = await axiosInstance.get<HomePlace[]>(
      API_ENDPOINTS.recommendations.similar(params.venueId),
      {
        params: { count: params.count },
      },
    );
    return data;
  },

  /**
   * Uses Favorites endpoints to toggle the saved/bookmark status.
   * POST   /api/v1/Favorite          (save)
   * DELETE /api/v1/Favorite/{venueId} (unsave)
   */
  async togglePlaceSave(placeId: string, isSaved: boolean): Promise<void> {
    if (isSaved) {
      await axiosInstance.post(API_ENDPOINTS.favorites.add, {
        venueId: placeId,
      });
      return;
    }

    await axiosInstance.delete(API_ENDPOINTS.favorites.remove(placeId));
  },

  /**
   * GET /venues/mood/:moodId
   * Returns places that match the given mood (e.g. "chill", "romantic").
   * The backend applies a mood-to-attribute mapping and returns a ranked list.
   */
  async fetchPlacesByMood(moodId: string): Promise<HomePlace[]> {
    const response = await axiosInstance.get<HomePlace[]>(
      API_ENDPOINTS.home.moodPlaces(moodId),
    );
    return response.data;
  },

  /** GET /api/v1/Venue/district/{district} */
  async fetchVenuesByDistrict(
    params: VenueByDistrictParams,
  ): Promise<HomePlace[]> {
    const response = await axiosInstance.get<HomePlace[]>(
      API_ENDPOINTS.home.venuesByDistrict(params.district),
    );
    return response.data;
  },

  /** GET /api/v1/Venue/type/{type} */
  async fetchVenuesByType(params: VenueByTypeParams): Promise<HomePlace[]> {
    const response = await axiosInstance.get<HomePlace[]>(
      API_ENDPOINTS.home.venuesByType(params.type),
    );
    return response.data;
  },

  /** GET /api/v1/Venue/price-range/{priceRange} */
  async fetchVenuesByPriceRange(
    params: VenueByPriceRangeParams,
  ): Promise<HomePlace[]> {
    const response = await axiosInstance.get<HomePlace[]>(
      API_ENDPOINTS.home.venuesByPriceRange(params.priceRange),
    );
    return response.data;
  },

  /** GET /api/v1/Venue/top-rated */
  async fetchVenueTopRated(): Promise<HomePlace[]> {
    const response = await axiosInstance.get<HomePlace[]>(
      API_ENDPOINTS.home.venueTopRated,
    );
    return response.data;
  },

  /** GET /api/v1/Venue/top-rated-in-area?area={area} */
  async fetchVenueTopRatedInArea(
    params: VenueTopRatedInAreaParams,
  ): Promise<HomePlace[]> {
    const response = await axiosInstance.get<HomePlace[]>(
      API_ENDPOINTS.home.venueTopRatedInArea,
      {
        params: { area: params.area },
      },
    );
    return response.data;
  },
};
