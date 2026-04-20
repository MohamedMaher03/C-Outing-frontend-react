import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type { PaginatedResponse } from "@/types";
import type { FavoriteItem, FavoriteListParams } from "../types";
import type { FavoritesDataSource } from "../types/dataSource";

export const favoritesApi: FavoritesDataSource = {
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
  async addToFavorites(venueId: string): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.favorites.add, {
      venueId,
    });
  },
  async removeFromFavorites(venueId: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.favorites.remove(venueId));
  },
  async checkIsFavorite(venueId: string): Promise<boolean> {
    const { data } = await axiosInstance.get<boolean>(
      API_ENDPOINTS.favorites.check(venueId),
    );
    return data;
  },
};
