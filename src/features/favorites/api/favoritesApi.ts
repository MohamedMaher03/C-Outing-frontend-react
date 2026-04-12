/**
 * Favorites API Layer
 *
 * Pure HTTP functions — no business logic, no side effects, no storage.
 * Each function maps 1-to-1 with a backend endpoint.
 *
 * The shared axios instance (src/config/axios.config.ts) handles:
 *   • Attaching the Authorization header on every request
 *   • Handling 401 responses globally
 */

import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type { PaginatedResponse } from "@/types";
import type { FavoriteItem, FavoriteListParams } from "../types";
import type { FavoritesDataSource } from "../types/dataSource";

export const favoritesApi: FavoritesDataSource = {
  /**
   * GET /api/v1/Favorite?page={page}&pageSize={pageSize}
   * Returns paginated saved venues for the current user.
   */
  async getFavorites(
    params?: FavoriteListParams,
  ): Promise<PaginatedResponse<FavoriteItem>> {
    const page =
      params?.page ??
      (typeof params?.pageIndex === "number"
        ? params.pageIndex + 1
        : undefined);
    const { data } = await axiosInstance.get<PaginatedResponse<FavoriteItem>>(
      API_ENDPOINTS.favorites.getAll,
      {
        params: {
          ...(page !== undefined ? { page } : {}),
          pageSize: params?.pageSize ?? 10,
        },
      },
    );
    return data;
  },

  /**
   * POST /api/v1/Favorite
   * Body: { venueId: string }
   */
  async addToFavorites(venueId: string): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.favorites.add, {
      venueId,
    });
  },

  /**
   * DELETE /api/v1/Favorite/{venueId}
   */
  async removeFromFavorites(venueId: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.favorites.remove(venueId));
  },

  /**
   * GET /api/v1/Favorite/check/{venueId}
   * Returns ApiResponse<boolean> (interceptor unwraps to boolean)
   */
  async checkIsFavorite(venueId: string): Promise<boolean> {
    const { data } = await axiosInstance.get<boolean>(
      API_ENDPOINTS.favorites.check(venueId),
    );
    return data;
  },
};
