/**
 * Favorites Mock Implementations
 *
 * Drop-in replacement for favoritesApi. It mirrors the same datasource
 * interface and is selected through favoritesDataSource.
 *
 * Set VITE_FAVORITES_USE_MOCKS=true to activate this datasource.
 *
 * Simulates realistic network latency and in-memory favorites storage.
 */

import { PLACES } from "@/mocks/mockData";
import type { PaginatedResponse } from "@/types";
import type { FavoriteItem, FavoriteListParams } from "../types";
import type { FavoritesDataSource } from "../types/dataSource";
import { createInitialFavorites } from "./createInitialFavorites";

// ── In-memory mock store ─────────────────────────────────────

let mockFavorites: FavoriteItem[] = createInitialFavorites();

// ── Helper ───────────────────────────────────────────────────

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ── Mock Favorites API ───────────────────────────────────────
// Interface intentionally mirrors favoritesApi so they are interchangeable.

export const favoritesMock: FavoritesDataSource = {
  /**
   * Mock GET /api/v1/Favorite
   */
  async getFavorites(
    params?: FavoriteListParams,
  ): Promise<PaginatedResponse<FavoriteItem>> {
    await delay(500);

    const pageIndex = Math.max(
      0,
      params?.pageIndex ??
        (typeof params?.page === "number" ? params.page - 1 : 0),
    );
    const pageSize = Math.max(1, params?.pageSize ?? 10);
    const totalCount = mockFavorites.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const start = pageIndex * pageSize;
    const items = mockFavorites.slice(start, start + pageSize);

    return {
      items,
      pageIndex,
      pageSize,
      totalCount,
      totalPages,
      hasPreviousPage: pageIndex > 0,
      hasNextPage: pageIndex + 1 < totalPages,
    };
  },

  /**
   * Mock POST /api/v1/Favorite
   */
  async addToFavorites(placeId: string): Promise<void> {
    await delay(900);

    const place = PLACES.find((p) => p.id === placeId);
    if (place && !mockFavorites.find((f) => f.venue.id === placeId)) {
      mockFavorites.push({
        venue: { ...place, isSaved: true },
        createdAt: new Date().toISOString().slice(0, 10),
      });
    }
  },

  /**
   * Mock DELETE /api/v1/Favorite/{venueId}
   */
  async removeFromFavorites(placeId: string): Promise<void> {
    await delay(300);
    mockFavorites = mockFavorites.filter((f) => f.venue.id !== placeId);
  },

  /**
   * Mock GET /api/v1/Favorite/check/{venueId}
   */
  async checkIsFavorite(placeId: string): Promise<boolean> {
    await delay(200);
    return !!mockFavorites.find((f) => f.venue.id === placeId);
  },
};
