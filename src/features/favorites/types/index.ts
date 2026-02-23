/**
 * Favorites Feature — Type Definitions
 */

import type { Place } from "@/mocks/mockData";

/** A place that has been saved/favorited by the user */
export interface FavoritePlace extends Place {
  savedAt: Date;
}

/** Response shape from toggling a favorite */
export interface ToggleFavoriteResponse {
  success: boolean;
  isFavorite: boolean;
  message?: string;
}
