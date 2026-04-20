import type { FavoritesDataSource } from "../types/dataSource";
import { favoritesApi } from "../api/favoritesApi";
import { favoritesMock } from "../mocks";
import { selectDataSource } from "@/utils/dataSourceResolver";

export type { FavoritesDataSource } from "../types/dataSource";

export const favoritesDataSource: FavoritesDataSource = selectDataSource(
  import.meta.env.VITE_FAVORITES_USE_MOCKS,
  favoritesMock,
  favoritesApi,
);
