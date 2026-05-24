import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import {
  mapHomePaginatedPlacesPayload,
  mapHomePlacesPayload,
} from "../mappers/homeApi.mapper";
import type {
  HomePageData,
  HomePlace,
  HomeRecommendationsQuery,
  HomeSearchQuery,
  SimilarRecommendationsParams,
  VenueByDistrictParams,
  VenueByPriceRangeParams,
  VenueByTypeParams,
  VenueTopRatedInAreaParams,
} from "../types";
import type { PaginatedResponse } from "@/types";

export const homeApi = {
  async fetchHomePageData(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePageData> {
    const count = params?.count;
    const [curated, trending] = await Promise.all([
      axiosInstance.get<unknown>(API_ENDPOINTS.recommendations.curated, {
        params: { count },
      }),
      axiosInstance.get<unknown>(API_ENDPOINTS.recommendations.trending, {
        params: { count },
      }),
    ]);

    return {
      curatedPlaces: mapHomePlacesPayload(curated.data),
      trendingPlaces: mapHomePlacesPayload(trending.data),
    };
  },

  async fetchPersonalizedRecommendations(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePlace[]> {
    const { data } = await axiosInstance.get<unknown>(
      API_ENDPOINTS.recommendations.curated,
      {
        params: { count: params?.count },
      },
    );
    return mapHomePlacesPayload(data);
  },

  async fetchTrendingRecommendations(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePlace[]> {
    const { data } = await axiosInstance.get<unknown>(
      API_ENDPOINTS.recommendations.trending,
      {
        params: { count: params?.count },
      },
    );
    return mapHomePlacesPayload(data);
  },

  async fetchSimilarRecommendations(
    params: SimilarRecommendationsParams,
  ): Promise<HomePlace[]> {
    const { data } = await axiosInstance.get<unknown>(
      API_ENDPOINTS.recommendations.similar(params.venueId),
      {
        params: { count: params.count },
      },
    );
    return mapHomePlacesPayload(data);
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
    const response = await axiosInstance.get<unknown>(
      API_ENDPOINTS.home.moodPlaces(moodId),
    );
    return mapHomePlacesPayload(response.data);
  },

  async fetchVenuesByDistrict(
    params: VenueByDistrictParams,
  ): Promise<HomePlace[]> {
    const response = await axiosInstance.get<unknown>(
      API_ENDPOINTS.home.venuesByDistrict(params.district),
    );
    return mapHomePlacesPayload(response.data);
  },

  async fetchVenuesByType(params: VenueByTypeParams): Promise<HomePlace[]> {
    const response = await axiosInstance.get<unknown>(
      API_ENDPOINTS.home.venuesByType(params.type),
    );
    return mapHomePlacesPayload(response.data);
  },

  async fetchVenuesByPriceRange(
    params: VenueByPriceRangeParams,
  ): Promise<HomePlace[]> {
    const response = await axiosInstance.get<unknown>(
      API_ENDPOINTS.home.venuesByPriceRange(params.priceRange),
    );
    return mapHomePlacesPayload(response.data);
  },

  async searchVenues(
    params: HomeSearchQuery,
  ): Promise<PaginatedResponse<HomePlace>> {
    const response = await axiosInstance.get<unknown>(
      API_ENDPOINTS.home.search,
      {
        params: {
          SearchTerm: params.searchTerm,
          District: params.district,
          Type: params.type,
          Category: params.category,
          PriceRange: params.priceRange,
          MinRating: params.minRating,
          Latitude: params.latitude,
          Longitude: params.longitude,
          RadiusKm: params.radiusKm,
          Page: params.page,
          PageSize: params.pageSize,
        },
      },
    );

    return mapHomePaginatedPlacesPayload(response.data);
  },

  async fetchVenueTopRated(): Promise<HomePlace[]> {
    const response = await axiosInstance.get<unknown>(
      API_ENDPOINTS.home.venueTopRated,
    );
    return mapHomePlacesPayload(response.data);
  },

  async fetchVenueTopRatedInArea(
    params: VenueTopRatedInAreaParams,
  ): Promise<HomePlace[]> {
    const response = await axiosInstance.get<unknown>(
      API_ENDPOINTS.home.venueTopRatedInArea,
      {
        params: { district: params.area },
      },
    );
    return mapHomePlacesPayload(response.data);
  },
};
