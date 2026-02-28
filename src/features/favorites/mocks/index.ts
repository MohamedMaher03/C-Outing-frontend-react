/**
 * Favorites Feature — Mock Data
 * Simulated favorites storage, replaced by real API later.
 */

import { PLACES } from "@/mocks/mockData";
import type { FavoritePlace } from "../types";

/** Create the initial set of mock favorites */
export const createInitialFavorites = (): FavoritePlace[] =>
  PLACES.slice(0, 3).map((place) => ({
    ...place,
    savedAt: new Date(),
    isSaved: true,
  }));

// Re-export mock API for convenient access
export { favoritesMock } from "./favoritesMock";
