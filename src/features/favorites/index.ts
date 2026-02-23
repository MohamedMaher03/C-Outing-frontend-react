/**
 * Favorites Feature — Public API
 */
export { useFavorites } from "./hooks/useFavorites";
export {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  checkIsFavorite,
} from "./services/favoritesService";
export type { FavoritePlace, ToggleFavoriteResponse } from "./types";
