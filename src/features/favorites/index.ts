/**
 * Favorites Feature — Public API
 */

// Hooks
export { useFavorites } from "./hooks/useFavorites";

// API layer (exposed for advanced usage / testing)
export { favoritesApi } from "./api/favoritesApi";

// Services
export {
  favoritesService,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  checkIsFavorite,
} from "./services/favoritesService";

// Types
export type { FavoriteItem, FavoriteListParams, FavoritePlace } from "./types";

// Mocks (development use)
export { favoritesMock } from "./mocks/favoritesMock";
