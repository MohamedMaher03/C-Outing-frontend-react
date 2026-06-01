import { useCallback, useEffect, useRef, useState } from "react";
import {
  getFavorites,
  toggleFavorite as toggleFavoriteService,
} from "@/features/favorites/services/favoritesService";
import {
  INTERACTION_ACTION_TYPES,
  trackVenueInteractionSafe,
} from "@/features/interactions";
import type { FavoriteItem } from "@/features/favorites/types";
import { normalizePageSize } from "@/features/favorites/utils/favoritesParams";
import { resolveFavoritesFailureMessage } from "@/features/favorites/utils/favoritesErrorMessages";
import { omitRecordKey } from "@/utils/record";

export interface FavoritesRefreshOptions {
  showLoader?: boolean;
  showPageError?: boolean;
}

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
  refreshFavorites: (options?: FavoritesRefreshOptions) => Promise<void>;
  clearActionError: () => void;
}

const DEFAULT_PAGE_SIZE = 10;

const hasNextPageBeyondCurrent = (
  pageIndex: number,
  totalPages: number,
  hasNextPageFlag: boolean,
): boolean =>
  Boolean(hasNextPageFlag) && totalPages > 0 && pageIndex + 1 < totalPages;

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

  const resetPaginationSnapshot = useCallback(() => {
    setPageIndex(0);
    setTotalCount(0);
    setTotalPages(0);
    setHasPreviousPage(false);
    setHasNextPage(false);
  }, []);

  const applyFavoritesPayload = useCallback(
    (items: FavoriteItem[], data: Awaited<ReturnType<typeof getFavorites>>) => {
      setFavorites(items);
      setPageIndex(data.pageIndex);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      setHasPreviousPage(Boolean(data.hasPreviousPage));
      setHasNextPage(
        hasNextPageBeyondCurrent(
          data.pageIndex,
          data.totalPages,
          Boolean(data.hasNextPage),
        ),
      );
    },
    [],
  );

  const fetchFavorites = useCallback(
    async ({
      showLoader = true,
      showPageError = true,
    }: FavoritesRefreshOptions = {}): Promise<void> => {
      const requestId = ++fetchRequestIdRef.current;

      try {
        if (showLoader) setLoading(true);
        if (showPageError) setError(null);

        const data = await getFavorites({
          pageIndex: 0,
          pageSize: normalizePageSize(pageSize),
        });

        if (!mountedRef.current || requestId !== fetchRequestIdRef.current) {
          return;
        }

        applyFavoritesPayload(data.items, data);
      } catch (err) {
        if (!mountedRef.current || requestId !== fetchRequestIdRef.current) {
          return;
        }

        if (showPageError) {
          setError(resolveFavoritesFailureMessage(err, "load"));
          setFavorites([]);
          resetPaginationSnapshot();
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
    [applyFavoritesPayload, pageSize, resetPaginationSnapshot],
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

      if (saveInFlightIds.current.has(placeId)) return;

      try {
        setActionError(null);
        setError(null);
        saveInFlightIds.current.add(placeId);
        setSavePendingMap((prev) => ({ ...prev, [placeId]: true }));

        const savedEntry = favorites.find((item) => item.venue.id === placeId);
        const alreadySaved = Boolean(savedEntry);

        if (alreadySaved) {
          setFavorites((prev) =>
            prev.filter((item) => item.venue.id !== placeId),
          );
          setTotalCount((prev) => Math.max(0, prev - 1));
        }

        await toggleFavoriteService(placeId, alreadySaved);
        void trackVenueInteractionSafe(
          placeId,
          INTERACTION_ACTION_TYPES.favorite,
        );

        if (!alreadySaved) {
          await fetchFavorites({ showLoader: false, showPageError: false });
        }
      } catch (err) {
        setActionError(resolveFavoritesFailureMessage(err, "save"));
        await fetchFavorites({ showLoader: false, showPageError: false });
        throw err;
      } finally {
        saveInFlightIds.current.delete(placeId);
        if (mountedRef.current) {
          setSavePendingMap((prev) => omitRecordKey(prev, placeId));
        }
      }
    },
    [favorites, fetchFavorites],
  );

  const clearActionError = useCallback(() => setActionError(null), []);

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
    refreshFavorites: fetchFavorites,
    clearActionError,
  };
};
