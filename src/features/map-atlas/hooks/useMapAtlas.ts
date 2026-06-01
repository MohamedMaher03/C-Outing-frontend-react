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
import { applyMapAtlasPlaceFilters } from "@/features/map-atlas/utils/mapAtlasPlaceFilters";
import { resolveMapAtlasErrorMessage } from "@/features/map-atlas/utils/mapAtlasErrors";
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
import {
  DEFAULT_MAP_ATLAS_RECOMMENDATION_COUNT,
  type MapAtlasRecommendationCount,
} from "@/features/map-atlas/constants/recommendationCount";
import { mapAtlasService } from "@/features/map-atlas/services/mapAtlasService";
import {
  findNearestDistrict,
  sortDistrictsByProximity,
} from "@/features/map-atlas/utils/districtCoordinates";

interface UseMapAtlasReturn {
  search: string;
  selectedFilters: FilterType[];
  selectedMood: string | null;
  isLoading: boolean;
  error: string | null;
  saveError: string | null;

  selectedDistrict: string | null;
  autoSelectedDistrictId: string | null;
  selectedVenueType: string | null;
  selectedPriceRange: VenuePriceRange | null;
  selectedArea: string;
  activeDiscoverySource: DiscoverySource;
  discoveryPlaces: HomePlace[];
  discoveryError: string | null;
  isDiscoveryLoading: boolean;

  recommendationCount: MapAtlasRecommendationCount;
  isCuratedTrendingLoading: boolean;

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
  setRecommendationCount: (count: MapAtlasRecommendationCount) => void;
  requestUserLocation: () => void;
  toggleSave: (id: string) => Promise<void>;
  retryDiscovery: () => void;
  retryMood: () => void;
  retryCuratedTrending: () => void;
  clearSaveError: () => void;
  isPlaceSavePending: (id: string) => boolean;
  reloadPlaces: () => Promise<void>;
}

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

  const [isMoodLoading, setIsMoodLoading] = useState(false);
  const [moodError, setMoodError] = useState<string | null>(null);

  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(
    POPULAR_DISTRICTS[0]?.name ?? null,
  );
  const [autoSelectedDistrictId, setAutoSelectedDistrictId] = useState<
    string | null
  >(null);
  const [selectedVenueType, setSelectedVenueType] = useState<string | null>(
    null,
  );
  const [selectedPriceRange, setSelectedPriceRange] =
    useState<VenuePriceRange | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>(
    POPULAR_DISTRICTS[0]?.name ?? "Cairo",
  );
  const [activeDiscoverySource, setActiveDiscoverySource] =
    useState<DiscoverySource>("district");

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

  const [recommendationCount, setRecommendationCount] =
    useState<MapAtlasRecommendationCount>(
      DEFAULT_MAP_ATLAS_RECOMMENDATION_COUNT,
    );
  const [isCuratedTrendingLoading, setIsCuratedTrendingLoading] =
    useState(false);

  const [discoveryReloadKey, setDiscoveryReloadKey] = useState(0);
  const [moodReloadKey, setMoodReloadKey] = useState(0);
  const [curatedTrendingReloadKey, setCuratedTrendingReloadKey] = useState(0);

  const saveInFlightIds = useRef(new Set<string>());
  const userChangedDistrictRef = useRef(false);
  const homeRequestIdRef = useRef(0);
  const moodRequestIdRef = useRef(0);
  const discoveryRequestIdRef = useRef(0);
  const topRatedRequestIdRef = useRef(0);
  const topRatedAreaRequestIdRef = useRef(0);
  const curatedTrendingRequestIdRef = useRef(0);
  const skipRecommendationCountEffectRef = useRef(true);

  const filterContext = useMemo(
    () => ({
      normalizedSearch,
      selectedFilterSet,
      userCoordinates,
    }),
    [normalizedSearch, selectedFilterSet, userCoordinates],
  );

  const applyFilters = useCallback(
    (list: HomePlace[]) => applyMapAtlasPlaceFilters(list, filterContext),
    [filterContext],
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

  const discoveryPlaces = useMemo(
    () => applyFilters(rawDiscoveryPlaces),
    [applyFilters, rawDiscoveryPlaces],
  );

  const loadCuratedAndTrending = useCallback(
    async (
      count: MapAtlasRecommendationCount,
      options?: { showLoading?: boolean },
    ): Promise<void> => {
      const requestId = ++curatedTrendingRequestIdRef.current;

      if (!user) {
        setRawCurated([]);
        setRawTrending([]);
        return;
      }

      if (options?.showLoading) {
        setIsCuratedTrendingLoading(true);
      }

      try {
        const homeData = await mapAtlasService.fetchHomePageData({ count });

        if (
          !mountedRef.current ||
          requestId !== curatedTrendingRequestIdRef.current
        ) {
          return;
        }

        setRawCurated(homeData.curatedPlaces);
        setRawTrending(homeData.trendingPlaces);
      } catch {
        if (
          !mountedRef.current ||
          requestId !== curatedTrendingRequestIdRef.current
        ) {
          return;
        }
      } finally {
        if (
          mountedRef.current &&
          requestId === curatedTrendingRequestIdRef.current
        ) {
          setIsCuratedTrendingLoading(false);
        }
      }
    },
    [user],
  );

  const loadPlaces = useCallback(async (): Promise<void> => {
    const requestId = ++homeRequestIdRef.current;

    if (!user) {
      setIsLoading(false);
      setError("Sign in to load your personalized map places.");
      setRawCurated([]);
      setRawTrending([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const homeData = await mapAtlasService.fetchHomePageData({
        count: DEFAULT_MAP_ATLAS_RECOMMENDATION_COUNT,
      });

      if (!mountedRef.current || requestId !== homeRequestIdRef.current) {
        return;
      }

      setRawCurated(homeData.curatedPlaces);
      setRawTrending(homeData.trendingPlaces);
    } catch (loadError) {
      if (!mountedRef.current || requestId !== homeRequestIdRef.current) {
        return;
      }

      setError(
        resolveMapAtlasErrorMessage(
          loadError,
          "We could not load your map places. Please retry.",
        ),
      );
      setRawCurated([]);
      setRawTrending([]);
    } finally {
      if (mountedRef.current && requestId === homeRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (skipRecommendationCountEffectRef.current) {
      skipRecommendationCountEffectRef.current = false;
      return;
    }

    void loadCuratedAndTrending(recommendationCount, { showLoading: true });
  }, [curatedTrendingReloadKey, loadCuratedAndTrending, recommendationCount]);

  useEffect(() => {
    if (userChangedDistrictRef.current) {
      return;
    }

    if (userLocation.status !== "granted" || !userCoordinates) {
      return;
    }

    const nearestDistrict = findNearestDistrict(
      userCoordinates.latitude,
      userCoordinates.longitude,
      POPULAR_DISTRICTS,
    );

    if (!nearestDistrict) {
      return;
    }

    setSelectedDistrict(nearestDistrict.name);
    setSelectedArea(nearestDistrict.name);
    setAutoSelectedDistrictId(nearestDistrict.id);
  }, [userCoordinates, userLocation.status]);

  const handleSetSelectedDistrict = useCallback((district: string | null) => {
    userChangedDistrictRef.current = true;
    setAutoSelectedDistrictId(null);
    setSelectedDistrict(district);
  }, []);

  const popularDistrictsForDisplay = useMemo(() => {
    if (!userCoordinates) {
      return POPULAR_DISTRICTS;
    }

    return sortDistrictsByProximity(
      POPULAR_DISTRICTS,
      userCoordinates.latitude,
      userCoordinates.longitude,
    );
  }, [userCoordinates]);

  useEffect(() => {
    mountedRef.current = true;
    void loadPlaces();

    return () => {
      mountedRef.current = false;
      homeRequestIdRef.current += 1;
      moodRequestIdRef.current += 1;
      discoveryRequestIdRef.current += 1;
      topRatedRequestIdRef.current += 1;
      topRatedAreaRequestIdRef.current += 1;
      curatedTrendingRequestIdRef.current += 1;
    };
  }, [loadPlaces]);

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
        const places =
          await mapAtlasService.fetchMoodRecommendations(selectedMood);

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
          resolveMapAtlasErrorMessage(loadError, "Could not load mood picks."),
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
          resolveMapAtlasErrorMessage(loadError, "Could not load top-rated venues."),
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
          resolveMapAtlasErrorMessage(
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
          resolveMapAtlasErrorMessage(loadError, "Could not load district venues."),
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
          resolveMapAtlasErrorMessage(loadError, "Could not load venues by type."),
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
          resolveMapAtlasErrorMessage(
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
        ...rawDiscoveryPlaces,
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
        setRawDiscoveryPlaces((previous) => toggleLocalSave(previous));
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
          resolveMapAtlasErrorMessage(
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
      rawTrending,
      topRatedInAreaVenues,
    ],
  );

  const retryDiscovery = useCallback(() => {
    setDiscoveryReloadKey((previous) => previous + 1);
  }, []);

  const retryMood = useCallback(() => {
    setMoodReloadKey((previous) => previous + 1);
  }, []);

  const retryCuratedTrending = useCallback(() => {
    setCuratedTrendingReloadKey((previous) => previous + 1);
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
    saveError,

    selectedDistrict,
    autoSelectedDistrictId,
    selectedVenueType,
    selectedPriceRange,
    selectedArea,
    activeDiscoverySource,
    discoveryPlaces,
    discoveryError,
    isDiscoveryLoading,

    recommendationCount,
    isCuratedTrendingLoading,

    curatedPlaces,
    trendingPlaces,
    moodPlaces,
    isMoodLoading,
    moodError,
    userLocation,

    categories: CATEGORIES,
    moodOptions: MOOD_OPTIONS,
    popularDistricts: popularDistrictsForDisplay,

    setSearch,
    toggleFilter,
    setSelectedMood,
    setSelectedDistrict: handleSetSelectedDistrict,
    setSelectedVenueType,
    setSelectedPriceRange,
    setSelectedArea,
    setActiveDiscoverySource,
    setRecommendationCount,
    requestUserLocation: userLocation.requestLocation,
    toggleSave,
    retryDiscovery,
    retryMood,
    retryCuratedTrending,
    clearSaveError,
    isPlaceSavePending,
    reloadPlaces: loadPlaces,
  };
};
