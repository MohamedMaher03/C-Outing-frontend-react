import { useCallback, useEffect, useRef, useState } from "react";
import { homeService } from "@/features/home/services/homeService";
import { useUserLocation } from "@/features/home/hooks/useUserLocation";
import type {
  HomePlace,
  HomeRecommendationCollection,
} from "@/features/home/types";
import {
  INTERACTION_ACTION_TYPES,
  trackVenueInteractionSafe,
} from "@/features/interactions";
import { getErrorMessage } from "@/utils/apiError";

interface UseHomeSeeAllOptions {
  collection?: string;
  moodId?: string;
}

interface UseHomeSeeAllReturn {
  safeCollection: HomeRecommendationCollection | null;
  places: HomePlace[];
  isLoading: boolean;
  error: string | null;
  saveError: string | null;
  clearSaveError: () => void;
  count: number;
  setCount: (count: number) => void;
  toggleSave: (id: string) => Promise<void>;
  savePendingMap: Record<string, boolean>;
  retryFetch: () => void;
  requestUserLocation: () => void;
  userLocation: ReturnType<typeof useUserLocation>;
}

export const useHomeSeeAll = ({
  collection,
  moodId,
}: UseHomeSeeAllOptions): UseHomeSeeAllReturn => {
  const [places, setPlaces] = useState<HomePlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [count, setCount] = useState<number>(20);
  const [reloadKey, setReloadKey] = useState(0);
  const [savePendingMap, setSavePendingMap] = useState<Record<string, boolean>>(
    {},
  );
  const userLocation = useUserLocation();
  const saveInFlightIds = useRef(new Set<string>());

  const safeCollection: HomeRecommendationCollection | null =
    collection === "curated" || collection === "trending"
      ? collection
      : collection === "mood" && moodId
        ? "mood"
        : null;

  useEffect(() => {
    if (!safeCollection) return;
    if (safeCollection === "mood" && !moodId) return;

    let cancelled = false;
    const fetchPlaces = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let data: HomePlace[];

        if (safeCollection === "curated") {
          data = await homeService.fetchPersonalizedRecommendations({ count });
        } else if (safeCollection === "trending") {
          data = await homeService.fetchTrendingRecommendations({ count });
        } else {
          const moodKey = moodId ?? "";
          data = await homeService.fetchMoodRecommendations(moodKey, count);
        }

        if (!cancelled) {
          setPlaces(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load recommendations"));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchPlaces();
    return () => {
      cancelled = true;
    };
  }, [safeCollection, count, reloadKey, moodId]);

  const toggleSave = useCallback(
    async (id: string) => {
      if (saveInFlightIds.current.has(id)) {
        return;
      }

      const place = places.find((item) => item.id === id);
      if (!place) {
        return;
      }

      const nextIsSaved = !place.isSaved;

      try {
        saveInFlightIds.current.add(id);
        setSavePendingMap((prev) => ({ ...prev, [id]: true }));
        setSaveError(null);
        setPlaces((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isSaved: nextIsSaved } : item,
          ),
        );

        await homeService.togglePlaceSave(id, nextIsSaved);
        void trackVenueInteractionSafe(id, INTERACTION_ACTION_TYPES.favorite);
      } catch (toggleError) {
        setPlaces((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isSaved: !nextIsSaved } : item,
          ),
        );
        setSaveError(
          getErrorMessage(toggleError, "Could not update favorites."),
        );
      } finally {
        saveInFlightIds.current.delete(id);
        setSavePendingMap((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    },
    [places],
  );

  return {
    safeCollection,
    places,
    isLoading,
    error,
    saveError,
    clearSaveError: () => setSaveError(null),
    count,
    setCount,
    toggleSave,
    savePendingMap,
    retryFetch: () => setReloadKey((prev) => prev + 1),
    requestUserLocation: userLocation.requestLocation,
    userLocation,
  };
};
