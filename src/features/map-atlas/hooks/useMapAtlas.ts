import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CATEGORIES, MOOD_OPTIONS, POPULAR_DISTRICTS } from "@/mocks/mockData";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useUserLocation } from "@/features/home/hooks/useUserLocation";
import { calculateDistanceKm } from "@/features/home/utils/distance";
import type {
  DiscoverySource,
  FilterType,
  HomePlace,
  UserLocationState,
  VenuePriceRange,
} from "@/features/home/types";
import {
  INTERACTION_ACTION_TYPES,
  trackVenueInteractionSafe,
} from "@/features/interactions";
import { getErrorMessage, isApiError } from "@/utils/apiError";
import { mapAtlasService } from "@/features/map-atlas/services/mapAtlasService";

interface UseMapAtlasReturn {
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

  curatedPlaces: HomePlace[];
  trendingPlaces: HomePlace[];
  moodPlaces: HomePlace[];
  isMoodLoading: boolean;
  moodError: string | null;
  userLocation: UserLocationState;

  categories: typeof CATEGORIES;
  moodOptions: typeof MOOD_OPTIONS;
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
  toggleSave: (id: string) => Promise<void>;
  retryDiscovery: () => void;
  retrySimilar: () => void;
  retryMood: () => void;
  clearSaveError: () => void;
  isPlaceSavePending: (id: string) => boolean;
  reloadPlaces: () => Promise<void>;
}

const toFriendlyErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "You are offline. Reconnect and retry.";
  }

  if (isApiError(error)) {
    if (error.statusCode === 401) {
      return "Your session expired. Sign in again and retry.";
    }

    if (error.statusCode === 403) {
      return "Your account does not have access to this map data.";
    }

    if (error.statusCode === 404) {
      return "Requested map data was not found.";
    }

    if (error.statusCode === 429) {
      return "Too many requests. Please wait a moment and retry.";
    }

    if (
      error.statusCode === 408 ||
      error.statusCode === 504 ||
      (typeof error.statusCode === "number" && error.statusCode >= 500)
    ) {
      return "Server timeout while loading map data. Please try again shortly.";
    }
  }

  return getErrorMessage(error, fallback);
};

const dedupePlacesById = (places: HomePlace[]): HomePlace[] => {
  const seen = new Set<string>();
  const deduped: HomePlace[] = [];

  for (const place of places) {
    const id = typeof place?.id === "string" ? place.id.trim() : "";
    if (!id || seen.has(id)) {
      continue;
    }

    seen.add(id);
    deduped.push(place);
  }

  return deduped;
};

export const useMapAtlas = (): UseMapAtlasReturn => {
  const { user } = useAuth();
  const userLocation = useUserLocation();
  const mountedRef = useRef(true);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rawCurated, setRawCurated] = useState<HomePlace[]>([]);
  const [rawTrending, setRawTrending] = useState<HomePlace[]>([]);
  const [rawMoodPlaces, setRawMoodPlaces] = useState<HomePlace[]>([]);
  const [rawSimilarPlaces, setRawSimilarPlaces] = useState<HomePlace[]>([]);

  const [selectedSimilarSeedId, setSelectedSimilarSeedId] = useState<
    string | null
  >(null);
  const [similarSeedPlaces, setSimilarSeedPlaces] = useState<HomePlace[]>([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState<string | null>(null);

  const [isMoodLoading, setIsMoodLoading] = useState(false);
  const [moodError, setMoodError] = useState<string | null>(null);

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

  const [rawDiscoveryPlaces, setRawDiscoveryPlaces] = useState<HomePlace[]>([]);
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
  const [topRatedError, setTopRatedError] = useState<string | null>(null);
  const [topRatedInAreaError, setTopRatedInAreaError] = useState<string | null>(
    null,
  );

  const normalizedSearch = useMemo(
    () => deferredSearch.trim().toLowerCase(),
    [deferredSearch],
  );

  const selectedFilterSet = useMemo(
    () => new Set(selectedFilters),
    [selectedFilters],
  );

  const userCoordinates = useMemo(() => {
    if (userLocation.status !== "granted" || !userLocation.coordinates) {
      return null;
    }

    return {
      latitude: userLocation.coordinates.latitude,
      longitude: userLocation.coordinates.longitude,
    };
  }, [userLocation.coordinates, userLocation.status]);

  const [saveError, setSaveError] = useState<string | null>(null);
  const [savePendingMap, setSavePendingMap] = useState<Record<string, boolean>>(
    {},
  );

  const [discoveryReloadKey, setDiscoveryReloadKey] = useState(0);
  const [similarReloadKey, setSimilarReloadKey] = useState(0);
  const [moodReloadKey, setMoodReloadKey] = useState(0);

  const saveInFlightIds = useRef(new Set<string>());
  const homeRequestIdRef = useRef(0);
  const similarRequestIdRef = useRef(0);
  const moodRequestIdRef = useRef(0);
  const discoveryRequestIdRef = useRef(0);
  const topRatedRequestIdRef = useRef(0);
  const topRatedAreaRequestIdRef = useRef(0);

  const applyFilters = useCallback(
    (list: HomePlace[]): HomePlace[] => {
      let filtered = [...list];

      const toSafeLower = (value: unknown) =>
        typeof value === "string" ? value.toLowerCase() : "";

      if (normalizedSearch) {
        filtered = filtered.filter(
          (place) =>
            toSafeLower(place.name).includes(normalizedSearch) ||
            toSafeLower(place.address).includes(normalizedSearch) ||
            toSafeLower(place.category).includes(normalizedSearch) ||
            (place.atmosphereTags ?? []).some((tag) =>
              toSafeLower(tag).includes(normalizedSearch),
            ),
        );
      }

      if (selectedFilterSet.has("open-now")) {
        filtered = filtered.filter((place) => place.isOpen === true);
      }

      if (selectedFilterSet.has("saved")) {
        filtered = filtered.filter((place) => place.isSaved === true);
      }

      if (selectedFilterSet.has("has-wifi")) {
        filtered = filtered.filter((place) => place.hasWifi === true);
      }

      if (selectedFilterSet.has("near-me") && userCoordinates) {
        const { latitude, longitude } = userCoordinates;
        const withDistance = filtered.map((place) => {
          const distance =
            Number.isFinite(place.latitude) && Number.isFinite(place.longitude)
              ? calculateDistanceKm(
                  latitude,
                  longitude,
                  place.latitude,
                  place.longitude,
                )
              : Number.POSITIVE_INFINITY;

          return { place, distance };
        });

        withDistance.sort((first, second) => first.distance - second.distance);
        filtered = withDistance.map((entry) => entry.place);
      }

      return filtered;
    },
    [normalizedSearch, selectedFilterSet, userCoordinates],
  );

  const curatedPlaces = useMemo(
    () => applyFilters(rawCurated),
    [applyFilters, rawCurated],
  );

  const trendingPlaces = useMemo(
    () => applyFilters(rawTrending),
    [applyFilters, rawTrending],
  );

  const moodPlaces = useMemo(
    () => applyFilters(rawMoodPlaces),
    [applyFilters, rawMoodPlaces],
  );

  const similarPlaces = useMemo(
    () => applyFilters(rawSimilarPlaces),
    [applyFilters, rawSimilarPlaces],
  );

  const discoveryPlaces = useMemo(
    () => applyFilters(rawDiscoveryPlaces),
    [applyFilters, rawDiscoveryPlaces],
  );

  const loadPlaces = useCallback(async (): Promise<void> => {
    const requestId = ++homeRequestIdRef.current;

    if (!user) {
      setIsLoading(false);
      setError("Sign in to load your personalized map places.");
      setRawCurated([]);
      setRawTrending([]);
      setSimilarSeedPlaces([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [homeData, personalizedSeedPool, trendingSeedPool] =
        await Promise.all([
          mapAtlasService.fetchHomePageData({ count: 12 }),
          mapAtlasService.fetchPersonalizedRecommendations({ count: 70 }),
          mapAtlasService.fetchTrendingRecommendations({ count: 70 }),
        ]);

      if (!mountedRef.current || requestId !== homeRequestIdRef.current) {
        return;
      }

      setRawCurated(homeData.curatedPlaces);
      setRawTrending(homeData.trendingPlaces);

      const seedPool = dedupePlacesById([
        ...personalizedSeedPool,
        ...trendingSeedPool,
      ]).slice(0, 80);

      setSimilarSeedPlaces(seedPool);
      setSelectedSimilarSeedId((current) => current ?? seedPool[0]?.id ?? null);
    } catch (loadError) {
      if (!mountedRef.current || requestId !== homeRequestIdRef.current) {
        return;
      }

      setError(
        toFriendlyErrorMessage(
          loadError,
          "We could not load your map places. Please retry.",
        ),
      );
      setRawCurated([]);
      setRawTrending([]);
      setSimilarSeedPlaces([]);
      setSelectedSimilarSeedId(null);
    } finally {
      if (mountedRef.current && requestId === homeRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    void loadPlaces();

    return () => {
      mountedRef.current = false;
      homeRequestIdRef.current += 1;
      similarRequestIdRef.current += 1;
      moodRequestIdRef.current += 1;
      discoveryRequestIdRef.current += 1;
      topRatedRequestIdRef.current += 1;
      topRatedAreaRequestIdRef.current += 1;
    };
  }, [loadPlaces]);

  useEffect(() => {
    if (!selectedSimilarSeedId) {
      setRawSimilarPlaces([]);
      setSimilarError(null);
      setIsSimilarLoading(false);
      return;
    }

    const requestId = ++similarRequestIdRef.current;
    setIsSimilarLoading(true);
    setSimilarError(null);

    void (async () => {
      try {
        const places = await mapAtlasService.fetchSimilarRecommendations({
          venueId: selectedSimilarSeedId,
          count: 10,
        });

        if (!mountedRef.current || requestId !== similarRequestIdRef.current) {
          return;
        }

        setRawSimilarPlaces(places);
      } catch (loadError) {
        if (!mountedRef.current || requestId !== similarRequestIdRef.current) {
          return;
        }

        setRawSimilarPlaces([]);
        setSimilarError(
          toFriendlyErrorMessage(
            loadError,
            "Could not load similar recommendations.",
          ),
        );
      } finally {
        if (mountedRef.current && requestId === similarRequestIdRef.current) {
          setIsSimilarLoading(false);
        }
      }
    })();
  }, [selectedSimilarSeedId, similarReloadKey]);

  useEffect(() => {
    if (!selectedMood) {
      setRawMoodPlaces([]);
      setMoodError(null);
      setIsMoodLoading(false);
      return;
    }

    const requestId = ++moodRequestIdRef.current;
    setIsMoodLoading(true);
    setMoodError(null);

    void (async () => {
      try {
        const places = await mapAtlasService.fetchPlacesByMood(selectedMood);

        if (!mountedRef.current || requestId !== moodRequestIdRef.current) {
          return;
        }

        setRawMoodPlaces(places);
      } catch (loadError) {
        if (!mountedRef.current || requestId !== moodRequestIdRef.current) {
          return;
        }

        setRawMoodPlaces([]);
        setMoodError(
          toFriendlyErrorMessage(loadError, "Could not load mood picks."),
        );
      } finally {
        if (mountedRef.current && requestId === moodRequestIdRef.current) {
          setIsMoodLoading(false);
        }
      }
    })();
  }, [selectedMood, moodReloadKey]);

  useEffect(() => {
    const requestId = ++topRatedRequestIdRef.current;
    setIsGlobalTopRatedLoading(true);
    setTopRatedError(null);

    void (async () => {
      try {
        const places = await mapAtlasService.fetchVenueTopRated();

        if (!mountedRef.current || requestId !== topRatedRequestIdRef.current) {
          return;
        }

        setGlobalTopRatedVenues(places);
      } catch (loadError) {
        if (!mountedRef.current || requestId !== topRatedRequestIdRef.current) {
          return;
        }

        setGlobalTopRatedVenues([]);
        setTopRatedError(
          toFriendlyErrorMessage(loadError, "Could not load top-rated venues."),
        );
      } finally {
        if (mountedRef.current && requestId === topRatedRequestIdRef.current) {
          setIsGlobalTopRatedLoading(false);
        }
      }
    })();
  }, [discoveryReloadKey]);

  useEffect(() => {
    if (!selectedArea.trim()) {
      setTopRatedInAreaVenues([]);
      setTopRatedInAreaError(null);
      setIsTopRatedInAreaLoading(false);
      return;
    }

    const requestId = ++topRatedAreaRequestIdRef.current;
    setIsTopRatedInAreaLoading(true);
    setTopRatedInAreaError(null);

    void (async () => {
      try {
        const places = await mapAtlasService.fetchVenueTopRatedInArea({
          area: selectedArea,
        });

        if (
          !mountedRef.current ||
          requestId !== topRatedAreaRequestIdRef.current
        ) {
          return;
        }

        setTopRatedInAreaVenues(places);
      } catch (loadError) {
        if (
          !mountedRef.current ||
          requestId !== topRatedAreaRequestIdRef.current
        ) {
          return;
        }

        setTopRatedInAreaVenues([]);
        setTopRatedInAreaError(
          toFriendlyErrorMessage(
            loadError,
            "Could not load top-rated venues for this area.",
          ),
        );
      } finally {
        if (
          mountedRef.current &&
          requestId === topRatedAreaRequestIdRef.current
        ) {
          setIsTopRatedInAreaLoading(false);
        }
      }
    })();
  }, [selectedArea, discoveryReloadKey]);

  useEffect(() => {
    if (activeDiscoverySource !== "district") {
      return;
    }

    if (!selectedDistrict) {
      setRawDiscoveryPlaces([]);
      setDiscoveryError(null);
      setIsDiscoveryLoading(false);
      return;
    }

    const requestId = ++discoveryRequestIdRef.current;
    setIsDiscoveryLoading(true);
    setDiscoveryError(null);

    void (async () => {
      try {
        const places = await mapAtlasService.fetchVenuesByDistrict({
          district: selectedDistrict,
        });

        if (
          !mountedRef.current ||
          requestId !== discoveryRequestIdRef.current
        ) {
          return;
        }

        setRawDiscoveryPlaces(places);
      } catch (loadError) {
        if (
          !mountedRef.current ||
          requestId !== discoveryRequestIdRef.current
        ) {
          return;
        }

        setRawDiscoveryPlaces([]);
        setDiscoveryError(
          toFriendlyErrorMessage(loadError, "Could not load district venues."),
        );
      } finally {
        if (mountedRef.current && requestId === discoveryRequestIdRef.current) {
          setIsDiscoveryLoading(false);
        }
      }
    })();
  }, [activeDiscoverySource, selectedDistrict, discoveryReloadKey]);

  useEffect(() => {
    if (activeDiscoverySource !== "type") {
      return;
    }

    if (!selectedVenueType) {
      setRawDiscoveryPlaces([]);
      setDiscoveryError(null);
      setIsDiscoveryLoading(false);
      return;
    }

    const requestId = ++discoveryRequestIdRef.current;
    setIsDiscoveryLoading(true);
    setDiscoveryError(null);

    void (async () => {
      try {
        const places = await mapAtlasService.fetchVenuesByType({
          type: selectedVenueType,
        });

        if (
          !mountedRef.current ||
          requestId !== discoveryRequestIdRef.current
        ) {
          return;
        }

        setRawDiscoveryPlaces(places);
      } catch (loadError) {
        if (
          !mountedRef.current ||
          requestId !== discoveryRequestIdRef.current
        ) {
          return;
        }

        setRawDiscoveryPlaces([]);
        setDiscoveryError(
          toFriendlyErrorMessage(loadError, "Could not load venues by type."),
        );
      } finally {
        if (mountedRef.current && requestId === discoveryRequestIdRef.current) {
          setIsDiscoveryLoading(false);
        }
      }
    })();
  }, [activeDiscoverySource, selectedVenueType, discoveryReloadKey]);

  useEffect(() => {
    if (activeDiscoverySource !== "price-range") {
      return;
    }

    if (!selectedPriceRange) {
      setRawDiscoveryPlaces([]);
      setDiscoveryError(null);
      setIsDiscoveryLoading(false);
      return;
    }

    const requestId = ++discoveryRequestIdRef.current;
    setIsDiscoveryLoading(true);
    setDiscoveryError(null);

    void (async () => {
      try {
        const places = await mapAtlasService.fetchVenuesByPriceRange({
          priceRange: selectedPriceRange,
        });

        if (
          !mountedRef.current ||
          requestId !== discoveryRequestIdRef.current
        ) {
          return;
        }

        setRawDiscoveryPlaces(places);
      } catch (loadError) {
        if (
          !mountedRef.current ||
          requestId !== discoveryRequestIdRef.current
        ) {
          return;
        }

        setRawDiscoveryPlaces([]);
        setDiscoveryError(
          toFriendlyErrorMessage(
            loadError,
            "Could not load venues for this budget level.",
          ),
        );
      } finally {
        if (mountedRef.current && requestId === discoveryRequestIdRef.current) {
          setIsDiscoveryLoading(false);
        }
      }
    })();
  }, [activeDiscoverySource, selectedPriceRange, discoveryReloadKey]);

  useEffect(() => {
    if (activeDiscoverySource === "top-rated") {
      setRawDiscoveryPlaces(globalTopRatedVenues);
      setDiscoveryError(topRatedError);
      setIsDiscoveryLoading(isGlobalTopRatedLoading);
      return;
    }

    if (activeDiscoverySource === "top-rated-area") {
      setRawDiscoveryPlaces(topRatedInAreaVenues);
      setDiscoveryError(topRatedInAreaError);
      setIsDiscoveryLoading(isTopRatedInAreaLoading);
    }
  }, [
    activeDiscoverySource,
    globalTopRatedVenues,
    isGlobalTopRatedLoading,
    topRatedError,
    topRatedInAreaVenues,
    topRatedInAreaError,
    isTopRatedInAreaLoading,
  ]);

  const toggleFilter = useCallback((filter: FilterType) => {
    if (filter === "all") {
      setSelectedFilters([]);
      return;
    }

    setSelectedFilters((previous) =>
      previous.includes(filter)
        ? previous.filter((item) => item !== filter)
        : [...previous, filter],
    );
  }, []);

  const toggleSave = useCallback(
    async (id: string): Promise<void> => {
      const normalizedId = id.trim();
      if (!normalizedId || saveInFlightIds.current.has(normalizedId)) {
        return;
      }

      const allPlaces = [
        ...rawCurated,
        ...rawTrending,
        ...rawMoodPlaces,
        ...rawSimilarPlaces,
        ...rawDiscoveryPlaces,
        ...similarSeedPlaces,
        ...globalTopRatedVenues,
        ...topRatedInAreaVenues,
      ];
      const matchedPlace = allPlaces.find((place) => place.id === normalizedId);
      const nextSavedState = !(matchedPlace?.isSaved ?? false);

      setSaveError(null);
      saveInFlightIds.current.add(normalizedId);
      setSavePendingMap((previous) => ({
        ...previous,
        [normalizedId]: true,
      }));

      const toggleLocalSave = (list: HomePlace[]) =>
        list.map((place) =>
          place.id === normalizedId
            ? { ...place, isSaved: nextSavedState }
            : place,
        );

      try {
        await mapAtlasService.togglePlaceSave(normalizedId, nextSavedState);

        if (!mountedRef.current) {
          return;
        }

        setRawCurated((previous) => toggleLocalSave(previous));
        setRawTrending((previous) => toggleLocalSave(previous));
        setRawMoodPlaces((previous) => toggleLocalSave(previous));
        setRawSimilarPlaces((previous) => toggleLocalSave(previous));
        setRawDiscoveryPlaces((previous) => toggleLocalSave(previous));
        setSimilarSeedPlaces((previous) => toggleLocalSave(previous));
        setGlobalTopRatedVenues((previous) => toggleLocalSave(previous));
        setTopRatedInAreaVenues((previous) => toggleLocalSave(previous));
        void trackVenueInteractionSafe(
          normalizedId,
          INTERACTION_ACTION_TYPES.favorite,
        );
      } catch (toggleError) {
        if (!mountedRef.current) {
          return;
        }

        setSaveError(
          toFriendlyErrorMessage(
            toggleError,
            "Could not update save state for this place.",
          ),
        );
      } finally {
        saveInFlightIds.current.delete(normalizedId);
        if (mountedRef.current) {
          setSavePendingMap((previous) => {
            const next = { ...previous };
            delete next[normalizedId];
            return next;
          });
        }
      }
    },
    [
      globalTopRatedVenues,
      rawCurated,
      rawDiscoveryPlaces,
      rawMoodPlaces,
      rawSimilarPlaces,
      rawTrending,
      similarSeedPlaces,
      topRatedInAreaVenues,
    ],
  );

  const retryDiscovery = useCallback(() => {
    setDiscoveryReloadKey((previous) => previous + 1);
  }, []);

  const retrySimilar = useCallback(() => {
    setSimilarReloadKey((previous) => previous + 1);
  }, []);

  const retryMood = useCallback(() => {
    setMoodReloadKey((previous) => previous + 1);
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
    discoveryPlaces,
    discoveryError,
    isDiscoveryLoading,

    curatedPlaces,
    trendingPlaces,
    moodPlaces,
    isMoodLoading,
    moodError,
    userLocation,

    categories: CATEGORIES,
    moodOptions: MOOD_OPTIONS,
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
