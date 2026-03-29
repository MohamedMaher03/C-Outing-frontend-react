import type { FavoritesDataSource } from "../types/dataSource";
import { favoritesApi } from "../api/favoritesApi";
import { favoritesMock } from "../mocks";

export type { FavoritesDataSource } from "../types/dataSource";

const shouldUseMocks = import.meta.env.VITE_USE_MOCKS === "true";

// API is the default source to keep production behavior explicit.
export const favoritesDataSource: FavoritesDataSource = shouldUseMocks
  ? favoritesMock
  : favoritesApi;
