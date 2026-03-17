import {
  toggleFavorite as toggleFavoriteInFavoritesFeature,
  checkIsFavorite as checkIsFavoriteInFavoritesFeature,
} from "@/features/favorites/services/favoritesService";

export const favoriteAdapter = {
  isFavorite(placeId: string): Promise<boolean> {
    return checkIsFavoriteInFavoritesFeature(placeId);
  },

  toggle(placeId: string, isCurrentlyFavorite: boolean): Promise<void> {
    return toggleFavoriteInFavoritesFeature(placeId, isCurrentlyFavorite);
  },
};
