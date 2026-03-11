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

  // Actions
  toggleSave: (placeId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

export const useFavorites = (): UseFavoritesReturn => {
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch favorites on mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getFavorites();
      setFavorites(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load favorites"));
      console.error("Error fetching favorites:", err);
      setFavorites([]);
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
    toggleSave,
    refreshFavorites,
  };
};
