import {
  Compass,
  Flame,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type {
  DiscoverySource,
  HomePlace,
  UserLocationState,
} from "@/features/home/types";
import { getDistanceDisplayState } from "@/features/home/utils/distance";
import {
  PRICE_LEVEL_META,
  type CanonicalPriceLevel,
} from "@/utils/priceLevels";

export const MAP_ATLAS_EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

export type MapAtlasVisibleSource = "discovery" | "curated" | "trending";

export const MAP_ATLAS_SOURCE_IDS: MapAtlasVisibleSource[] = [
  "discovery",
  "curated",
  "trending",
];

export const MAP_ATLAS_SOURCE_META: Record<
  MapAtlasVisibleSource,
  { icon: LucideIcon; fallbackLabel: string }
> = {
  discovery: { icon: Compass, fallbackLabel: "Discovery" },
  curated: { icon: Sparkles, fallbackLabel: "Curated" },
  trending: { icon: Flame, fallbackLabel: "Trending" },
};

export const MAP_ATLAS_RATING_FILTERS = [
  { value: 0, key: "all", label: "All ratings" },
  { value: 4, key: "4plus", label: "4.0+" },
  { value: 4.5, key: "45plus", label: "4.5+" },
] as const;

type TranslateFn = (
  key: string,
  params?: Record<string, string | number>,
  fallback?: string,
) => string;

type FormatNumberFn = (
  value: number,
  options?: Intl.NumberFormatOptions,
) => string;

export interface MapAtlasSourceTabOption {
  id: MapAtlasVisibleSource;
  label: string;
  count: number;
}

export interface MapAtlasLocalizedOption {
  id: string;
  label: string;
}

const LOCATION_STATUS_COPY: Record<
  UserLocationState["status"] | "idle",
  { key: string; fallback: string }
> = {
  granted: {
    key: "mapAtlas.location.granted",
    fallback: "Location active",
  },
  loading: {
    key: "mapAtlas.location.loading",
    fallback: "Locating...",
  },
  denied: {
    key: "mapAtlas.location.denied",
    fallback: "Location denied. Use browser settings to enable it.",
  },
  unsupported: {
    key: "mapAtlas.location.unsupported",
    fallback: "Geolocation is not supported on this browser.",
  },
  unavailable: {
    key: "mapAtlas.location.unavailable",
    fallback: "Location unavailable right now.",
  },
  error: {
    key: "mapAtlas.location.error",
    fallback: "Could not read your location.",
  },
  idle: {
    key: "mapAtlas.location.idle",
    fallback: "Enable location to unlock near-me guidance.",
  },
};

export const buildMapAtlasSourcePlaces = (payload: {
  discoveryPlaces: HomePlace[];
  curatedPlaces: HomePlace[];
  trendingPlaces: HomePlace[];
}): Record<MapAtlasVisibleSource, HomePlace[]> => ({
  discovery: payload.discoveryPlaces,
  curated: payload.curatedPlaces,
  trending: payload.trendingPlaces,
});

export const buildMapAtlasSourceTabOptions = (
  sourcePlaces: Record<MapAtlasVisibleSource, HomePlace[]>,
  t: TranslateFn,
): MapAtlasSourceTabOption[] =>
  MAP_ATLAS_SOURCE_IDS.map((sourceId) => ({
    id: sourceId,
    label: t(
      `mapAtlas.source.${sourceId}`,
      undefined,
      MAP_ATLAS_SOURCE_META[sourceId].fallbackLabel,
    ),
    count: sourcePlaces[sourceId].length,
  }));

export const filterMapPlacesByMinimumRating = (
  places: HomePlace[],
  minimumRating: number,
): HomePlace[] => places.filter((place) => place.rating >= minimumRating);

export const resolveMapAtlasSelectedPlaceId = (
  mapPlaces: HomePlace[],
  pinnedPlaceId: string | null,
): string | null => {
  if (mapPlaces.length === 0) return null;

  const pinnedStillVisible =
    pinnedPlaceId !== null &&
    mapPlaces.some((place) => place.id === pinnedPlaceId);

  return pinnedStillVisible ? pinnedPlaceId : mapPlaces[0]?.id ?? null;
};

export const findMapAtlasSelectedPlace = (
  mapPlaces: HomePlace[],
  selectedPlaceId: string | null,
): HomePlace | null =>
  selectedPlaceId === null
    ? null
    : (mapPlaces.find((place) => place.id === selectedPlaceId) ?? null);

export const resolveMapAtlasSourceLoading = (
  selectedSource: MapAtlasVisibleSource,
  isDiscoveryLoading: boolean,
  isCuratedTrendingLoading: boolean,
): boolean =>
  (selectedSource === "discovery" && isDiscoveryLoading) ||
  ((selectedSource === "curated" || selectedSource === "trending") &&
    isCuratedTrendingLoading);

export const resolveMapAtlasSourceError = (
  selectedSource: MapAtlasVisibleSource,
  discoveryError: string | null,
): string | null => (selectedSource === "discovery" ? discoveryError : null);

export const resolveMapAtlasLocationStatusLabel = (
  status: UserLocationState["status"],
  t: TranslateFn,
): string => {
  const copy = LOCATION_STATUS_COPY[status] ?? LOCATION_STATUS_COPY.idle;
  return t(copy.key, undefined, copy.fallback);
};

export const resolveMapAtlasOpenStatusLabel = (
  isOpen: boolean | null | undefined,
  t: TranslateFn,
): string => {
  if (isOpen === true) return t("home.place.open");
  if (isOpen === false) return t("home.place.closed");
  return t("home.place.unknown");
};

export const resolveMapAtlasOpenStatusToneClass = (
  isOpen: boolean | null | undefined,
): string => {
  if (isOpen === true) {
    return "border-emerald-300/70 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (isOpen === false) {
    return "border-border/70 bg-muted/60 text-muted-foreground";
  }
  return "border-amber-300/70 bg-amber-500/10 text-amber-700 dark:text-amber-300";
};

export const placeHasValidDirections = (place: HomePlace): boolean =>
  Number.isFinite(place.latitude) && Number.isFinite(place.longitude);

export const formatMapAtlasAverageRatingDisplay = (
  averageRating: number,
  formatNumber: FormatNumberFn,
): string =>
  averageRating > 0
    ? formatNumber(averageRating, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
    : "-";

export const formatAtlasPlaceDistanceLabel = (
  userLocation: UserLocationState,
  place: HomePlace,
  formatNumber: FormatNumberFn,
  t: TranslateFn,
): string | null => {
  const distanceState = getDistanceDisplayState(
    userLocation,
    place.latitude,
    place.longitude,
  );

  if (distanceState.kind !== "distance") return null;

  const { valueKm } = distanceState;
  if (!Number.isFinite(valueKm) || valueKm < 0) return null;

  if (valueKm < 1) {
    return t(
      "mapAtlas.distance.fromMeMeters",
      {
        distance: formatNumber(Math.max(1, Math.round(valueKm * 1000))),
      },
      "{distance} m from me",
    );
  }

  const roundedKm =
    valueKm < 10 ? Number(valueKm.toFixed(1)) : Math.round(valueKm);

  return t(
    "mapAtlas.distance.fromMeKm",
    { distance: formatNumber(roundedKm) },
    "{distance} km from me",
  );
};

export const createMapAtlasBudgetLabelResolver =
  (t: TranslateFn) =>
  (priceLevel: CanonicalPriceLevel): string =>
    t(
      `budget.${priceLevel}`,
      undefined,
      `${PRICE_LEVEL_META[priceLevel].label} (${PRICE_LEVEL_META[priceLevel].symbol})`,
    );

export const createMapAtlasDistrictLabelResolver =
  (t: TranslateFn) =>
  (districtId: string, fallbackName: string): string =>
    t(`onboarding.district.${districtId}`, undefined, fallbackName);

export const createMapAtlasCategoryLabelResolver =
  (t: TranslateFn) =>
  (categoryId: string, fallbackLabel: string): string =>
    t(`mapAtlas.category.${categoryId}`, undefined, fallbackLabel);

export const localizeDiscoverySourceOptions = <
  T extends { id: DiscoverySource; label: string; icon: LucideIcon },
>(
  options: T[],
  t: TranslateFn,
): T[] =>
  options.map((source) => ({
    ...source,
    label: t(`home.discovery.source.${source.id}`, undefined, source.label),
  }));

export const localizeVenueTypeOptions = (
  categories: Array<{ id: string; label: string }>,
  categoryLabel: (categoryId: string, fallbackLabel: string) => string,
): MapAtlasLocalizedOption[] =>
  categories.map((category) => ({
    id: category.id,
    label: categoryLabel(category.id, category.label),
  }));

export const localizePriceRangeOptions = <
  T extends { id: CanonicalPriceLevel; caption: string },
>(
  options: T[],
  budgetLabel: (priceLevel: CanonicalPriceLevel) => string,
): Array<T & { label: string }> =>
  options.map((option) => ({
    ...option,
    label: budgetLabel(option.id),
  }));

export const findDistrictByName = <
  T extends { id: string; name: string },
>(
  districts: T[],
  districtName: string | null,
): T | null =>
  districtName === null
    ? null
    : (districts.find((district) => district.name === districtName) ?? null);

export const shouldShowNearYouDistrictHint = (
  activeDiscoverySource: DiscoverySource,
  autoSelectedDistrictId: string | null,
  selectedDistrictRecord: { id: string } | null,
): boolean =>
  activeDiscoverySource === "district" &&
  autoSelectedDistrictId !== null &&
  selectedDistrictRecord?.id === autoSelectedDistrictId;

export const resolveMapAtlasSourceTabLabel = (
  sourceOptions: MapAtlasSourceTabOption[],
  selectedSource: MapAtlasVisibleSource,
): string =>
  sourceOptions.find((source) => source.id === selectedSource)?.label ??
  MAP_ATLAS_SOURCE_META[selectedSource].fallbackLabel;

export const isMapAtlasFilterActive = (
  filterId: string,
  selectedFilters: string[],
): boolean =>
  filterId === "all"
    ? selectedFilters.length === 0
    : selectedFilters.includes(filterId);

export const toggleNullableSelection = <T>(
  current: T | null,
  candidate: T,
): T | null => (current === candidate ? null : candidate);

export const scheduleMapViewportScroll = (
  viewportElement: HTMLElement | null,
  prefersReducedMotion: boolean,
): void => {
  if (!viewportElement) return;

  const scrollIntoView = () => {
    viewportElement.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  if (typeof window === "undefined") {
    scrollIntoView();
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(scrollIntoView);
  });
};
