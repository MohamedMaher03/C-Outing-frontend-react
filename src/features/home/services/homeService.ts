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
 * Mock control:
 *   VITE_HOME_USE_MOCKS=true|false
 * Falls back to VITE_USE_MOCKS when VITE_HOME_USE_MOCKS is not set.
 */
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

const parseBooleanEnv = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

const resolveFeatureMockFlag = (featureValue: unknown): boolean => {
  if (typeof featureValue === "string") {
    return parseBooleanEnv(featureValue);
  }

  return parseBooleanEnv(import.meta.env.VITE_USE_MOCKS);
};

const shouldUseHomeMocks = resolveFeatureMockFlag(
  import.meta.env.VITE_HOME_USE_MOCKS,
);
const homeDataSource = shouldUseHomeMocks ? homeMock : homeApi;

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
      return await homeDataSource.fetchHomePageData(params);
    } catch {
      throw new Error("Failed to fetch home page data");
    }
  },

  async fetchPersonalizedRecommendations(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePlace[]> {
    try {
      return await homeDataSource.fetchPersonalizedRecommendations(params);
    } catch {
      throw new Error("Failed to fetch personalized recommendations");
    }
  },

  async fetchTrendingRecommendations(
    params?: HomeRecommendationsQuery,
  ): Promise<HomePlace[]> {
    try {
      return await homeDataSource.fetchTrendingRecommendations(params);
    } catch {
      throw new Error("Failed to fetch trending recommendations");
    }
  },

  async fetchSimilarRecommendations(
    params: SimilarRecommendationsParams,
  ): Promise<HomePlace[]> {
    try {
      return await homeDataSource.fetchSimilarRecommendations(params);
    } catch {
      throw new Error("Failed to fetch similar recommendations");
    }
  },

  /**
   * Toggle save/bookmark status for a place.
   */
  async togglePlaceSave(placeId: string, isSaved: boolean): Promise<void> {
    try {
      await homeDataSource.togglePlaceSave(placeId, isSaved);
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
      return await homeDataSource.fetchPlacesByMood(moodId);
    } catch {
      throw new Error("Failed to fetch mood-based places");
    }
  },

  async fetchVenuesByDistrict(
    params: VenueByDistrictParams,
  ): Promise<HomePlace[]> {
    try {
      return await homeDataSource.fetchVenuesByDistrict(params);
    } catch {
      throw new Error("Failed to fetch venues by district");
    }
  },

  async fetchVenuesByType(params: VenueByTypeParams): Promise<HomePlace[]> {
    try {
      return await homeDataSource.fetchVenuesByType(params);
    } catch {
      throw new Error("Failed to fetch venues by type");
    }
  },

  async fetchVenuesByPriceRange(
    params: VenueByPriceRangeParams,
  ): Promise<HomePlace[]> {
    try {
      return await homeDataSource.fetchVenuesByPriceRange(params);
    } catch {
      throw new Error("Failed to fetch venues by price range");
    }
  },

  async fetchVenueTopRated(): Promise<HomePlace[]> {
    try {
      return await homeDataSource.fetchVenueTopRated();
    } catch {
      throw new Error("Failed to fetch top-rated venues");
    }
  },

  async fetchVenueTopRatedInArea(
    params: VenueTopRatedInAreaParams,
  ): Promise<HomePlace[]> {
    try {
      return await homeDataSource.fetchVenueTopRatedInArea(params);
    } catch {
      throw new Error("Failed to fetch top-rated venues in area");
    }
  },
};
