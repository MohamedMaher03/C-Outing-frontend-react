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

  async togglePlaceSave(placeId: string, isSaved: boolean): Promise<void> {
    if (isSaved) {
      await axiosInstance.post(API_ENDPOINTS.favorites.add, {
        venueId: placeId,
      });
      return;
    }

    await axiosInstance.delete(API_ENDPOINTS.favorites.remove(placeId));
  },

  async fetchPlacesByMood(moodId: string): Promise<HomePlace[]> {
    const response = await axiosInstance.get<HomePlace[]>(
      API_ENDPOINTS.home.moodPlaces(moodId),
    );
    return response.data;
  },

  async fetchVenuesByDistrict(
    params: VenueByDistrictParams,
  ): Promise<HomePlace[]> {
    const response = await axiosInstance.get<HomePlace[]>(
      API_ENDPOINTS.home.venuesByDistrict(params.district),
    );
    return response.data;
  },

  async fetchVenuesByType(params: VenueByTypeParams): Promise<HomePlace[]> {
    const response = await axiosInstance.get<HomePlace[]>(
      API_ENDPOINTS.home.venuesByType(params.type),
    );
    return response.data;
  },

  async fetchVenuesByPriceRange(
    params: VenueByPriceRangeParams,
  ): Promise<HomePlace[]> {
    const response = await axiosInstance.get<HomePlace[]>(
      API_ENDPOINTS.home.venuesByPriceRange(params.priceRange),
    );
    return response.data;
  },

  async fetchVenueTopRated(): Promise<HomePlace[]> {
    const response = await axiosInstance.get<HomePlace[]>(
      API_ENDPOINTS.home.venueTopRated,
    );
    return response.data;
  },

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
