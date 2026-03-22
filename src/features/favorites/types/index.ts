/**
 * Favorites Feature — Type Definitions
 */

import type { HomePlace } from "@/features/home/types";

/**
 * Backend returns HomePlace items for favorites list endpoints.
 */
export type FavoritePlace = HomePlace;

/**
 * One item from GET /api/v1/Favorite.
 * Backend wraps venue details with favorite metadata.
 */
export interface FavoriteItem {
  venue: FavoritePlace;
  createdAt: string;
}

/** Query params used by GET /api/v1/Favorite */
export interface FavoriteListParams {
  /** Zero-based page index used by backend pagination contracts. */
  pageIndex?: number;
  /** Backward-compatible alias used by some existing callers. */
  page?: number;
  pageSize?: number;
}
