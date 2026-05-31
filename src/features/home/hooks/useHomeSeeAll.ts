import { useCallback, useEffect, useRef, useState } from "react";
import { homeService } from "@/features/home/services/homeService";
import { useUserLocation } from "@/features/home/hooks/useUserLocation";
import type {
  HomePlace,
  HomeRecommendationCollection,
} from "@/features/home/types";
import { getErrorMessage } from "@/utils/apiError";
import {
  buildToggleSaveHandler,
  patchSavedStateInCollection,
} from "../utils/venueCollectionOps";

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

type CollectionFetcher = () => Promise<HomePlace[]>;

const COLLECTION_FETCHERS: Record<
  Exclude<HomeRecommendationCollection, "mood">,
  (count: number) => CollectionFetcher
> = {
  curated: (count) => () => homeService.fetchPersonalizedRecommendations({ count }),
  trending: (count) => () => homeService.fetchTrendingRecommendations({ count }),
};

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
  const [savePendingMap, setSavePendingMap] = useState<Record<string, boolean>>({});
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
    const resolveCollection = (): CollectionFetcher => {
      if (safeCollection === "mood") {
        const key = moodId ?? "";
        return () => homeService.fetchMoodRecommendations(key, count);
      }
      return COLLECTION_FETCHERS[safeCollection](count);
    };

    const fetchCollectionData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await resolveCollection()();
        if (!cancelled) setPlaces(data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load recommendations"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchCollectionData();
    return () => { cancelled = true; };
  }, [safeCollection, count, reloadKey, moodId]);

  const toggleSave = useCallback(
    buildToggleSaveHandler({
      placeCollections: [places],
      saveInFlightIds,
      setSaveError,
      setSavePendingMap,
      onOptimisticUpdate: (id, nextSaved) =>
        setPlaces((prev) => patchSavedStateInCollection(prev, id, nextSaved)),
      onRollback: (id, prevSaved) =>
        setPlaces((prev) => patchSavedStateInCollection(prev, id, prevSaved)),
      trackInteraction: true,
    }),
    [places],
  );

  const clearSaveError = useCallback(() => setSaveError(null), []);
  const retryFetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    safeCollection,
    places,
    isLoading,
    error,
    saveError,
    clearSaveError,
    count,
    setCount,
    toggleSave,
    savePendingMap,
    retryFetch,
    requestUserLocation: userLocation.requestLocation,
    userLocation,
  };
};
