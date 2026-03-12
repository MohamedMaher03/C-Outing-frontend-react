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

// import { homeApi } from "../api/homeApi"; // (WHEN INTEGRATE WITH BACKEND USE THIS AND REMOVE ONE DOWN)
import { homeMock as homeApi } from "../mocks/homeMock";
import type { HomePageData } from "@/features/home/types";
import type { Place } from "@/mocks/mockData";

// ── Home Service ─────────────────────────────────────────────

export const homeService = {
  /**
   * Fetch home page data for a specific user.
   *
   * @param userId - Required. curatedPlaces are personalized recommendations
   *                 computed from the user's preference vector by the backend.
   *                 trending and topRated are global, but the call is batched
   *                 together for a single loading state.
   */
  async fetchHomePageData(userId: string): Promise<HomePageData> {
    try {
      return await homeApi.fetchHomePageData(userId);
    } catch (error) {
      console.error("Error fetching home page data:", error);
      throw new Error("Failed to fetch home page data");
    }
  },

  /**
   * Toggle save/bookmark status for a place.
   */
  async togglePlaceSave(placeId: string, isSaved: boolean): Promise<void> {
    try {
      await homeApi.togglePlaceSave(placeId, isSaved);
    } catch (error) {
      console.error("Error toggling place save:", error);
      throw new Error("Failed to toggle place save");
    }
  },

  /**
   * Fetch places that match a given mood.
   * @param moodId - One of: "chill" | "adventure" | "romantic" | "social" | "explore" | "foodie"
   * Expected response: Place[] sorted by relevance/rating (backend-ranked).
   */
  async fetchPlacesByMood(moodId: string): Promise<Place[]> {
    try {
      return await homeApi.fetchPlacesByMood(moodId);
    } catch (error) {
      console.error("Error fetching places by mood:", error);
      throw new Error("Failed to fetch mood-based places");
    }
  },
};
