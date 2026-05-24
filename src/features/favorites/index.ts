export { useFavorites } from "./hooks/useFavorites";

export { favoritesApi } from "./api/favoritesApi";
export {
  favoritesService,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  checkIsFavorite,
} from "./services/favoritesService";

export type { FavoritesDataSource } from "./types/dataSource";
export type { FavoriteItem, FavoriteListParams, FavoritePlace } from "./types";

export { favoritesMock } from "./mocks/favoritesMock";
