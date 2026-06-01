import type { FavoriteItem } from "@/features/favorites/types";
import type { HomePlace } from "@/features/home/types";

export const projectFavoriteItemsAsSavedPlaces = (
  favorites: readonly FavoriteItem[],
): HomePlace[] =>
  favorites.map(({ venue }) => ({ ...venue, isSaved: true }));

export const countInFlightSaves = (
  savePendingMap: Readonly<Record<string, boolean>>,
): number => Object.keys(savePendingMap).length;
