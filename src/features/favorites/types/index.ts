/**
 * Favorites Feature — Type Definitions
 */

import type { HomePlace } from "@/features/home/types";

/**
 * Backend returns HomePlace items for favorites list endpoints.
 */
export type FavoritePlace = HomePlace;

/** Query params used by GET /api/v1/Favorite */
export interface FavoriteListParams {
  page?: number;
  pageSize?: number;
}
