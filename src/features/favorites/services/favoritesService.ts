/**
 * Favorites Service — Business Logic Layer
 *
 * Sits between hooks/components and the HTTP layer (favoritesApi).
 * Responsibilities:
 *   • Call favoritesApi functions
 *   • Transform DTOs to UI models if needed
 *   • Centralise error handling
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │  useFavorites  →  favoritesService  →  favoritesApi  →  axios│
 * └──────────────────────────────────────────────────────────────┘
 *
 * 🔧 To use mocks during development, swap the import:
 *   import { favoritesMock as favoritesApi } from "../mocks/favoritesMock";
 */

import type { PaginatedResponse } from "@/types";
import { favoritesApi } from "../api/favoritesApi";
import type {
  FavoriteItem,
  FavoriteListParams,
} from "@/features/favorites/types";

// ── Favorites Service ────────────────────────────────────────

export const favoritesService = {
  /**
   * Fetch all saved places for the current user.
   */
  async getFavorites(
    params?: FavoriteListParams,
  ): Promise<PaginatedResponse<FavoriteItem>> {
    try {
      return await favoritesApi.getFavorites(params);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw error;
    }
  },

  /**
   * Add a place to favorites.
   */
  async addToFavorites(placeId: string): Promise<void> {
    try {
      await favoritesApi.addToFavorites(placeId);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      throw error;
    }
  },

  /**
   * Remove a place from favorites.
   */
  async removeFromFavorites(placeId: string): Promise<void> {
    try {
      await favoritesApi.removeFromFavorites(placeId);
    } catch (error) {
      console.error("Error removing from favorites:", error);
      throw error;
    }
  },

  /**
   * Toggle favorite status for a place.
   */
  async toggleFavorite(placeId: string, isFavorite: boolean): Promise<void> {
    if (isFavorite) {
      await this.removeFromFavorites(placeId);
    } else {
      await this.addToFavorites(placeId);
    }
  },

  /**
   * Check if a place is favorited.
   */
  async checkIsFavorite(placeId: string): Promise<boolean> {
    try {
      return await favoritesApi.checkIsFavorite(placeId);
    } catch (error) {
      console.error("Error checking favorite status:", error);
      throw error;
    }
  },
};

// ── Legacy named exports (keep backward compatibility with hooks) ──

export const getFavorites =
  favoritesService.getFavorites.bind(favoritesService);
export const addToFavorites =
  favoritesService.addToFavorites.bind(favoritesService);
export const removeFromFavorites =
  favoritesService.removeFromFavorites.bind(favoritesService);
export const toggleFavorite =
  favoritesService.toggleFavorite.bind(favoritesService);
export const checkIsFavorite =
  favoritesService.checkIsFavorite.bind(favoritesService);
