import type { FavoriteListParams } from "@/features/favorites/types";

export const normalizePlaceId = (placeId: string): string => {
  const normalized = placeId.trim();
  if (!normalized) {
    throw new Error("Place identifier is required.");
  }
  return normalized;
};

export const normalizePageSize = (
  value: FavoriteListParams["pageSize"],
): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 10;
  }

  return Math.min(50, Math.max(1, Math.floor(value)));
};

export const normalizePageIndex = (
  value: FavoriteListParams["pageIndex"],
): number | undefined => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.max(0, Math.floor(value));
};

export const normalizePageNumber = (
  value: FavoriteListParams["page"],
): number | undefined => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.max(1, Math.floor(value));
};
