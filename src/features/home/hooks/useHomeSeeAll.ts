import { useEffect, useState } from "react";
import { homeService } from "@/features/home/services/homeService";
import { useUserLocation } from "@/features/home/hooks/useUserLocation";
import type {
  HomePlace,
  HomeRecommendationCollection,
} from "@/features/home/types";
import { getErrorMessage } from "@/utils/apiError";

interface UseHomeSeeAllOptions {
  collection?: string;
}

interface UseHomeSeeAllReturn {
  safeCollection: HomeRecommendationCollection | null;
  places: HomePlace[];
  isLoading: boolean;
  error: string | null;
  count: number;
  setCount: (count: number) => void;
  retryFetch: () => void;
  requestUserLocation: () => void;
  userLocation: ReturnType<typeof useUserLocation>;
}

export const useHomeSeeAll = ({
  collection,
}: UseHomeSeeAllOptions): UseHomeSeeAllReturn => {
  const [places, setPlaces] = useState<HomePlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number>(20);
  const [reloadKey, setReloadKey] = useState(0);
  const userLocation = useUserLocation();

  const safeCollection: HomeRecommendationCollection | null =
    collection === "curated" || collection === "trending" ? collection : null;

  useEffect(() => {
    if (!safeCollection) return;

    let cancelled = false;
    const fetchPlaces = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data =
          safeCollection === "curated"
            ? await homeService.fetchPersonalizedRecommendations({ count })
            : await homeService.fetchTrendingRecommendations({ count });

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
  }, [safeCollection, count, reloadKey]);

  return {
    safeCollection,
    places,
    isLoading,
    error,
    count,
    setCount,
    retryFetch: () => setReloadKey((prev) => prev + 1),
    requestUserLocation: userLocation.requestLocation,
    userLocation,
  };
};
