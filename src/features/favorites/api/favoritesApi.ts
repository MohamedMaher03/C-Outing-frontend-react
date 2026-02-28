/**
 * Favorites API Layer
 *
 * Pure HTTP functions — no business logic, no side effects, no storage.
 * Each function maps 1-to-1 with a backend endpoint.
 *
 * The shared axios instance (src/config/axios.config.ts) handles:
 *   • Attaching the Authorization header on every request
 *   • Handling 401 responses globally
 *
 * To switch to mocks during development, swap the import in favoritesService.ts:
 *   import { favoritesMock as favoritesApi } from "../mocks/favoritesMock";
 */

import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type { FavoritePlace, ToggleFavoriteResponse } from "../types";

// Placeholder — replace with the real user id from auth context when backend is live
const CURRENT_USER_ID = 1;

export const favoritesApi = {
  /**
   * GET /users/:userId/favorites
   * Returns all saved/favorited places for the current user.
   */
  async getFavorites(): Promise<FavoritePlace[]> {
    const { data } = await axiosInstance.get<FavoritePlace[]>(
      API_ENDPOINTS.favorites.getAll(CURRENT_USER_ID),
    );
    return data;
  },

  /**
   * POST /users/:userId/favorites
   * Adds a place to the user's favorites.
   */
  async addToFavorites(placeId: string): Promise<ToggleFavoriteResponse> {
    const { data } = await axiosInstance.post<ToggleFavoriteResponse>(
      API_ENDPOINTS.favorites.add(CURRENT_USER_ID),
      { placeId },
    );
    return data;
  },

  /**
   * DELETE /users/:userId/favorites/:placeId
   * Removes a place from the user's favorites.
   */
  async removeFromFavorites(placeId: string): Promise<ToggleFavoriteResponse> {
    const { data } = await axiosInstance.delete<ToggleFavoriteResponse>(
      API_ENDPOINTS.favorites.remove(CURRENT_USER_ID, placeId),
    );
    return data;
  },

  /**
   * GET /users/:userId/favorites/:placeId/check
   * Checks whether a place is in the user's favorites.
   */
  async checkIsFavorite(placeId: string): Promise<boolean> {
    const { data } = await axiosInstance.get<{ isFavorite: boolean }>(
      API_ENDPOINTS.favorites.check(CURRENT_USER_ID, placeId),
    );
    return data.isFavorite;
  },
};
