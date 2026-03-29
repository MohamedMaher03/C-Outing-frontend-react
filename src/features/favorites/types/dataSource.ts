import type { PaginatedResponse } from "@/types";
import type { FavoriteItem, FavoriteListParams } from "./index";

export interface FavoritesDataSource {
  getFavorites: (
    params?: FavoriteListParams,
  ) => Promise<PaginatedResponse<FavoriteItem>>;
  addToFavorites: (venueId: string) => Promise<void>;
  removeFromFavorites: (venueId: string) => Promise<void>;
  checkIsFavorite: (venueId: string) => Promise<boolean>;
}
