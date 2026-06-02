import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { useI18n } from "@/components/i18n";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useHome } from "@/features/home/hooks/useHomeHook";
import { useGuidedTour } from "@/features/home/hooks/useGuidedTour";
import { useSimilarVenueStudio } from "@/features/home/hooks/useSimilarVenueStudio";
import {
  useScrollRestoration,
  useGreetingKey,
  useSectionScrollIntoView,
  useScrollKeyTracker,
} from "@/features/home/hooks/usePageBehaviors";
import {
  DISCOVERY_SOURCE_OPTIONS,
  FILTER_OPTIONS,
  VENUE_PRICE_RANGE_OPTIONS,
} from "@/features/home/mocks";
import type { VenuePriceRange } from "@/features/home/types";
import { extractFirstName } from "@/features/home/utils/domainHelpers";
import {
  assembleHomeMotionBundle,
  composeVenueSearchRoute,
  flipOptionalSelection,
  launchVenueDetailTab,
  localizeDiscoverySourceChips,
  localizeQuickFilterChips,
  localizeVenuePriceBands,
  projectCategoryLabels,
  resolveDiscoveryLoadingGate,
  resolveMoodTranslation,
  resolveQuickSeedVenueStrip,
} from "@/features/home/utils/homePagePresentation";

export const useHomePage = () => {
  const { t, formatNumber } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion() ?? false;

  const [heroSearchDraft, setHeroSearchDraft] = useState("");
  const greetingKey = useGreetingKey();
  useScrollRestoration();

  const guidedTour = useGuidedTour();
  const {
    selectedFilters,
    toggleFilter,
    selectedMood,
    setSelectedMood,
    selectedDistrict,
    setSelectedDistrict,
    selectedVenueType,
    setSelectedVenueType,
    selectedPriceRange,
    setSelectedPriceRange,
    selectedArea,
    setSelectedArea,
    activeDiscoverySource,
    setActiveDiscoverySource,
    discoveryPlaces,
    isDiscoveryLoading,
    discoveryError,
    isGlobalTopRatedLoading,
    isTopRatedInAreaLoading,
    curatedPlaces,
    trendingPlaces,
    moodPlaces,
    isMoodLoading,
    moodError,
    userLocation,
    selectedSimilarSeedId,
    similarSeedPlaces,
    similarPlaces,
    isSimilarLoading,
    similarError,
    saveError,
    selectPlaceForSimilar,
    requestUserLocation,
    toggleSave,
    clearSaveError,
    isPlaceSavePending,
    retryDiscovery,
    retrySimilar,
    retryMood,
    isLoading,
    error,
    reloadPlaces,
    categories,
    moodOptions,
    popularDistricts,
  } = useHome();

  const discoveryScrollKey = useScrollKeyTracker(`${activeDiscoverySource}`);
  const filterScrollKey = useScrollKeyTracker(selectedFilters.join(","));
  const moodSectionRef = useRef<HTMLElement | null>(null);
  const scrollMoodPanelIntoView = useSectionScrollIntoView(moodSectionRef);

  const similarStudio = useSimilarVenueStudio({
    selectedSimilarSeedId,
    selectPlaceForSimilar,
    seedCandidatePool: similarSeedPlaces,
    defaultSeedOptions: curatedPlaces.slice(0, 6),
  });

  const homeMotion = useMemo(
    () => assembleHomeMotionBundle(prefersReducedMotion),
    [prefersReducedMotion],
  );

  const localizedFilters = useMemo(
    () => localizeQuickFilterChips(t, FILTER_OPTIONS),
    [t],
  );

  const localizedDiscoverySources = useMemo(
    () => localizeDiscoverySourceChips(t, DISCOVERY_SOURCE_OPTIONS),
    [t],
  );

  const localizedPriceRangeOptions = useMemo(
    () => localizeVenuePriceBands(t, VENUE_PRICE_RANGE_OPTIONS),
    [t],
  );

  const typeDiscoveryOptions = useMemo(
    () => projectCategoryLabels(categories, t),
    [categories, t],
  );

  const showDiscoverySkeleton = resolveDiscoveryLoadingGate(
    isDiscoveryLoading,
    activeDiscoverySource,
    isGlobalTopRatedLoading,
    isTopRatedInAreaLoading,
  );

  const selectedMoodOption = useMemo(
    () => moodOptions.find((mood) => mood.id === selectedMood) ?? null,
    [moodOptions, selectedMood],
  );

  const explorerFirstName = extractFirstName(
    user?.name,
    t("home.user.explorer"),
  );

  const quickSeedVenues = resolveQuickSeedVenueStrip(
    similarStudio.hasManuallySelectedSeed,
    similarSeedPlaces,
    curatedPlaces,
  );

  const translateMoodLabel = useCallback(
    (moodId: string, fallback: string) =>
      resolveMoodTranslation(t, moodId, "label", fallback),
    [t],
  );

  const translateMoodDescription = useCallback(
    (moodId: string, fallback: string) =>
      resolveMoodTranslation(t, moodId, "description", fallback),
    [t],
  );

  const openVenueDetailTab = useCallback((venueId: string) => {
    launchVenueDetailTab(venueId);
  }, []);

  const commitHeroSearchNavigation = useCallback(() => {
    const route = composeVenueSearchRoute(heroSearchDraft);
    if (route) navigate(route);
  }, [heroSearchDraft, navigate]);

  const commitPriceBandDiscovery = useCallback(
    (priceBand: VenuePriceRange) => {
      setSelectedPriceRange(
        flipOptionalSelection(selectedPriceRange, priceBand),
      );
      setActiveDiscoverySource("price-range");
    },
    [selectedPriceRange, setSelectedPriceRange, setActiveDiscoverySource],
  );

  const commitDistrictDiscovery = useCallback(
    (districtName: string, isActive: boolean) => {
      setSelectedDistrict(isActive ? null : districtName);
      setActiveDiscoverySource("district");
    },
    [setSelectedDistrict, setActiveDiscoverySource],
  );

  const commitVenueTypeDiscovery = useCallback(
    (typeId: string, isActive: boolean) => {
      setSelectedVenueType(isActive ? null : typeId);
      setActiveDiscoverySource("type");
    },
    [setSelectedVenueType, setActiveDiscoverySource],
  );

  const commitAreaTopRatedDiscovery = useCallback(
    (areaName: string) => {
      setSelectedArea(areaName);
      setActiveDiscoverySource("top-rated-area");
    },
    [setSelectedArea, setActiveDiscoverySource],
  );

  const commitMoodSelection = useCallback(
    (moodId: string, isActive: boolean) => {
      if (isActive) {
        setSelectedMood(null);
        return;
      }
      setSelectedMood(moodId);
      scrollMoodPanelIntoView();
    },
    [setSelectedMood, scrollMoodPanelIntoView],
  );

  const navigateToMoodSeeAll = useCallback(
    (moodId: string) => navigate(`/home/see-all/mood/${moodId}`),
    [navigate],
  );

  const navigateToSeeAll = useCallback(
    (segment: "curated" | "trending") => navigate(`/home/see-all/${segment}`),
    [navigate],
  );

  const reloadDocument = useCallback(() => {
    window.location.reload();
  }, []);

  return {
    t,
    shouldReduceMotion: prefersReducedMotion,
    greetingKey,
    formatNumber,
    explorerFirstName,
    heroSearchDraft,
    setHeroSearchDraft,
    homeMotion,
    moodSectionRef,
    discoveryScrollKey,
    filterScrollKey,
    localizedFilters,
    localizedDiscoverySources,
    localizedPriceRangeOptions,
    typeDiscoveryOptions,
    showDiscoverySkeleton,
    selectedMoodOption,
    quickSeedVenues,
    translateMoodLabel,
    translateMoodDescription,
    openVenueDetailTab,
    commitHeroSearchNavigation,
    commitPriceBandDiscovery,
    commitDistrictDiscovery,
    commitVenueTypeDiscovery,
    commitAreaTopRatedDiscovery,
    commitMoodSelection,
    navigateToMoodSeeAll,
    navigateToSeeAll,
    reloadDocument,
    tourActive: guidedTour.tourActive,
    currentStep: guidedTour.currentStep,
    totalSteps: guidedTour.totalSteps,
    tourNext: guidedTour.next,
    tourPrev: guidedTour.prev,
    tourSkip: guidedTour.skip,
    tourFinish: guidedTour.finish,
    tourJumpTo: guidedTour.jumpTo,
    ...similarStudio,
    selectedFilters,
    toggleFilter,
    selectedMood,
    setSelectedMood,
    selectedDistrict,
    selectedVenueType,
    selectedPriceRange,
    selectedArea,
    activeDiscoverySource,
    setActiveDiscoverySource,
    discoveryPlaces,
    discoveryError,
    curatedPlaces,
    trendingPlaces,
    moodPlaces,
    isMoodLoading,
    moodError,
    userLocation,
    selectedSimilarSeedId,
    similarPlaces,
    isSimilarLoading,
    similarError,
    saveError,
    requestUserLocation,
    toggleSave,
    clearSaveError,
    isPlaceSavePending,
    retryDiscovery,
    retrySimilar,
    retryMood,
    isLoading,
    error,
    reloadPlaces,
    moodOptions,
    popularDistricts,
  };
};
