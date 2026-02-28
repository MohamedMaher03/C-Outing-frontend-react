/**
 * Favorites Mock Implementations
 *
 * Drop-in replacement for favoritesApi — mirrors the same interface so it can
 * be swapped in favoritesService.ts without changing any other code:
 *
 *   // favoritesService.ts — swap this one line:
 *   import { favoritesMock as favoritesApi } from "../mocks/favoritesMock";
 *
 * Simulates realistic network latency and in-memory favorites storage.
 */

import { PLACES } from "@/mocks/mockData";
import type { FavoritePlace, ToggleFavoriteResponse } from "../types";
import { createInitialFavorites } from "./index";

// ── In-memory mock store ─────────────────────────────────────

let mockFavorites: FavoritePlace[] = createInitialFavorites();

// ── Helper ───────────────────────────────────────────────────

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ── Mock Favorites API ───────────────────────────────────────
// Interface intentionally mirrors favoritesApi so they are interchangeable.

export const favoritesMock = {
  /**
   * Mock GET /users/:userId/favorites
   */
  async getFavorites(): Promise<FavoritePlace[]> {
    await delay(500);
    return [...mockFavorites];
  },

  /**
   * Mock POST /users/:userId/favorites
   */
  async addToFavorites(placeId: string): Promise<ToggleFavoriteResponse> {
    await delay(300);

    const place = PLACES.find((p) => p.id === placeId);
    if (place && !mockFavorites.find((f) => f.id === placeId)) {
      mockFavorites.push({ ...place, savedAt: new Date(), isSaved: true });
    }

    return { success: true, isFavorite: true };
  },

  /**
   * Mock DELETE /users/:userId/favorites/:placeId
   */
  async removeFromFavorites(placeId: string): Promise<ToggleFavoriteResponse> {
    await delay(300);
    mockFavorites = mockFavorites.filter((f) => f.id !== placeId);
    return { success: true, isFavorite: false };
  },

  /**
   * Mock GET /users/:userId/favorites/:placeId/check
   */
  async checkIsFavorite(placeId: string): Promise<boolean> {
    await delay(200);
    return !!mockFavorites.find((f) => f.id === placeId);
  },
};
