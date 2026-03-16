/**
 * useHome Hook
 * Manages all state and logic for the HomePage.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
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
  VenuePriceRange,
} from "@/features/home/types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getErrorMessage } from "@/utils/apiError";

interface UseHomeReturn {
  // State
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

  // Endpoint-driven discovery state
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

  // Computed / filtered data
  curatedPlaces: HomePlace[];
  trendingPlaces: HomePlace[];
  moodPlaces: HomePlace[];
  isMoodLoading: boolean;

  // Static data
  categories: typeof CATEGORIES;
  moodOptions: typeof MOOD_OPTIONS;
  trendingTags: typeof TRENDING_TAGS;
  popularDistricts: typeof POPULAR_DISTRICTS;

  // Actions
  setSearch: (search: string) => void;
  toggleFilter: (filter: FilterType) => void;
  setSelectedMood: (mood: string | null) => void;
  setSelectedDistrict: (district: string | null) => void;
  setSelectedVenueType: (type: string | null) => void;
  setSelectedPriceRange: (priceRange: VenuePriceRange | null) => void;
  setSelectedArea: (area: string) => void;
  setActiveDiscoverySource: (source: DiscoverySource) => void;
  selectPlaceForSimilar: (placeId: string | null) => void;
  toggleSave: (id: string) => void;
  reloadPlaces: () => Promise<void>;
}

export const useHome = (): UseHomeReturn => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moodPlaces, setMoodPlaces] = useState<HomePlace[]>([]);
  const [isMoodLoading, setIsMoodLoading] = useState(false);
  const [selectedSimilarSeedId, setSelectedSimilarSeedId] = useState<
    string | null
  >(null);
  const [similarSeedPlaces, setSimilarSeedPlaces] = useState<HomePlace[]>([]);
  const [similarPlaces, setSimilarPlaces] = useState<HomePlace[]>([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState<string | null>(null);

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
  }, [selectedSimilarSeedId]);

  useEffect(() => {
    if (!selectedMood) {
      setMoodPlaces([]);
      return;
    }
    let cancelled = false;
    const fetchMoodPlaces = async () => {
      setIsMoodLoading(true);
      try {
        const places = await homeService.fetchPlacesByMood(selectedMood);
        if (!cancelled) setMoodPlaces(places);
      } catch (err) {
        if (!cancelled) console.error("Failed to fetch mood places:", err);
      } finally {
        if (!cancelled) setIsMoodLoading(false);
      }
    };
    fetchMoodPlaces();
    return () => {
      cancelled = true;
    };
  }, [selectedMood]);

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
  }, [activeDiscoverySource]);

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
  }, [selectedDistrict, activeDiscoverySource]);

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
  }, [selectedVenueType, activeDiscoverySource]);

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
  }, [selectedPriceRange, activeDiscoverySource]);

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
  }, [selectedArea, activeDiscoverySource]);

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
      try {
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
      } catch (toggleError) {
        console.error("Failed to toggle save", toggleError);
      }
    },
    [rawCurated, rawTrending],
  );

  const applyFilters = useCallback(
    (list: HomePlace[]): HomePlace[] => {
      let result = [...list];

      if (search) {
        const q = search.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.address.toLowerCase().includes(q) ||
            (p.atmosphereTags ?? []).some((t) => t.toLowerCase().includes(q)),
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
        const CAIRO_LAT = 30.0444;
        const CAIRO_LNG = 31.2357;
        result = result.sort((a, b) => {
          const distA =
            Math.pow(a.latitude - CAIRO_LAT, 2) +
            Math.pow(a.longitude - CAIRO_LNG, 2);
          const distB =
            Math.pow(b.latitude - CAIRO_LAT, 2) +
            Math.pow(b.longitude - CAIRO_LNG, 2);
          return distA - distB;
        });
      }

      return result;
    },
    [search, selectedFilters],
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
    toggleSave,
    reloadPlaces: loadPlaces,
  };
};
