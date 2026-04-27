import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  CATEGORIES,
  MOOD_OPTIONS,
  TRENDING_TAGS,
  POPULAR_DISTRICTS,
} from "@/mocks/mockData";
import { homeService } from "@/features/home/services/homeService";
import type {
  DiscoverySource,
  FilterType,
  HomePlace,
  UserLocationState,
  VenuePriceRange,
} from "@/features/home/types";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  INTERACTION_ACTION_TYPES,
  trackVenueInteractionSafe,
} from "@/features/interactions";
import { getErrorMessage } from "@/utils/apiError";
import { useUserLocation } from "@/features/home/hooks/useUserLocation";
import { calculateDistanceKm } from "@/features/home/utils/distance";

interface UseHomeReturn {
  search: string;
  selectedFilters: FilterType[];
  selectedMood: string | null;
  isLoading: boolean;
  error: string | null;
  selectedSimilarSeedId: string | null;
  similarSeedPlaces: HomePlace[];
  similarPlaces: HomePlace[];
  isSimilarLoading: boolean;
  similarError: string | null;
  saveError: string | null;
  selectedDistrict: string | null;
  selectedVenueType: string | null;
  selectedPriceRange: VenuePriceRange | null;
  selectedArea: string;
  activeDiscoverySource: DiscoverySource;
  discoveryPlaces: HomePlace[];
  discoveryError: string | null;
  isDiscoveryLoading: boolean;
  globalTopRatedVenues: HomePlace[];
  topRatedInAreaVenues: HomePlace[];
  isGlobalTopRatedLoading: boolean;
  isTopRatedInAreaLoading: boolean;
  topRatedInAreaError: string | null;
  curatedPlaces: HomePlace[];
  trendingPlaces: HomePlace[];
  moodPlaces: HomePlace[];
  isMoodLoading: boolean;
  moodError: string | null;
  userLocation: UserLocationState;
  categories: typeof CATEGORIES;
  moodOptions: typeof MOOD_OPTIONS;
  trendingTags: typeof TRENDING_TAGS;
  popularDistricts: typeof POPULAR_DISTRICTS;
  setSearch: (search: string) => void;
  toggleFilter: (filter: FilterType) => void;
  setSelectedMood: (mood: string | null) => void;
  setSelectedDistrict: (district: string | null) => void;
  setSelectedVenueType: (type: string | null) => void;
  setSelectedPriceRange: (priceRange: VenuePriceRange | null) => void;
  setSelectedArea: (area: string) => void;
  setActiveDiscoverySource: (source: DiscoverySource) => void;
  selectPlaceForSimilar: (placeId: string | null) => void;
  requestUserLocation: () => void;
  toggleSave: (id: string) => void;
  retryDiscovery: () => void;
  retrySimilar: () => void;
  retryMood: () => void;
  clearSaveError: () => void;
  isPlaceSavePending: (id: string) => boolean;
  reloadPlaces: () => Promise<void>;
}

export const useHome = (): UseHomeReturn => {
  const { user } = useAuth();
  const userLocation = useUserLocation();
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moodPlaces, setMoodPlaces] = useState<HomePlace[]>([]);
  const [isMoodLoading, setIsMoodLoading] = useState(false);
  const [moodError, setMoodError] = useState<string | null>(null);
  const [selectedSimilarSeedId, setSelectedSimilarSeedId] = useState<
    string | null
  >(null);
  const [similarSeedPlaces, setSimilarSeedPlaces] = useState<HomePlace[]>([]);
  const [similarPlaces, setSimilarPlaces] = useState<HomePlace[]>([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [similarReloadKey, setSimilarReloadKey] = useState(0);
  const [moodReloadKey, setMoodReloadKey] = useState(0);
  const [savePendingMap, setSavePendingMap] = useState<Record<string, boolean>>(
    {},
  );

  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedVenueType, setSelectedVenueType] = useState<string | null>(
    null,
  );
  const [selectedPriceRange, setSelectedPriceRange] =
    useState<VenuePriceRange | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>(
    POPULAR_DISTRICTS[0]?.name ?? "Cairo",
  );
  const [activeDiscoverySource, setActiveDiscoverySource] =
    useState<DiscoverySource>("top-rated");
  const [discoveryPlaces, setDiscoveryPlaces] = useState<HomePlace[]>([]);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [isDiscoveryLoading, setIsDiscoveryLoading] = useState(false);
  const [globalTopRatedVenues, setGlobalTopRatedVenues] = useState<HomePlace[]>(
    [],
  );
  const [topRatedInAreaVenues, setTopRatedInAreaVenues] = useState<HomePlace[]>(
    [],
  );
  const [isGlobalTopRatedLoading, setIsGlobalTopRatedLoading] = useState(false);
  const [isTopRatedInAreaLoading, setIsTopRatedInAreaLoading] = useState(false);
  const [topRatedInAreaError, setTopRatedInAreaError] = useState<string | null>(
    null,
  );
  const [discoveryReloadKey, setDiscoveryReloadKey] = useState(0);
  const saveInFlightIds = useRef<Set<string>>(new Set());

  const [rawCurated, setRawCurated] = useState<HomePlace[]>([]);
  const [rawTrending, setRawTrending] = useState<HomePlace[]>([]);

  const loadPlaces = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const [homeData, personalizedSeedPool, trendingSeedPool] =
        await Promise.all([
          homeService.fetchHomePageData({ count: 10 }),
          homeService.fetchPersonalizedRecommendations({ count: 50 }),
          homeService.fetchTrendingRecommendations({ count: 50 }),
        ]);
      const { curatedPlaces, trendingPlaces } = homeData;
      setRawCurated(curatedPlaces);
      setRawTrending(trendingPlaces);
      const combinedSeedPool = [...personalizedSeedPool, ...trendingSeedPool]
        .filter(
          (place, index, arr) =>
            arr.findIndex((candidate) => candidate.id === place.id) === index,
        )
        .slice(0, 60);
      setSimilarSeedPlaces(combinedSeedPool);

      if (combinedSeedPool.length > 0) {
        setSelectedSimilarSeedId((prev) => prev ?? combinedSeedPool[0].id);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load places"));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  useEffect(() => {
    if (!selectedSimilarSeedId) {
      setSimilarPlaces([]);
      setSimilarError(null);
      return;
    }

    let cancelled = false;
    const fetchSimilarPlaces = async () => {
      setIsSimilarLoading(true);
      setSimilarError(null);
      try {
        const places = await homeService.fetchSimilarRecommendations({
          venueId: selectedSimilarSeedId,
          count: 8,
        });
        if (!cancelled) setSimilarPlaces(places);
      } catch (err) {
        if (!cancelled) {
          setSimilarError(
            getErrorMessage(err, "Failed to load similar recommendations"),
          );
        }
      } finally {
        if (!cancelled) setIsSimilarLoading(false);
      }
    };

    fetchSimilarPlaces();
    return () => {
      cancelled = true;
    };
  }, [selectedSimilarSeedId, similarReloadKey]);

  useEffect(() => {
    if (!selectedMood) {
      setMoodPlaces([]);
      setMoodError(null);
      return;
    }
    let cancelled = false;
    const fetchMoodPlaces = async () => {
      setIsMoodLoading(true);
      setMoodError(null);
      try {
        const places = await homeService.fetchPlacesByMood(selectedMood);
        if (!cancelled) setMoodPlaces(places);
      } catch (err) {
        if (!cancelled) {
          setMoodPlaces([]);
          setMoodError(getErrorMessage(err, "Failed to load mood picks"));
        }
      } finally {
        if (!cancelled) setIsMoodLoading(false);
      }
    };
    fetchMoodPlaces();
    return () => {
      cancelled = true;
    };
  }, [selectedMood, moodReloadKey]);

  useEffect(() => {
    let cancelled = false;
    const fetchTopRated = async () => {
      setIsGlobalTopRatedLoading(true);
      try {
        const places = await homeService.fetchVenueTopRated();
        if (!cancelled) {
          setGlobalTopRatedVenues(places);
          if (activeDiscoverySource === "top-rated") {
            setDiscoveryPlaces(places);
            setDiscoveryError(null);
          }
        }
      } catch (err) {
        if (!cancelled && activeDiscoverySource === "top-rated") {
          setDiscoveryError(
            getErrorMessage(err, "Failed to load top-rated venues"),
          );
        }
      } finally {
        if (!cancelled) setIsGlobalTopRatedLoading(false);
      }
    };
    fetchTopRated();
    return () => {
      cancelled = true;
    };
  }, [activeDiscoverySource, discoveryReloadKey]);

  useEffect(() => {
    if (activeDiscoverySource !== "district") return;
    if (!selectedDistrict) {
      setDiscoveryPlaces([]);
      setDiscoveryError(null);
      return;
    }

    let cancelled = false;
    const fetchByDistrict = async () => {
      setIsDiscoveryLoading(true);
      setDiscoveryError(null);
      try {
        const places = await homeService.fetchVenuesByDistrict({
          district: selectedDistrict,
        });
        if (!cancelled) setDiscoveryPlaces(places);
      } catch (err) {
        if (!cancelled) {
          setDiscoveryError(
            getErrorMessage(err, "Failed to load district venues"),
          );
        }
      } finally {
        if (!cancelled) setIsDiscoveryLoading(false);
      }
    };
    fetchByDistrict();
    return () => {
      cancelled = true;
    };
  }, [selectedDistrict, activeDiscoverySource, discoveryReloadKey]);

  useEffect(() => {
    if (activeDiscoverySource !== "type") return;
    if (!selectedVenueType) {
      setDiscoveryPlaces([]);
      setDiscoveryError(null);
      return;
    }

    let cancelled = false;
    const fetchByType = async () => {
      setIsDiscoveryLoading(true);
      setDiscoveryError(null);
      try {
        const places = await homeService.fetchVenuesByType({
          type: selectedVenueType,
        });
        if (!cancelled) setDiscoveryPlaces(places);
      } catch (err) {
        if (!cancelled) {
          setDiscoveryError(getErrorMessage(err, "Failed to load venue types"));
        }
      } finally {
        if (!cancelled) setIsDiscoveryLoading(false);
      }
    };
    fetchByType();
    return () => {
      cancelled = true;
    };
  }, [selectedVenueType, activeDiscoverySource, discoveryReloadKey]);

  useEffect(() => {
    if (activeDiscoverySource !== "price-range") return;
    if (!selectedPriceRange) {
      setDiscoveryPlaces([]);
      setDiscoveryError(null);
      return;
    }

    let cancelled = false;
    const fetchByPriceRange = async () => {
      setIsDiscoveryLoading(true);
      setDiscoveryError(null);
      try {
        const places = await homeService.fetchVenuesByPriceRange({
          priceRange: selectedPriceRange,
        });
        if (!cancelled) setDiscoveryPlaces(places);
      } catch (err) {
        if (!cancelled) {
          setDiscoveryError(
            getErrorMessage(err, "Failed to load venues for this budget"),
          );
        }
      } finally {
        if (!cancelled) setIsDiscoveryLoading(false);
      }
    };
    fetchByPriceRange();
    return () => {
      cancelled = true;
    };
  }, [selectedPriceRange, activeDiscoverySource, discoveryReloadKey]);

  useEffect(() => {
    if (!selectedArea) return;
    let cancelled = false;
    const fetchTopRatedInArea = async () => {
      setIsTopRatedInAreaLoading(true);
      setTopRatedInAreaError(null);
      try {
        const places = await homeService.fetchVenueTopRatedInArea({
          area: selectedArea,
        });
        if (!cancelled) {
          setTopRatedInAreaVenues(places);
          if (activeDiscoverySource === "top-rated-area") {
            setDiscoveryPlaces(places);
            setDiscoveryError(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message = getErrorMessage(
            err,
            "Failed to load top-rated venues in area",
          );
          setTopRatedInAreaError(message);
          if (activeDiscoverySource === "top-rated-area") {
            setDiscoveryError(message);
          }
        }
      } finally {
        if (!cancelled) setIsTopRatedInAreaLoading(false);
      }
    };
    fetchTopRatedInArea();
    return () => {
      cancelled = true;
    };
  }, [selectedArea, activeDiscoverySource, discoveryReloadKey]);

  useEffect(() => {
    if (activeDiscoverySource === "top-rated") {
      setDiscoveryPlaces(globalTopRatedVenues);
      setDiscoveryError(null);
      return;
    }
    if (activeDiscoverySource === "top-rated-area") {
      setDiscoveryPlaces(topRatedInAreaVenues);
      setDiscoveryError(topRatedInAreaError);
    }
  }, [
    activeDiscoverySource,
    globalTopRatedVenues,
    topRatedInAreaVenues,
    topRatedInAreaError,
  ]);

  const toggleFilter = useCallback((filter: FilterType) => {
    if (filter === "all") {
      setSelectedFilters([]);
    } else {
      setSelectedFilters((prev) =>
        prev.includes(filter)
          ? prev.filter((f) => f !== filter)
          : [...prev, filter],
      );
    }
  }, []);

  const toggleSave = useCallback(
    async (id: string) => {
      if (saveInFlightIds.current.has(id)) {
        return;
      }

      try {
        setSaveError(null);
        saveInFlightIds.current.add(id);
        setSavePendingMap((prev) => ({ ...prev, [id]: true }));
        const place =
          rawCurated.find((p) => p.id === id) ||
          rawTrending.find((p) => p.id === id);

        if (!place) return;

        await homeService.togglePlaceSave(id, !place.isSaved);

        const toggle = (list: HomePlace[]) =>
          list.map((p) => (p.id === id ? { ...p, isSaved: !p.isSaved } : p));

        setRawCurated((prev) => toggle(prev));
        setRawTrending((prev) => toggle(prev));

        setDiscoveryPlaces((prev) => toggle(prev));
        setGlobalTopRatedVenues((prev) => toggle(prev));
        setTopRatedInAreaVenues((prev) => toggle(prev));
        setMoodPlaces((prev) => toggle(prev));
        setSimilarSeedPlaces((prev) => toggle(prev));
        setSimilarPlaces((prev) => toggle(prev));
        void trackVenueInteractionSafe(id, INTERACTION_ACTION_TYPES.favorite);
      } catch (toggleError) {
        setSaveError(
          getErrorMessage(toggleError, "Could not update favorites right now."),
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
    [rawCurated, rawTrending],
  );

  const applyFilters = useCallback(
    (list: HomePlace[]): HomePlace[] => {
      let result = [...list];

      if (search) {
        const q = search.toLowerCase();
        const toSafeLower = (value: unknown) =>
          typeof value === "string" ? value.toLowerCase() : "";
        result = result.filter(
          (p) =>
            toSafeLower(p.name).includes(q) ||
            toSafeLower(p.address).includes(q) ||
            toSafeLower(p.category).includes(q) ||
            (p.atmosphereTags ?? []).some((t) => toSafeLower(t).includes(q)),
        );
      }

      if (selectedFilters.includes("open-now")) {
        result = result.filter((p) => p.isOpen === true);
      }
      if (selectedFilters.includes("saved")) {
        result = result.filter((p) => p.isSaved === true);
      }
      if (selectedFilters.includes("has-wifi")) {
        result = result.filter((p) => p.hasWifi === true);
      }
      if (selectedFilters.includes("near-me")) {
        if (userLocation.status === "granted" && userLocation.coordinates) {
          const { latitude, longitude } = userLocation.coordinates;
          const getPlaceDistance = (place: HomePlace) => {
            if (
              !Number.isFinite(place.latitude) ||
              !Number.isFinite(place.longitude)
            ) {
              return Number.POSITIVE_INFINITY;
            }

            return calculateDistanceKm(
              latitude,
              longitude,
              place.latitude,
              place.longitude,
            );
          };

          result = result.sort((a, b) => {
            const distA = getPlaceDistance(a);
            const distB = getPlaceDistance(b);
            return distA - distB;
          });
        }
      }

      return result;
    },
    [search, selectedFilters, userLocation],
  );

  const curatedPlaces = useMemo(
    () => applyFilters(rawCurated),
    [rawCurated, applyFilters],
  );
  const trendingPlaces = useMemo(
    () => applyFilters(rawTrending),
    [rawTrending, applyFilters],
  );
  const filteredDiscoveryPlaces = useMemo(
    () => applyFilters(discoveryPlaces),
    [discoveryPlaces, applyFilters],
  );

  const retryDiscovery = useCallback(() => {
    setDiscoveryReloadKey((prev) => prev + 1);
  }, []);

  const retrySimilar = useCallback(() => {
    setSimilarReloadKey((prev) => prev + 1);
  }, []);

  const retryMood = useCallback(() => {
    setMoodReloadKey((prev) => prev + 1);
  }, []);

  const isPlaceSavePending = useCallback(
    (id: string) => Boolean(savePendingMap[id]),
    [savePendingMap],
  );

  const clearSaveError = useCallback(() => {
    setSaveError(null);
  }, []);

  return {
    search,
    selectedFilters,
    selectedMood,
    isLoading,
    error,
    selectedSimilarSeedId,
    similarSeedPlaces,
    similarPlaces,
    isSimilarLoading,
    similarError,
    saveError,

    selectedDistrict,
    selectedVenueType,
    selectedPriceRange,
    selectedArea,
    activeDiscoverySource,
    discoveryPlaces: filteredDiscoveryPlaces,
    discoveryError,
    isDiscoveryLoading,
    globalTopRatedVenues,
    topRatedInAreaVenues,
    isGlobalTopRatedLoading,
    isTopRatedInAreaLoading,
    topRatedInAreaError,

    curatedPlaces,
    trendingPlaces,
    moodPlaces,
    isMoodLoading,
    moodError,
    userLocation,

    categories: CATEGORIES,
    moodOptions: MOOD_OPTIONS,
    trendingTags: TRENDING_TAGS,
    popularDistricts: POPULAR_DISTRICTS,

    setSearch,
    toggleFilter,
    setSelectedMood,
    setSelectedDistrict,
    setSelectedVenueType,
    setSelectedPriceRange,
    setSelectedArea,
    setActiveDiscoverySource,
    selectPlaceForSimilar: setSelectedSimilarSeedId,
    requestUserLocation: userLocation.requestLocation,
    toggleSave,
    retryDiscovery,
    retrySimilar,
    retryMood,
    clearSaveError,
    isPlaceSavePending,
    reloadPlaces: loadPlaces,
  };
};
