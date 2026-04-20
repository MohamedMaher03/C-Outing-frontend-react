import type { HomePlace } from "@/features/home/types";
export type FavoritePlace = HomePlace;
export interface FavoriteItem {
  venue: FavoritePlace;
  createdAt: string;
}
export interface FavoriteListParams {
  pageIndex?: number;
  page?: number;
  pageSize?: number;
}
