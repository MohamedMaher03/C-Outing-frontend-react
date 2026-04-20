import type { PaginatedResponse } from "@/types";
import type {
  FavoriteItem,
  FavoriteListParams,
} from "@/features/favorites/types";
import { mapFavoritesPage } from "../mappers/favoritesMapper";
import {
  normalizePageIndex,
  normalizePageNumber,
  normalizePageSize,
  normalizePlaceId,
} from "../utils/favoritesParams";
import { favoritesDataSource } from "./favoritesDataSource";

export const getFavorites = async (
  params?: FavoriteListParams,
): Promise<PaginatedResponse<FavoriteItem>> => {
  const response = await favoritesDataSource.getFavorites({
    pageIndex: normalizePageIndex(params?.pageIndex),
    page: normalizePageNumber(params?.page),
    pageSize: normalizePageSize(params?.pageSize),
  });

  return mapFavoritesPage(response);
};

export const addToFavorites = async (placeId: string): Promise<void> => {
  await favoritesDataSource.addToFavorites(normalizePlaceId(placeId));
};

export const removeFromFavorites = async (placeId: string): Promise<void> => {
  await favoritesDataSource.removeFromFavorites(normalizePlaceId(placeId));
};

export const toggleFavorite = async (
  placeId: string,
  isFavorite: boolean,
): Promise<void> => {
  const normalizedPlaceId = normalizePlaceId(placeId);

  if (isFavorite) {
    await favoritesDataSource.removeFromFavorites(normalizedPlaceId);
  } else {
    await favoritesDataSource.addToFavorites(normalizedPlaceId);
  }
};

export const checkIsFavorite = async (placeId: string): Promise<boolean> => {
  return favoritesDataSource.checkIsFavorite(normalizePlaceId(placeId));
};

export const favoritesService = {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  checkIsFavorite,
};
