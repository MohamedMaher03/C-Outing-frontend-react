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
import type { HomePageData, HomePlace } from "../types";

export const homeApi = {
  /**
   * GET /recommendations/:userId  (curated — personalized)
   * GET /venues/trending           (same for all users)
   * GET /venues/top-rated          (same for all users)
   *
   * curatedPlaces MUST carry a userId because the backend ranks them using
   * the user's preference vector.  Trending and top-rated are global lists.
   */
  async fetchHomePageData(userId: string): Promise<HomePageData> {
    const [curated, trending, topRated] = await Promise.all([
      axiosInstance.get<HomePlace[]>(API_ENDPOINTS.home.curated(userId)),
      axiosInstance.get<HomePlace[]>(API_ENDPOINTS.home.trending),
      axiosInstance.get<HomePlace[]>(API_ENDPOINTS.home.topRated),
    ]);
    return {
      curatedPlaces: curated.data,
      trendingPlaces: trending.data,
      topRatedPlaces: topRated.data,
    };
  },

  /**
   * POST /venues/:placeId/save
   * Toggles the saved/bookmark status for a place.
   */
  async togglePlaceSave(placeId: string, isSaved: boolean): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.home.toggleSave(placeId), {
      isSaved,
    });
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
};
