/**
 * useFavorites Hook
 * Manages favorites page state and actions
 */

import { useState, useEffect } from "react";
import {
  getFavorites,
  toggleFavorite as toggleFavoriteService,
} from "@/features/favorites/services/favoritesService";
import type { FavoritePlace } from "@/features/favorites/types";
import { getErrorMessage } from "@/utils/apiError";

interface UseFavoritesReturn {
  // State
  favorites: FavoritePlace[];
  loading: boolean;
  error: string | null;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;

  // Actions
  toggleSave: (placeId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

export const useFavorites = (): UseFavoritesReturn => {
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Fetch favorites on mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getFavorites({ page: 1, pageSize });
      setFavorites(data.items);
      setPageIndex(data.pageIndex);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      setHasPreviousPage(data.hasPreviousPage);
      setHasNextPage(data.hasNextPage);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load favorites"));
      console.error("Error fetching favorites:", err);
      setFavorites([]);
      setPageIndex(1);
      setTotalCount(0);
      setTotalPages(0);
      setHasPreviousPage(false);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (placeId: string) => {
    try {
      const currentPlace = favorites.find((p) => p.id === placeId);
      const isFavorite = !!currentPlace;

      // Optimistic update
      if (isFavorite) {
        setFavorites((prev) => prev.filter((p) => p.id !== placeId));
      }

      // Call API
      await toggleFavoriteService(placeId, isFavorite);

      // If API fails, the error will be caught and state will be reverted
    } catch (err) {
      console.error("Error toggling favorite:", err);
      // Revert optimistic update on error
      await fetchFavorites();
      throw err;
    }
  };

  const refreshFavorites = async () => {
    await fetchFavorites();
  };

  return {
    favorites,
    loading,
    error,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    toggleSave,
    refreshFavorites,
  };
};
