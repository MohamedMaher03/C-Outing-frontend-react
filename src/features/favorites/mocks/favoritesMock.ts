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
import type { PaginatedResponse } from "@/types";
import type { FavoriteListParams, FavoritePlace } from "../types";
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
   * Mock GET /api/v1/Favorite
   */
  async getFavorites(
    params?: FavoriteListParams,
  ): Promise<PaginatedResponse<FavoritePlace>> {
    await delay(5000);

    const page = Math.max(1, params?.page ?? 1);
    const pageSize = Math.max(1, params?.pageSize ?? 10);
    const totalCount = mockFavorites.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const start = (page - 1) * pageSize;
    const items = mockFavorites.slice(start, start + pageSize);

    return {
      items,
      pageIndex: page,
      pageSize,
      totalCount,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  },

  /**
   * Mock POST /api/v1/Favorite
   */
  async addToFavorites(placeId: string): Promise<void> {
    await delay(900);

    const place = PLACES.find((p) => p.id === placeId);
    if (place && !mockFavorites.find((f) => f.id === placeId)) {
      mockFavorites.push({ ...place, isSaved: true });
    }
  },

  /**
   * Mock DELETE /api/v1/Favorite/{venueId}
   */
  async removeFromFavorites(placeId: string): Promise<void> {
    await delay(300);
    mockFavorites = mockFavorites.filter((f) => f.id !== placeId);
  },

  /**
   * Mock GET /api/v1/Favorite/check/{venueId}
   */
  async checkIsFavorite(placeId: string): Promise<boolean> {
    await delay(200);
    return !!mockFavorites.find((f) => f.id === placeId);
  },
};
