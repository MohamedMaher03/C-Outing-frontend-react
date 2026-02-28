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

// import { favoritesApi } from "../api/favoritesApi"; // (WHEN INTEGRATE WITH BACKEND USE THIS AND REMOVE ONE DOWN)
import { favoritesMock as favoritesApi } from "../mocks/favoritesMock";
import type {
  FavoritePlace,
  ToggleFavoriteResponse,
} from "@/features/favorites/types";

// ── Favorites Service ────────────────────────────────────────

export const favoritesService = {
  /**
   * Fetch all saved places for the current user.
   */
  async getFavorites(): Promise<FavoritePlace[]> {
    try {
      return await favoritesApi.getFavorites();
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw new Error("Failed to load favorites");
    }
  },

  /**
   * Add a place to favorites.
   */
  async addToFavorites(placeId: string): Promise<ToggleFavoriteResponse> {
    try {
      return await favoritesApi.addToFavorites(placeId);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      throw new Error("Failed to add to favorites");
    }
  },

  /**
   * Remove a place from favorites.
   */
  async removeFromFavorites(placeId: string): Promise<ToggleFavoriteResponse> {
    try {
      return await favoritesApi.removeFromFavorites(placeId);
    } catch (error) {
      console.error("Error removing from favorites:", error);
      throw new Error("Failed to remove from favorites");
    }
  },

  /**
   * Toggle favorite status for a place.
   */
  async toggleFavorite(
    placeId: string,
    isFavorite: boolean,
  ): Promise<ToggleFavoriteResponse> {
    if (isFavorite) {
      return this.removeFromFavorites(placeId);
    } else {
      return this.addToFavorites(placeId);
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
      throw new Error("Failed to check favorite status");
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
