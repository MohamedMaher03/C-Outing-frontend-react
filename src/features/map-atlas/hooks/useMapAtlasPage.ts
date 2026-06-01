import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { useI18n } from "@/components/i18n";
import { useTheme } from "@/components/theme/useTheme";
import {
  DISCOVERY_SOURCE_OPTIONS,
  VENUE_PRICE_RANGE_OPTIONS,
} from "@/features/home/mocks";
import type { HomePlace } from "@/features/home/types";
import {
  INTERACTION_ACTION_TYPES,
  trackVenueInteractionSafe,
} from "@/features/interactions";
import { useMapAtlas } from "@/features/map-atlas/hooks/useMapAtlas";
import {
  buildGoogleMapsDirectionsUrl,
  computeMapAtlasStats,
} from "@/features/map-atlas/utils/mapAtlas";
import {
  buildMapAtlasSourcePlaces,
  buildMapAtlasSourceTabOptions,
  createMapAtlasBudgetLabelResolver,
  createMapAtlasCategoryLabelResolver,
  createMapAtlasDistrictLabelResolver,
  filterMapPlacesByMinimumRating,
  findDistrictByName,
  findMapAtlasSelectedPlace,
  formatAtlasPlaceDistanceLabel,
  formatMapAtlasAverageRatingDisplay,
  localizeDiscoverySourceOptions,
  localizePriceRangeOptions,
  localizeVenueTypeOptions,
  resolveMapAtlasLocationStatusLabel,
  resolveMapAtlasSelectedPlaceId,
  resolveMapAtlasSourceError,
  resolveMapAtlasSourceLoading,
  resolveMapAtlasSourceTabLabel,
  scheduleMapViewportScroll,
  shouldShowNearYouDistrictHint,
  type MapAtlasVisibleSource,
} from "@/features/map-atlas/utils/mapAtlasPresentation";

export const useMapAtlasPage = () => {
  const navigate = useNavigate();
  const { t, formatNumber } = useI18n();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { resolvedTheme } = useTheme();

  const atlasData = useMapAtlas();

  const [visibleSource, setVisibleSource] =
    useState<MapAtlasVisibleSource>("discovery");
  const [pinnedPlaceId, setPinnedPlaceId] = useState<string | null>(null);
  const [minimumRating, setMinimumRating] = useState(0);
  const [fitRequestToken, setFitRequestToken] = useState(0);
  const [centerUserRequestToken, setCenterUserRequestToken] = useState(0);
  const mapViewportRef = useRef<HTMLElement | null>(null);

  const budgetLabel = useMemo(
    () => createMapAtlasBudgetLabelResolver(t),
    [t],
  );
  const districtLabel = useMemo(
    () => createMapAtlasDistrictLabelResolver(t),
    [t],
  );
  const categoryLabel = useMemo(
    () => createMapAtlasCategoryLabelResolver(t),
    [t],
  );

  const sourcePlaces = useMemo(
    () =>
      buildMapAtlasSourcePlaces({
        discoveryPlaces: atlasData.discoveryPlaces,
        curatedPlaces: atlasData.curatedPlaces,
        trendingPlaces: atlasData.trendingPlaces,
      }),
    [
      atlasData.curatedPlaces,
      atlasData.discoveryPlaces,
      atlasData.trendingPlaces,
    ],
  );

  const sourceTabOptions = useMemo(
    () => buildMapAtlasSourceTabOptions(sourcePlaces, t),
    [sourcePlaces, t],
  );

  const activeSourcePlaces = sourcePlaces[visibleSource];

  const mapPlaces = useMemo(
    () => filterMapPlacesByMinimumRating(activeSourcePlaces, minimumRating),
    [activeSourcePlaces, minimumRating],
  );

  const selectedPlaceId = useMemo(
    () => resolveMapAtlasSelectedPlaceId(mapPlaces, pinnedPlaceId),
    [mapPlaces, pinnedPlaceId],
  );

  const selectedPlace = findMapAtlasSelectedPlace(mapPlaces, selectedPlaceId);

  const sourceIsLoading = resolveMapAtlasSourceLoading(
    visibleSource,
    atlasData.isDiscoveryLoading,
    atlasData.isCuratedTrendingLoading,
  );

  const sourceError = resolveMapAtlasSourceError(
    visibleSource,
    atlasData.discoveryError,
  );

  const mapStats = useMemo(() => computeMapAtlasStats(mapPlaces), [mapPlaces]);

  const locationStatusLabel = useMemo(
    () =>
      resolveMapAtlasLocationStatusLabel(atlasData.userLocation.status, t),
    [atlasData.userLocation.status, t],
  );

  const discoverySourceOptions = useMemo(
    () => localizeDiscoverySourceOptions(DISCOVERY_SOURCE_OPTIONS, t),
    [t],
  );

  const venueTypeOptions = useMemo(
    () => localizeVenueTypeOptions(atlasData.categories, categoryLabel),
    [atlasData.categories, categoryLabel],
  );

  const priceRangeOptions = useMemo(
    () => localizePriceRangeOptions(VENUE_PRICE_RANGE_OPTIONS, budgetLabel),
    [budgetLabel],
  );

  const selectedDistrictRecord = useMemo(
    () =>
      findDistrictByName(atlasData.popularDistricts, atlasData.selectedDistrict),
    [atlasData.popularDistricts, atlasData.selectedDistrict],
  );

  const nearYouDistrictHintVisible = shouldShowNearYouDistrictHint(
    atlasData.activeDiscoverySource,
    atlasData.autoSelectedDistrictId,
    selectedDistrictRecord,
  );

  const activeSourceLabel = resolveMapAtlasSourceTabLabel(
    sourceTabOptions,
    visibleSource,
  );

  const averageRatingDisplay = formatMapAtlasAverageRatingDisplay(
    mapStats.averageRating,
    formatNumber,
  );

  const scrollToMapViewport = useCallback(() => {
    scheduleMapViewportScroll(mapViewportRef.current, prefersReducedMotion);
  }, [prefersReducedMotion]);

  const retryVisibleSource = useCallback(() => {
    if (visibleSource === "discovery") {
      atlasData.retryDiscovery();
      return;
    }

    if (visibleSource === "curated" || visibleSource === "trending") {
      atlasData.retryCuratedTrending();
      return;
    }

    void atlasData.reloadPlaces();
  }, [atlasData, visibleSource]);

  const fitMapToResults = useCallback(() => {
    scrollToMapViewport();
    setFitRequestToken((token) => token + 1);
  }, [scrollToMapViewport]);

  const centerMapOnUser = useCallback(() => {
    scrollToMapViewport();

    const { userLocation, requestUserLocation } = atlasData;
    if (userLocation.status !== "granted" || !userLocation.coordinates) {
      requestUserLocation();
      return;
    }

    setCenterUserRequestToken((token) => token + 1);
  }, [atlasData, scrollToMapViewport]);

  const openVenueDirections = useCallback((place: HomePlace) => {
    if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) {
      return;
    }

    const mapsUrl = buildGoogleMapsDirectionsUrl(
      place.latitude,
      place.longitude,
      place.name,
    );

    window.open(mapsUrl, "_blank", "noopener,noreferrer");
    void trackVenueInteractionSafe(place.id, INTERACTION_ACTION_TYPES.directions);
  }, []);

  const openVenueDetail = useCallback(
    (venueId: string) => navigate(`/venue/${venueId}`),
    [navigate],
  );

  const returnHome = useCallback(() => navigate("/"), [navigate]);

  const resolvePlaceDistanceLabel = useCallback(
    (place: HomePlace) =>
      formatAtlasPlaceDistanceLabel(
        atlasData.userLocation,
        place,
        formatNumber,
        t,
      ),
    [atlasData.userLocation, formatNumber, t],
  );

  const selectDistrict = useCallback(
    (districtName: string, isCurrentlyActive: boolean) => {
      atlasData.setSelectedDistrict(isCurrentlyActive ? null : districtName);
      atlasData.setActiveDiscoverySource("district");
    },
    [atlasData],
  );

  const selectVenueType = useCallback(
    (typeId: string, isCurrentlyActive: boolean) => {
      atlasData.setSelectedVenueType(isCurrentlyActive ? null : typeId);
      atlasData.setActiveDiscoverySource("type");
    },
    [atlasData],
  );

  const selectPriceRange = useCallback(
    (
      priceRangeId: (typeof VENUE_PRICE_RANGE_OPTIONS)[number]["id"],
      isCurrentlyActive: boolean,
    ) => {
      atlasData.setSelectedPriceRange(isCurrentlyActive ? null : priceRangeId);
      atlasData.setActiveDiscoverySource("price-range");
    },
    [atlasData],
  );

  const selectTopRatedArea = useCallback(
    (areaName: string) => {
      atlasData.setSelectedArea(areaName);
      atlasData.setActiveDiscoverySource("top-rated-area");
    },
    [atlasData],
  );

  return {
    t,
    formatNumber,
    prefersReducedMotion,
    resolvedTheme,
    mapViewportRef,
    ...atlasData,
    visibleSource,
    setVisibleSource,
    pinnedPlaceId,
    setPinnedPlaceId,
    minimumRating,
    setMinimumRating,
    fitRequestToken,
    centerUserRequestToken,
    sourceTabOptions,
    mapPlaces,
    selectedPlaceId,
    selectedPlace,
    sourceIsLoading,
    sourceError,
    mapStats,
    locationStatusLabel,
    discoverySourceOptions,
    venueTypeOptions,
    priceRangeOptions,
    selectedDistrictRecord,
    nearYouDistrictHintVisible,
    activeSourceLabel,
    averageRatingDisplay,
    budgetLabel,
    districtLabel,
    retryVisibleSource,
    fitMapToResults,
    centerMapOnUser,
    openVenueDirections,
    openVenueDetail,
    returnHome,
    resolvePlaceDistanceLabel,
    selectDistrict,
    selectVenueType,
    selectPriceRange,
    selectTopRatedArea,
  };
};
