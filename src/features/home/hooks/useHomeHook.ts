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
import { getErrorMessage } from "@/utils/apiError";
import { useUserLocation } from "@/features/home/hooks/useUserLocation";
import { filterHomePlacesByQuickFilters } from "../utils/filters";
import {
  patchSavedStateInCollection,
  buildToggleSaveHandler,
  deduplicateVenuePool,
} from "../utils/venueCollectionOps";

interface UseHomeReturn {
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

  const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moodPlaces, setMoodPlaces] = useState<HomePlace[]>([]);
  const [isMoodLoading, setIsMoodLoading] = useState(false);
  const [moodError, setMoodError] = useState<string | null>(null);
  const [selectedSimilarSeedId, setSelectedSimilarSeedId] = useState<string | null>(null);
  const [similarSeedPlaces, setSimilarSeedPlaces] = useState<HomePlace[]>([]);
  const [similarPlaces, setSimilarPlaces] = useState<HomePlace[]>([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [similarReloadKey, setSimilarReloadKey] = useState(0);
  const [moodReloadKey, setMoodReloadKey] = useState(0);
  const [savePendingMap, setSavePendingMap] = useState<Record<string, boolean>>({});
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedVenueType, setSelectedVenueType] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<VenuePriceRange | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [activeDiscoverySource, setActiveDiscoverySource] = useState<DiscoverySource>("top-rated");
  const [discoveryPlaces, setDiscoveryPlaces] = useState<HomePlace[]>([]);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [isDiscoveryLoading, setIsDiscoveryLoading] = useState(false);
  const [globalTopRatedVenues, setGlobalTopRatedVenues] = useState<HomePlace[]>([]);
  const [topRatedInAreaVenues, setTopRatedInAreaVenues] = useState<HomePlace[]>([]);
  const [isGlobalTopRatedLoading, setIsGlobalTopRatedLoading] = useState(false);
  const [isTopRatedInAreaLoading, setIsTopRatedInAreaLoading] = useState(false);
  const [topRatedInAreaError, setTopRatedInAreaError] = useState<string | null>(null);
  const [discoveryReloadKey, setDiscoveryReloadKey] = useState(0);
  const [rawCurated, setRawCurated] = useState<HomePlace[]>([]);
  const [rawTrending, setRawTrending] = useState<HomePlace[]>([]);

  const saveInFlightIds = useRef<Set<string>>(new Set());

  const broadcastSavedStateChange = useCallback((id: string, isSaved: boolean) => {
    const patch = (list: HomePlace[]) => patchSavedStateInCollection(list, id, isSaved);
    setRawCurated(patch);
    setRawTrending(patch);
    setDiscoveryPlaces(patch);
    setGlobalTopRatedVenues(patch);
    setTopRatedInAreaVenues(patch);
    setMoodPlaces(patch);
    setSimilarSeedPlaces(patch);
    setSimilarPlaces(patch);
  }, []);

  const loadPlaces = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const [homeData, personalizedPool, trendingPool] = await Promise.all([
        homeService.fetchHomePageData({ count: 10 }),
        homeService.fetchPersonalizedRecommendations({ count: 20 }),
        homeService.fetchTrendingRecommendations({ count: 20 }),
      ]);
      setRawCurated(homeData.curatedPlaces);
      setRawTrending(homeData.trendingPlaces);
      setSimilarSeedPlaces(deduplicateVenuePool([personalizedPool, trendingPool]));
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
    const fetchSimilar = async () => {
      setIsSimilarLoading(true);
      setSimilarError(null);
      try {
        const places = await homeService.fetchSimilarRecommendations({
          venueId: selectedSimilarSeedId,
          count: 8,
        });
        if (!cancelled) setSimilarPlaces(places);
      } catch (err) {
        if (!cancelled)
          setSimilarError(getErrorMessage(err, "Failed to load similar recommendations"));
      } finally {
        if (!cancelled) setIsSimilarLoading(false);
      }
    };
    fetchSimilar();
    return () => { cancelled = true; };
  }, [selectedSimilarSeedId, similarReloadKey]);

  useEffect(() => {
    if (!selectedMood) {
      setMoodPlaces([]);
      setMoodError(null);
      return;
    }
    let cancelled = false;
    const fetchMood = async () => {
      setIsMoodLoading(true);
      setMoodError(null);
      try {
        const places = await homeService.fetchMoodRecommendations(selectedMood);
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
    fetchMood();
    return () => { cancelled = true; };
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
          setDiscoveryError(getErrorMessage(err, "Failed to load top-rated venues"));
        }
      } finally {
        if (!cancelled) setIsGlobalTopRatedLoading(false);
      }
    };
    fetchTopRated();
    return () => { cancelled = true; };
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
        const places = await homeService.fetchVenuesByDistrict({ district: selectedDistrict });
        if (!cancelled) setDiscoveryPlaces(places);
      } catch (err) {
        if (!cancelled)
          setDiscoveryError(getErrorMessage(err, "Failed to load district venues"));
      } finally {
        if (!cancelled) setIsDiscoveryLoading(false);
      }
    };
    fetchByDistrict();
    return () => { cancelled = true; };
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
        const places = await homeService.fetchVenuesByType({ type: selectedVenueType });
        if (!cancelled) setDiscoveryPlaces(places);
      } catch (err) {
        if (!cancelled)
          setDiscoveryError(getErrorMessage(err, "Failed to load venue types"));
      } finally {
        if (!cancelled) setIsDiscoveryLoading(false);
      }
    };
    fetchByType();
    return () => { cancelled = true; };
  }, [selectedVenueType, activeDiscoverySource, discoveryReloadKey]);

  useEffect(() => {
    if (activeDiscoverySource !== "price-range") return;
    if (!selectedPriceRange) {
      setDiscoveryPlaces([]);
      setDiscoveryError(null);
      return;
    }
    let cancelled = false;
    const fetchByBudget = async () => {
      setIsDiscoveryLoading(true);
      setDiscoveryError(null);
      try {
        const places = await homeService.fetchVenuesByPriceRange({ priceRange: selectedPriceRange });
        if (!cancelled) setDiscoveryPlaces(places);
      } catch (err) {
        if (!cancelled)
          setDiscoveryError(getErrorMessage(err, "Failed to load venues for this budget"));
      } finally {
        if (!cancelled) setIsDiscoveryLoading(false);
      }
    };
    fetchByBudget();
    return () => { cancelled = true; };
  }, [selectedPriceRange, activeDiscoverySource, discoveryReloadKey]);

  useEffect(() => {
    if (!selectedArea) return;
    let cancelled = false;
    const fetchAreaTopRated = async () => {
      setIsTopRatedInAreaLoading(true);
      setTopRatedInAreaError(null);
      try {
        const places = await homeService.fetchVenueTopRatedInArea({ area: selectedArea });
        if (!cancelled) {
          setTopRatedInAreaVenues(places);
          if (activeDiscoverySource === "top-rated-area") {
            setDiscoveryPlaces(places);
            setDiscoveryError(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message = getErrorMessage(err, "Failed to load top-rated venues in area");
          setTopRatedInAreaError(message);
          if (activeDiscoverySource === "top-rated-area") setDiscoveryError(message);
        }
      } finally {
        if (!cancelled) setIsTopRatedInAreaLoading(false);
      }
    };
    fetchAreaTopRated();
    return () => { cancelled = true; };
  }, [selectedArea, activeDiscoverySource, discoveryReloadKey]);

  useEffect(() => {
    if (activeDiscoverySource === "top-rated") {
      setDiscoveryPlaces(globalTopRatedVenues);
      setDiscoveryError(null);
    } else if (activeDiscoverySource === "top-rated-area") {
      setDiscoveryPlaces(topRatedInAreaVenues);
      setDiscoveryError(topRatedInAreaError);
    }
  }, [activeDiscoverySource, globalTopRatedVenues, topRatedInAreaVenues, topRatedInAreaError]);

  const toggleFilter = useCallback((filter: FilterType) => {
    if (filter === "all") {
      setSelectedFilters([]);
    } else {
      setSelectedFilters((prev) =>
        prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter],
      );
    }
  }, []);

  const toggleSave = useCallback(
    buildToggleSaveHandler({
      placeCollections: [
        rawCurated,
        rawTrending,
        discoveryPlaces,
        globalTopRatedVenues,
        topRatedInAreaVenues,
        moodPlaces,
        similarSeedPlaces,
        similarPlaces,
      ],
      saveInFlightIds,
      setSaveError,
      setSavePendingMap,
      onOptimisticUpdate: (id, nextSaved) => broadcastSavedStateChange(id, nextSaved),
      onRollback: (id, prevSaved) => broadcastSavedStateChange(id, prevSaved),
      trackInteraction: true,
    }),
    [
      rawCurated,
      rawTrending,
      discoveryPlaces,
      globalTopRatedVenues,
      topRatedInAreaVenues,
      moodPlaces,
      similarSeedPlaces,
      similarPlaces,
      broadcastSavedStateChange,
    ],
  );

  const applyQuickFilters = useCallback(
    (list: HomePlace[]): HomePlace[] =>
      filterHomePlacesByQuickFilters(list, selectedFilters, userLocation),
    [selectedFilters, userLocation],
  );

  const curatedPlaces = useMemo(() => applyQuickFilters(rawCurated), [rawCurated, applyQuickFilters]);
  const trendingPlaces = useMemo(() => applyQuickFilters(rawTrending), [rawTrending, applyQuickFilters]);
  const filteredDiscoveryPlaces = useMemo(
    () => applyQuickFilters(discoveryPlaces),
    [discoveryPlaces, applyQuickFilters],
  );

  const retryDiscovery = useCallback(() => setDiscoveryReloadKey((k) => k + 1), []);
  const retrySimilar = useCallback(() => setSimilarReloadKey((k) => k + 1), []);
  const retryMood = useCallback(() => setMoodReloadKey((k) => k + 1), []);
  const clearSaveError = useCallback(() => setSaveError(null), []);
  const isPlaceSavePending = useCallback(
    (id: string) => Boolean(savePendingMap[id]),
    [savePendingMap],
  );

  return {
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
