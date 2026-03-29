/**
 * Home Service — Business Logic Layer
 *
 * Sits between hooks/components and the HTTP layer (homeApi).
 * Responsibilities:
 *   • Call homeApi functions
 *   • Transform DTOs to UI models if needed
 *   • Centralise error handling
 *
 * ┌────────────────────────────────────────────────────────────┐
 * │  useHome  →  homeService  →  homeApi  →  axios            │
 * └────────────────────────────────────────────────────────────┘
 *
 * 🔧 To use mocks during development, swap the import:
 *   import { homeMock as homeApi } from "../mocks/homeMock";
 */
//import { homeApi } from "../api/homeApi";
import { homeMock as homeApi } from "../mocks/homeMock";
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

// ── Home Service ─────────────────────────────────────────────

export const homeService = {
  /**
   * Fetch home page data for a specific user.
   *
   * @param userId - Required. curatedPlaces are personalized recommendations
   *                 computed from the user's preference vector by the backend.
   *                 trending is global, and the call is batched
   *                 together for a single loading state.
   */
  async fetchHomePageData(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePageData> {
    try {
      return await homeApi.fetchHomePageData(params);
    } catch {
      throw new Error("Failed to fetch home page data");
    }
  },

  async fetchPersonalizedRecommendations(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePlace[]> {
    try {
      return await homeApi.fetchPersonalizedRecommendations(params);
    } catch {
      throw new Error("Failed to fetch personalized recommendations");
    }
  },

  async fetchTrendingRecommendations(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePlace[]> {
    try {
      return await homeApi.fetchTrendingRecommendations(params);
    } catch {
      throw new Error("Failed to fetch trending recommendations");
    }
  },

  async fetchSimilarRecommendations(
    params: SimilarRecommendationsParams,
  ): Promise<HomePlace[]> {
    try {
      return await homeApi.fetchSimilarRecommendations(params);
    } catch {
      throw new Error("Failed to fetch similar recommendations");
    }
  },

  /**
   * Toggle save/bookmark status for a place.
   */
  async togglePlaceSave(placeId: string, isSaved: boolean): Promise<void> {
    try {
      await homeApi.togglePlaceSave(placeId, isSaved);
    } catch {
      throw new Error("Failed to toggle place save");
    }
  },

  /**
   * Fetch places that match a given mood.
   * @param moodId - One of: "chill" | "adventure" | "romantic" | "social" | "explore" | "foodie"
   * Expected response: HomePlace[] sorted by relevance/rating (backend-ranked).
   */
  async fetchPlacesByMood(moodId: string): Promise<HomePlace[]> {
    try {
      return await homeApi.fetchPlacesByMood(moodId);
    } catch {
      throw new Error("Failed to fetch mood-based places");
    }
  },

  async fetchVenuesByDistrict(
    params: VenueByDistrictParams,
  ): Promise<HomePlace[]> {
    try {
      return await homeApi.fetchVenuesByDistrict(params);
    } catch {
      throw new Error("Failed to fetch venues by district");
    }
  },

  async fetchVenuesByType(params: VenueByTypeParams): Promise<HomePlace[]> {
    try {
      return await homeApi.fetchVenuesByType(params);
    } catch {
      throw new Error("Failed to fetch venues by type");
    }
  },

  async fetchVenuesByPriceRange(
    params: VenueByPriceRangeParams,
  ): Promise<HomePlace[]> {
    try {
      return await homeApi.fetchVenuesByPriceRange(params);
    } catch {
      throw new Error("Failed to fetch venues by price range");
    }
  },

  async fetchVenueTopRated(): Promise<HomePlace[]> {
    try {
      return await homeApi.fetchVenueTopRated();
    } catch {
      throw new Error("Failed to fetch top-rated venues");
    }
  },

  async fetchVenueTopRatedInArea(
    params: VenueTopRatedInAreaParams,
  ): Promise<HomePlace[]> {
    try {
      return await homeApi.fetchVenueTopRatedInArea(params);
    } catch {
      throw new Error("Failed to fetch top-rated venues in area");
    }
  },
};
