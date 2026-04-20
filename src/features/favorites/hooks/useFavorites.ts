import { useCallback, useEffect, useRef, useState } from "react";
import {
  getFavorites,
  toggleFavorite as toggleFavoriteService,
} from "@/features/favorites/services/favoritesService";
import type { FavoriteItem } from "@/features/favorites/types";
import { normalizePageSize } from "@/features/favorites/utils/favoritesParams";
import { getErrorMessage, isApiError } from "@/utils/apiError";

interface UseFavoritesReturn {
  favorites: FavoriteItem[];
  loading: boolean;
  error: string | null;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  savePendingMap: Record<string, boolean>;
  actionError: string | null;
  toggleSave: (placeId: string) => Promise<void>;
  refreshFavorites: (options?: {
    showLoader?: boolean;
    showPageError?: boolean;
  }) => Promise<void>;
  clearActionError: () => void;
}

const DEFAULT_PAGE_SIZE = 10;

const toFriendlyErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "You are offline. Reconnect and try again.";
  }

  if (isApiError(error)) {
    if (error.statusCode === 401) {
      return "Your session expired. Sign in again to view saved places.";
    }
    if (error.statusCode === 403) {
      return "This account cannot access saved places.";
    }
    if (error.statusCode === 404) {
      return "Saved places are unavailable right now. Please try again soon.";
    }
    if (error.statusCode === 429) {
      return "Too many requests. Please wait a few seconds and retry.";
    }
    if (typeof error.statusCode === "number" && error.statusCode >= 500) {
      return "We are having trouble loading saved places. Please try again shortly.";
    }
  }

  return getErrorMessage(error, fallback);
};

export const useFavorites = (): UseFavoritesReturn => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = DEFAULT_PAGE_SIZE;
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [savePendingMap, setSavePendingMap] = useState<Record<string, boolean>>(
    {},
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const fetchRequestIdRef = useRef(0);
  const saveInFlightIds = useRef(new Set<string>());

  const fetchFavorites = useCallback(
    async ({
      showLoader = true,
      showPageError = true,
    }: {
      showLoader?: boolean;
      showPageError?: boolean;
    } = {}): Promise<void> => {
      const requestId = ++fetchRequestIdRef.current;

      try {
        if (showLoader) {
          setLoading(true);
        }

        if (showPageError) {
          setError(null);
        }

        const data = await getFavorites({
          pageIndex: 0,
          pageSize: normalizePageSize(pageSize),
        });

        if (!mountedRef.current || requestId !== fetchRequestIdRef.current) {
          return;
        }

        setFavorites(data.items);
        setPageIndex(data.pageIndex);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
        setHasPreviousPage(Boolean(data.hasPreviousPage));
        setHasNextPage(
          Boolean(data.hasNextPage) &&
            data.totalPages > 0 &&
            data.pageIndex + 1 < data.totalPages,
        );
      } catch (err) {
        if (!mountedRef.current || requestId !== fetchRequestIdRef.current) {
          return;
        }

        if (showPageError) {
          setError(
            toFriendlyErrorMessage(err, "We could not load your saved places."),
          );
          setFavorites([]);
          setPageIndex(0);
          setTotalCount(0);
          setTotalPages(0);
          setHasPreviousPage(false);
          setHasNextPage(false);
        }
      } finally {
        if (
          mountedRef.current &&
          requestId === fetchRequestIdRef.current &&
          showLoader
        ) {
          setLoading(false);
        }
      }
    },
    [pageSize],
  );

  useEffect(() => {
    mountedRef.current = true;
    void fetchFavorites();

    return () => {
      mountedRef.current = false;
      fetchRequestIdRef.current += 1;
    };
  }, [fetchFavorites]);

  const toggleSave = useCallback(
    async (rawPlaceId: string) => {
      const placeId = rawPlaceId.trim();

      if (!placeId) {
        const message =
          "We could not update this save because the place could not be identified.";
        setActionError(message);
        throw new Error(message);
      }

      if (saveInFlightIds.current.has(placeId)) {
        return;
      }

      try {
        setActionError(null);
        setError(null);
        saveInFlightIds.current.add(placeId);
        setSavePendingMap((prev) => ({ ...prev, [placeId]: true }));

        const currentPlace = favorites.find(
          (item) => item.venue.id === placeId,
        );
        const isFavorite = !!currentPlace;

        if (isFavorite) {
          setFavorites((prev) =>
            prev.filter((item) => item.venue.id !== placeId),
          );
          setTotalCount((prev) => Math.max(0, prev - 1));
        }

        await toggleFavoriteService(placeId, isFavorite);

        // Removing is optimistic; adding back refetches full venue payload.
        if (!isFavorite) {
          await fetchFavorites({ showLoader: false, showPageError: false });
        }
      } catch (err) {
        setActionError(
          toFriendlyErrorMessage(err, "We could not update your saved places."),
        );
        await fetchFavorites({ showLoader: false, showPageError: false });
        throw err;
      } finally {
        saveInFlightIds.current.delete(placeId);
        if (mountedRef.current) {
          setSavePendingMap((prev) => {
            const next = { ...prev };
            delete next[placeId];
            return next;
          });
        }
      }
    },
    [favorites, fetchFavorites],
  );

  const refreshFavorites = fetchFavorites;
  const clearActionError = () => setActionError(null);

  return {
    favorites,
    loading,
    error,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    savePendingMap,
    actionError,
    toggleSave,
    refreshFavorites,
    clearActionError,
  };
};
