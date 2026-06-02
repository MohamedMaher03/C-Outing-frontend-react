import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { useFavorites } from "@/features/favorites/hooks/useFavorites";
import {
  countInFlightSaves,
  projectFavoriteItemsAsSavedPlaces,
} from "@/features/favorites/utils/favoritesPlaceProjection";
import { resolveFavoritesViewPhase } from "@/features/favorites/utils/favoritesViewPhase";
import { useI18n } from "@/components/i18n";
import { useUserLocation } from "@/features/home/hooks/useUserLocation";
import type { HomePlace } from "@/features/home/types";
import type { FavoritesRefreshOptions } from "@/features/favorites/hooks/useFavorites";
import { getErrorMessage } from "@/utils/apiError";

export const useFavoritesPage = () => {
  const { t, formatNumber } = useI18n();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const userLocation = useUserLocation();
  const [listRefreshInFlight, setListRefreshInFlight] = useState(false);

  const favoritesStore = useFavorites();
  const {
    favorites,
    loading,
    error,
    totalCount,
    savePendingMap,
    actionError,
    toggleSave,
    refreshFavorites,
    clearActionError,
  } = favoritesStore;

  const viewPhase = resolveFavoritesViewPhase(
    loading,
    error,
    favorites.length,
  );
  const savedPlaces: HomePlace[] = projectFavoriteItemsAsSavedPlaces(favorites);
  const inFlightSaveCount = countInFlightSaves(savePendingMap);
  const formattedTotalCount = formatNumber(Math.max(0, totalCount));
  const countLabel = t("favorites.countLabel", { count: formattedTotalCount });

  const liveStatusMessage =
    listRefreshInFlight
      ? t("favorites.live.refreshing")
      : inFlightSaveCount > 0
        ? t("favorites.live.updating", {
            count: formatNumber(inFlightSaveCount),
          })
        : t("favorites.live.upToDate");

  const spinRefreshIcon =
    listRefreshInFlight && !shouldReduceMotion;

  const runListRefresh = useCallback(
    async (options: FavoritesRefreshOptions = {}) => {
      setListRefreshInFlight(true);
      try {
        await refreshFavorites(options);
      } catch (error: unknown) {
        console.error("[useFavoritesPage] Failed to refresh favorites list.", {
          options,
          message: getErrorMessage(
            error,
            "Unable to refresh favorites at this time.",
          ),
          error: error instanceof Error ? error : undefined,
        });
      } finally {
        setListRefreshInFlight(false);
      }
    },
    [refreshFavorites],
  );

  const unsavePlace = useCallback(
    async (venueId: string) => {
      try {
        await toggleSave(venueId);
      } catch (error: unknown) {
        console.error("[useFavoritesPage] Failed to toggle favorite status.", {
          venueId,
          message: getErrorMessage(
            error,
            "Unable to update favorite status right now.",
          ),
          error: error instanceof Error ? error : undefined,
        });
      }
    },
    [toggleSave],
  );

  const openVenueDetail = useCallback(
    (venueId: string) => {
      navigate(`/venue/${venueId}`);
    },
    [navigate],
  );

  const routeToHomeFeed = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return {
    t,
    userLocation,
    viewPhase,
    loadError: error,
    actionError,
    savedPlaces,
    savePendingMap,
    listRefreshInFlight,
    countLabel,
    liveStatusMessage,
    spinRefreshIcon,
    runListRefresh,
    unsavePlace,
    openVenueDetail,
    routeToHomeFeed,
    clearActionError,
  };
};
