import type { PaginatedResponse } from "@/types";
import type { FavoriteItem } from "../types";
import { clampInteger, dedupeByKey } from "@/utils/mapper";
import {
  normalizePageIndex,
  normalizePageSize,
} from "../utils/favoritesParams";

const dedupeFavoriteItems = (items: FavoriteItem[]): FavoriteItem[] =>
  dedupeByKey(items, (item) => {
    const venueId = item?.venue?.id;
    return typeof venueId === "string" ? venueId.trim() : undefined;
  }).map((item) => ({
    ...item,
    venue: {
      ...item.venue,
      id: item.venue.id.trim(),
    },
  }));

export const mapFavoritesPage = (
  page: PaginatedResponse<FavoriteItem>,
): PaginatedResponse<FavoriteItem> => {
  const items = dedupeFavoriteItems(page.items);
  const pageSize = normalizePageSize(page.pageSize);
  const totalCount = clampInteger(page.totalCount, 0, Number.MAX_SAFE_INTEGER);
  const computedTotalPages =
    totalCount === 0 ? 0 : Math.max(1, Math.ceil(totalCount / pageSize));
  const totalPages = clampInteger(page.totalPages, 0, computedTotalPages || 1);
  const pageIndex =
    totalPages === 0 ? 0 : (normalizePageIndex(page.pageIndex) ?? 0);
  const normalizedPageIndex =
    totalPages === 0 ? 0 : Math.min(pageIndex, totalPages - 1);

  return {
    items,
    pageIndex: normalizedPageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage:
      Boolean(page.hasPreviousPage) &&
      normalizedPageIndex > 0 &&
      totalPages > 0,
    hasNextPage:
      Boolean(page.hasNextPage) && normalizedPageIndex + 1 < totalPages,
  };
};
