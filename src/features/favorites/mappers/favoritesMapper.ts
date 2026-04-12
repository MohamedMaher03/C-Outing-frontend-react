import type { PaginatedResponse } from "@/types";
import type { FavoriteItem } from "../types";
import {
  normalizePageIndex,
  normalizePageSize,
} from "../utils/favoritesParams";

const clampInt = (value: unknown, min: number, max: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.floor(value)));
};

const normalizeFavoriteItems = (items: FavoriteItem[]): FavoriteItem[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  const seenIds = new Set<string>();
  const normalized: FavoriteItem[] = [];

  for (const item of items) {
    const venueId = item?.venue?.id;
    if (typeof venueId !== "string") {
      continue;
    }

    const trimmedVenueId = venueId.trim();
    if (!trimmedVenueId || seenIds.has(trimmedVenueId)) {
      continue;
    }

    seenIds.add(trimmedVenueId);
    normalized.push({
      ...item,
      venue: {
        ...item.venue,
        id: trimmedVenueId,
      },
    });
  }

  return normalized;
};

export const mapFavoritesPage = (
  page: PaginatedResponse<FavoriteItem>,
): PaginatedResponse<FavoriteItem> => {
  const items = normalizeFavoriteItems(page.items);
  const pageSize = normalizePageSize(page.pageSize);
  const totalCount = clampInt(page.totalCount, 0, Number.MAX_SAFE_INTEGER);
  const computedTotalPages =
    totalCount === 0 ? 0 : Math.max(1, Math.ceil(totalCount / pageSize));
  const totalPages = clampInt(page.totalPages, 0, computedTotalPages || 1);
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
