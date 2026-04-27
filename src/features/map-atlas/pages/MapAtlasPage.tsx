import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Bookmark,
  Compass,
  Flame,
  Heart,
  Layers3,
  LocateFixed,
  MapPinned,
  Navigation,
  RefreshCcw,
  Search,
  Sparkles,
  Star,
  WandSparkles,
  Wifi,
  Clock3,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import "@/features/map-atlas/components/map-atlas.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { useI18n } from "@/components/i18n";
import { useTheme } from "@/components/theme/useTheme";
import { cn } from "@/lib/utils";
import MapAtlasCanvas from "@/features/map-atlas/components/MapAtlasCanvas";
import { FILTER_OPTIONS } from "@/features/home/mocks";
import { useMapAtlas } from "@/features/map-atlas/hooks/useMapAtlas";
import {
  INTERACTION_ACTION_TYPES,
  trackVenueInteractionSafe,
} from "@/features/interactions";
import type { DiscoverySource, HomePlace } from "@/features/home/types";
import type { MapAtlasSource } from "@/features/map-atlas/types";
import {
  buildGoogleMapsDirectionsUrl,
  computeMapAtlasStats,
} from "@/features/map-atlas/utils/mapAtlas";
import {
  PRICE_LEVEL_META,
  PRICE_LEVEL_VALUES,
  type CanonicalPriceLevel,
} from "@/utils/priceLevels";

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

type MapAtlasVisibleSource = Exclude<MapAtlasSource, "mood">;

const SOURCE_META: Record<
  MapAtlasVisibleSource,
  { icon: LucideIcon; fallbackLabel: string }
> = {
  discovery: {
    icon: Compass,
    fallbackLabel: "Discovery",
  },
  curated: {
    icon: Sparkles,
    fallbackLabel: "Curated",
  },
  trending: {
    icon: Flame,
    fallbackLabel: "Trending",
  },
  similar: {
    icon: WandSparkles,
    fallbackLabel: "Similar",
  },
};

const SOURCE_IDS: MapAtlasVisibleSource[] = [
  "discovery",
  "curated",
  "trending",
  "similar",
];

const RATING_FILTERS = [
  { value: 0, key: "all", label: "All ratings" },
  { value: 4, key: "4plus", label: "4.0+" },
  { value: 4.5, key: "45plus", label: "4.5+" },
] as const;

export default function MapAtlasPage() {
  const navigate = useNavigate();
  const { t, formatNumber } = useI18n();
  const shouldReduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();

  const {
    search,
    setSearch,
    selectedFilters,
    toggleFilter,
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
    curatedPlaces,
    trendingPlaces,
    selectedSimilarSeedId,
    similarSeedPlaces,
    similarPlaces,
    isSimilarLoading,
    similarError,
    selectPlaceForSimilar,
    requestUserLocation,
    toggleSave,
    isPlaceSavePending,
    retryDiscovery,
    retrySimilar,
    isLoading,
    error,
    reloadPlaces,
    categories,
    popularDistricts,
    userLocation,
    saveError,
    clearSaveError,
  } = useMapAtlas();

  const [selectedSource, setSelectedSource] =
    useState<MapAtlasVisibleSource>("discovery");
  const [selectedPlaceIdState, setSelectedPlaceIdState] = useState<
    string | null
  >(null);
  const [minimumRating, setMinimumRating] = useState<number>(0);
  const [fitRequestToken, setFitRequestToken] = useState(0);
  const [centerUserRequestToken, setCenterUserRequestToken] = useState(0);
  const mapViewportRef = useRef<HTMLElement | null>(null);

  const sourcePlaces = useMemo(
    () => ({
      discovery: discoveryPlaces,
      curated: curatedPlaces,
      trending: trendingPlaces,
      similar: similarPlaces,
    }),
    [curatedPlaces, discoveryPlaces, similarPlaces, trendingPlaces],
  );

  const sourceOptions = useMemo(
    () =>
      SOURCE_IDS.map((sourceId) => ({
        id: sourceId,
        label: t(
          `mapAtlas.source.${sourceId}`,
          undefined,
          SOURCE_META[sourceId].fallbackLabel,
        ),
        count: sourcePlaces[sourceId].length,
      })),
    [sourcePlaces, t],
  );

  const sourceData = sourcePlaces[selectedSource];

  const mapPlaces = useMemo(
    () => sourceData.filter((place) => place.rating >= minimumRating),
    [minimumRating, sourceData],
  );

  const selectedPlaceId = useMemo(() => {
    if (mapPlaces.length === 0) {
      return null;
    }

    if (
      selectedPlaceIdState &&
      mapPlaces.some((place) => place.id === selectedPlaceIdState)
    ) {
      return selectedPlaceIdState;
    }

    return mapPlaces[0].id;
  }, [mapPlaces, selectedPlaceIdState]);

  const selectedPlace =
    selectedPlaceId !== null
      ? (mapPlaces.find((place) => place.id === selectedPlaceId) ?? null)
      : null;

  const sourceIsLoading =
    (selectedSource === "discovery" && isDiscoveryLoading) ||
    (selectedSource === "similar" && isSimilarLoading);

  const sourceError =
    selectedSource === "discovery"
      ? discoveryError
      : selectedSource === "similar"
        ? similarError
        : null;

  const stats = useMemo(() => computeMapAtlasStats(mapPlaces), [mapPlaces]);

  const locationStatus = useMemo(() => {
    if (userLocation.status === "granted") {
      return t("mapAtlas.location.granted", undefined, "Location active");
    }

    if (userLocation.status === "loading") {
      return t("mapAtlas.location.loading", undefined, "Locating...");
    }

    if (userLocation.status === "denied") {
      return t(
        "mapAtlas.location.denied",
        undefined,
        "Location denied. Use browser settings to enable it.",
      );
    }

    if (userLocation.status === "unsupported") {
      return t(
        "mapAtlas.location.unsupported",
        undefined,
        "Geolocation is not supported on this browser.",
      );
    }

    if (userLocation.status === "unavailable") {
      return t(
        "mapAtlas.location.unavailable",
        undefined,
        "Location unavailable right now.",
      );
    }

    if (userLocation.status === "error") {
      return t(
        "mapAtlas.location.error",
        undefined,
        "Could not read your location.",
      );
    }

    return t(
      "mapAtlas.location.idle",
      undefined,
      "Enable location to unlock near-me guidance.",
    );
  }, [t, userLocation.status]);

  const retryCurrentSource = () => {
    if (selectedSource === "discovery") {
      retryDiscovery();
      return;
    }

    if (selectedSource === "similar") {
      retrySimilar();
      return;
    }

    void reloadPlaces();
  };

  const scrollToMapViewport = useCallback(() => {
    if (!mapViewportRef.current) {
      return;
    }

    const performScroll = () => {
      mapViewportRef.current?.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "start",
      });
    };

    if (typeof window === "undefined") {
      performScroll();
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(performScroll);
    });
  }, [shouldReduceMotion]);

  const handleFitResults = () => {
    scrollToMapViewport();
    setFitRequestToken((current) => current + 1);
  };

  const handleCenterOnMe = () => {
    scrollToMapViewport();

    if (userLocation.status !== "granted" || !userLocation.coordinates) {
      requestUserLocation();
      return;
    }

    setCenterUserRequestToken((current) => current + 1);
  };

  const handleOpenDirections = (place: HomePlace) => {
    if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) {
      return;
    }

    const mapsUrl = buildGoogleMapsDirectionsUrl(
      place.latitude,
      place.longitude,
      place.name,
    );

    window.open(mapsUrl, "_blank", "noopener,noreferrer");
    void trackVenueInteractionSafe(
      place.id,
      INTERACTION_ACTION_TYPES.directions,
    );
  };

  const discoveryModeLabel = t(
    `home.discovery.source.${activeDiscoverySource}`,
    undefined,
    activeDiscoverySource,
  );

  const getLocalizedBudgetLabel = useCallback(
    (priceLevel: CanonicalPriceLevel) =>
      t(
        `budget.${priceLevel}`,
        undefined,
        `${PRICE_LEVEL_META[priceLevel].label} (${PRICE_LEVEL_META[priceLevel].symbol})`,
      ),
    [t],
  );

  const getLocalizedDistrictName = useCallback(
    (districtId: string, fallbackName: string) =>
      t(`onboarding.district.${districtId}`, undefined, fallbackName),
    [t],
  );

  const getLocalizedCategoryName = useCallback(
    (categoryId: string, fallbackLabel: string) =>
      t(`mapAtlas.category.${categoryId}`, undefined, fallbackLabel),
    [t],
  );

  if (isLoading) {
    return (
      <PageLoading
        text={t("mapAtlas.loading.title", undefined, "Loading Map Atlas")}
        subText={t(
          "mapAtlas.loading.subtitle",
          undefined,
          "Preparing Cairo pins and personalized places...",
        )}
      />
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center px-4 py-10">
        <section className="w-full rounded-3xl border border-destructive/25 bg-destructive/5 p-6 sm:p-8">
          <p className="text-role-caption uppercase text-destructive">
            {t("mapAtlas.error.badge", undefined, "Map Atlas unavailable")}
          </p>
          <h1 className="mt-2 text-role-heading text-foreground text-safe-wrap">
            {t(
              "mapAtlas.error.title",
              undefined,
              "We could not load your map experience right now",
            )}
          </h1>
          <p className="mt-2 text-role-secondary text-measure-comfortable text-muted-foreground">
            {error}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" onClick={() => void reloadPlaces()}>
              <RefreshCcw className="h-4 w-4" />
              {t("common.retry")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
            >
              {t("mapAtlas.error.backHome", undefined, "Back to Home")}
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : 0.22,
        ease: EASE_OUT_QUART,
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 md:gap-6 md:py-7">
        <section className="overflow-hidden rounded-3xl border border-border/65 bg-card/90 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-role-caption inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-foreground">
                <MapPinned className="h-3.5 w-3.5 text-secondary dark:text-primary" />
                {t("mapAtlas.badge", undefined, "Cairo Atlas")}
              </p>
              <h1 className="mt-2 text-role-heading text-foreground text-safe-wrap">
                {t("mapAtlas.title", undefined, "Map-First Place Discovery")}
              </h1>
              <p className="mt-1 text-role-secondary text-measure-comfortable text-muted-foreground">
                {t(
                  "mapAtlas.subtitle",
                  undefined,
                  "Switch recommendation sources, inspect clusters, and pick your next place directly from Cairo's map.",
                )}
              </p>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full px-4 max-sm:flex-1"
                onClick={handleFitResults}
              >
                <Layers3 className="h-4 w-4" />
                {t("mapAtlas.action.fit", undefined, "Fit results")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full px-4 max-sm:flex-1"
                onClick={handleCenterOnMe}
                disabled={userLocation.status === "loading"}
              >
                <LocateFixed className="h-4 w-4" />
                {t("mapAtlas.action.centerMe", undefined, "Center on me")}
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_1fr]">
            <div className="relative">
              <Label htmlFor="map-atlas-search" className="sr-only">
                {t("mapAtlas.search.label", undefined, "Search map places")}
              </Label>
              <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="map-atlas-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                maxLength={140}
                placeholder={t(
                  "mapAtlas.search.placeholder",
                  undefined,
                  "Search by place, district, category, or atmosphere tag...",
                )}
                className="h-11 rounded-2xl border-border/70 bg-background pl-11"
              />
            </div>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
              {FILTER_OPTIONS.map((filter) => {
                const active =
                  filter.id === "all"
                    ? selectedFilters.length === 0
                    : selectedFilters.includes(filter.id);
                const Icon = filter.icon;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => toggleFilter(filter.id)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      active
                        ? "border-primary/80 bg-primary text-primary-foreground"
                        : "border-border/70 bg-card hover:border-primary/55 hover:bg-primary/12",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t(`home.filter.${filter.id}`, undefined, filter.label)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
            {sourceOptions.map((source) => {
              const Icon = SOURCE_META[source.id].icon;
              const active = selectedSource === source.id;

              return (
                <button
                  key={`map-source-${source.id}`}
                  type="button"
                  onClick={() => setSelectedSource(source.id)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    active
                      ? "border-primary/85 bg-primary text-primary-foreground"
                      : "border-border/70 bg-card hover:border-primary/55 hover:bg-primary/12",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{source.label}</span>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                      active
                        ? "border-primary-foreground/35 bg-primary-foreground/18 text-primary-foreground"
                        : "border-border/70 bg-muted/60 text-muted-foreground",
                    )}
                  >
                    {formatNumber(source.count)}
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence initial={false} mode="wait">
            {selectedSource === "discovery" && (
              <motion.div
                key="discovery-controls"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.2 }}
                className="mt-4 space-y-3 rounded-2xl border border-border/65 bg-background/65 p-3"
              >
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
                  {(
                    [
                      "district",
                      "type",
                      "price-range",
                      "top-rated",
                      "top-rated-area",
                    ] as DiscoverySource[]
                  ).map((sourceId) => {
                    const active = activeDiscoverySource === sourceId;
                    return (
                      <button
                        key={`discovery-lens-${sourceId}`}
                        type="button"
                        onClick={() => setActiveDiscoverySource(sourceId)}
                        className={cn(
                          "inline-flex min-h-11 items-center rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                          active
                            ? "border-primary/85 bg-primary text-primary-foreground"
                            : "border-border/70 bg-card hover:border-primary/55 hover:bg-primary/10",
                        )}
                      >
                        {t(
                          `home.discovery.source.${sourceId}`,
                          undefined,
                          sourceId,
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {activeDiscoverySource === "district" && (
                    <div>
                      <Label
                        htmlFor="map-atlas-discovery-district"
                        className="sr-only"
                      >
                        {t(
                          "mapAtlas.discovery.district",
                          undefined,
                          "Select district",
                        )}
                      </Label>
                      <select
                        id="map-atlas-discovery-district"
                        value={selectedDistrict ?? ""}
                        onChange={(event) =>
                          setSelectedDistrict(event.target.value || null)
                        }
                        className="h-11 w-full rounded-xl border border-border/70 bg-card px-3 text-sm"
                      >
                        <option value="">
                          {t(
                            "mapAtlas.discovery.district",
                            undefined,
                            "Select district",
                          )}
                        </option>
                        {popularDistricts.map((district) => (
                          <option key={district.id} value={district.name}>
                            {getLocalizedDistrictName(
                              district.id,
                              district.name,
                            )}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {activeDiscoverySource === "type" && (
                    <div>
                      <Label
                        htmlFor="map-atlas-discovery-type"
                        className="sr-only"
                      >
                        {t(
                          "mapAtlas.discovery.type",
                          undefined,
                          "Select venue type",
                        )}
                      </Label>
                      <select
                        id="map-atlas-discovery-type"
                        value={selectedVenueType ?? ""}
                        onChange={(event) =>
                          setSelectedVenueType(event.target.value || null)
                        }
                        className="h-11 w-full rounded-xl border border-border/70 bg-card px-3 text-sm"
                      >
                        <option value="">
                          {t(
                            "mapAtlas.discovery.type",
                            undefined,
                            "Select venue type",
                          )}
                        </option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {getLocalizedCategoryName(
                              category.id,
                              category.label,
                            )}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {activeDiscoverySource === "price-range" && (
                    <div>
                      <Label
                        htmlFor="map-atlas-discovery-price"
                        className="sr-only"
                      >
                        {t(
                          "mapAtlas.discovery.price",
                          undefined,
                          "Select budget level",
                        )}
                      </Label>
                      <select
                        id="map-atlas-discovery-price"
                        value={selectedPriceRange ?? ""}
                        onChange={(event) =>
                          setSelectedPriceRange(
                            (event.target.value ||
                              null) as typeof selectedPriceRange,
                          )
                        }
                        className="h-11 w-full rounded-xl border border-border/70 bg-card px-3 text-sm"
                      >
                        <option value="">
                          {t(
                            "mapAtlas.discovery.price",
                            undefined,
                            "Select budget level",
                          )}
                        </option>
                        {PRICE_LEVEL_VALUES.map((value) => (
                          <option key={value} value={value}>
                            {getLocalizedBudgetLabel(value)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {activeDiscoverySource === "top-rated-area" && (
                    <div>
                      <Label
                        htmlFor="map-atlas-discovery-area"
                        className="sr-only"
                      >
                        {t("mapAtlas.discovery.area", undefined, "Select area")}
                      </Label>
                      <select
                        id="map-atlas-discovery-area"
                        value={selectedArea}
                        onChange={(event) =>
                          setSelectedArea(event.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-border/70 bg-card px-3 text-sm"
                      >
                        {popularDistricts.map((district) => (
                          <option
                            key={`area-${district.id}`}
                            value={district.name}
                          >
                            {getLocalizedDistrictName(
                              district.id,
                              district.name,
                            )}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border/70 bg-card px-3 py-2">
                      {t(
                        "mapAtlas.discovery.mode",
                        { mode: discoveryModeLabel },
                        `Mode: ${discoveryModeLabel}`,
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedSource === "similar" && (
              <motion.div
                key="similar-controls"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.2 }}
                className="mt-4"
              >
                <Label htmlFor="map-atlas-similar-seed" className="sr-only">
                  {t(
                    "mapAtlas.similar.reference",
                    undefined,
                    "Choose a reference place for similar recommendations",
                  )}
                </Label>
                <select
                  id="map-atlas-similar-seed"
                  value={selectedSimilarSeedId ?? ""}
                  onChange={(event) =>
                    selectPlaceForSimilar(event.target.value || null)
                  }
                  className="h-11 w-full rounded-xl border border-border/70 bg-card px-3 text-sm"
                >
                  <option value="">
                    {t(
                      "mapAtlas.similar.reference",
                      undefined,
                      "Choose a reference place for similar recommendations",
                    )}
                  </option>
                  {similarSeedPlaces.map((place) => (
                    <option key={`seed-${place.id}`} value={place.id}>
                      {place.name}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MapStatCard
              label={t("mapAtlas.stats.total", undefined, "Total")}
              value={formatNumber(stats.total)}
            />
            <MapStatCard
              label={t("mapAtlas.stats.open", undefined, "Open now")}
              value={formatNumber(stats.openNow)}
            />
            <MapStatCard
              label={t("mapAtlas.stats.saved", undefined, "Saved")}
              value={formatNumber(stats.saved)}
            />
            <MapStatCard
              label={t("mapAtlas.stats.avg", undefined, "Avg rating")}
              value={
                stats.averageRating > 0
                  ? formatNumber(stats.averageRating, {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })
                  : "-"
              }
            />
          </div>

          <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
            {RATING_FILTERS.map((filter) => {
              const active = minimumRating === filter.value;
              return (
                <button
                  key={`rating-${filter.key}`}
                  type="button"
                  onClick={() => setMinimumRating(filter.value)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "border-primary/85 bg-primary text-primary-foreground"
                      : "border-border/70 bg-card hover:border-primary/55 hover:bg-primary/10",
                  )}
                >
                  <Star className="h-3.5 w-3.5" />
                  {t(`mapAtlas.rating.${filter.key}`, undefined, filter.label)}
                </button>
              );
            })}
          </div>
        </section>

        <section
          ref={mapViewportRef}
          className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,20rem)] 2xl:grid-cols-[minmax(0,1fr)_minmax(20rem,22rem)]"
        >
          <div className="space-y-3">
            <MapAtlasCanvas
              places={mapPlaces}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={setSelectedPlaceIdState}
              userLocation={userLocation}
              resolvedTheme={resolvedTheme}
              fitRequestToken={fitRequestToken}
              centerUserRequestToken={centerUserRequestToken}
            />

            <div className="rounded-2xl border border-border/70 bg-card/80 px-3.5 py-3 text-muted-foreground">
              <p className="text-role-caption text-foreground">
                {t("mapAtlas.location.label", undefined, "Location status")}
              </p>
              <p className="mt-1 text-role-secondary">{locationStatus}</p>
            </div>
          </div>

          <aside className="rounded-3xl border border-border/70 bg-card/90 p-3.5 shadow-sm lg:sticky lg:top-[5.75rem] lg:max-h-[calc(100vh-7rem)] lg:overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <p className="text-role-caption uppercase text-muted-foreground">
                  {t("mapAtlas.side.title", undefined, "Mapped places")}
                </p>
                <p className="mt-1 text-role-secondary font-semibold text-foreground">
                  {t(
                    "mapAtlas.side.subtitle",
                    {
                      count: formatNumber(mapPlaces.length),
                      source:
                        sourceOptions.find(
                          (source) => source.id === selectedSource,
                        )?.label ?? "",
                    },
                    `${formatNumber(mapPlaces.length)} places in ${selectedSource}`,
                  )}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-11 rounded-full px-3"
                onClick={retryCurrentSource}
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                {t("common.retry")}
              </Button>
            </div>

            {saveError && (
              <div
                role="alert"
                className="mt-3 rounded-2xl border border-destructive/25 bg-destructive/10 px-3.5 py-3"
              >
                <p className="text-role-micro font-semibold text-destructive">
                  {saveError}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-11 rounded-full px-3 text-xs"
                  onClick={clearSaveError}
                >
                  {t("common.dismiss", undefined, "Dismiss")}
                </Button>
              </div>
            )}

            {sourceError ? (
              <div className="mt-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-3.5 py-3">
                <p className="text-role-micro font-semibold text-destructive">
                  {sourceError}
                </p>
              </div>
            ) : sourceIsLoading ? (
              <div className="mt-3 space-y-2.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`map-list-skeleton-${index}`}
                    className="h-24 animate-pulse rounded-2xl border border-border/60 bg-muted/55"
                  />
                ))}
              </div>
            ) : mapPlaces.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-border/75 bg-muted/35 px-3.5 py-6 text-center">
                <p className="text-role-secondary font-semibold text-foreground">
                  {t(
                    "mapAtlas.empty.title",
                    undefined,
                    "No places for this map state",
                  )}
                </p>
                <p className="mt-1 text-role-micro text-muted-foreground">
                  {t(
                    "mapAtlas.empty.subtitle",
                    undefined,
                    "Try another source, adjust filters, or lower minimum rating.",
                  )}
                </p>
              </div>
            ) : (
              <div
                className="mt-3 max-h-[48vh] space-y-2.5 overflow-y-auto pr-1 scrollbar-premium sm:max-h-[55vh] lg:max-h-[calc(100vh-16rem)]"
                aria-live="polite"
              >
                {mapPlaces.map((place) => {
                  const selected = place.id === selectedPlaceId;
                  const hasDirections =
                    Number.isFinite(place.latitude) &&
                    Number.isFinite(place.longitude);

                  return (
                    <article
                      key={`atlas-place-${place.id}`}
                      style={{
                        contentVisibility: "auto",
                        containIntrinsicSize: "220px",
                      }}
                      className={cn(
                        "w-full rounded-2xl border px-3 py-3 text-left transition-colors",
                        selected
                          ? "border-primary/80 bg-primary/10"
                          : "border-border/65 bg-card hover:border-primary/60 hover:bg-primary/5",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedPlaceIdState(place.id)}
                        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-pressed={selected}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-role-secondary line-clamp-2 font-semibold text-foreground">
                            {place.name}
                          </p>
                          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-border/70 bg-muted/55 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                            <Star className="h-3 w-3 text-secondary dark:text-primary" />
                            {formatNumber(place.rating, {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 1,
                            })}
                          </span>
                        </div>

                        <p className="text-role-micro mt-1 line-clamp-2 text-muted-foreground">
                          {place.address}
                        </p>

                        <div className="text-role-micro mt-2 flex flex-wrap items-center gap-1.5 font-semibold">
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5",
                              place.isOpen
                                ? "border-emerald-300/70 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : "border-border/70 bg-muted/60 text-muted-foreground",
                            )}
                          >
                            <Clock3 className="mr-1 inline h-3 w-3" />
                            {place.isOpen
                              ? t("home.place.open")
                              : t("home.place.closed")}
                          </span>

                          {place.hasWifi && (
                            <span className="rounded-full border border-border/70 bg-muted/55 px-2 py-0.5 text-foreground">
                              <Wifi className="mr-1 inline h-3 w-3" />
                              {t("mapAtlas.badge.wifi", undefined, "Wi-Fi")}
                            </span>
                          )}

                          {place.priceLevel && (
                            <span className="rounded-full border border-border/70 bg-muted/55 px-2 py-0.5 text-foreground">
                              {getLocalizedBudgetLabel(place.priceLevel)}
                            </span>
                          )}
                        </div>
                      </button>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="h-11 rounded-full px-3 text-xs"
                          onClick={() => navigate(`/venue/${place.id}`)}
                        >
                          {t("mapAtlas.action.details", undefined, "Details")}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={!hasDirections}
                          className="h-11 rounded-full px-3 text-xs"
                          onClick={() => handleOpenDirections(place)}
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          {t(
                            "mapAtlas.action.directions",
                            undefined,
                            "Directions",
                          )}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant={place.isSaved ? "secondary" : "outline"}
                          disabled={isPlaceSavePending(place.id)}
                          className="h-11 rounded-full px-3 text-xs"
                          onClick={() => void toggleSave(place.id)}
                        >
                          {place.isSaved ? (
                            <Bookmark className="h-3.5 w-3.5" />
                          ) : (
                            <Heart className="h-3.5 w-3.5" />
                          )}
                          {place.isSaved
                            ? t("mapAtlas.action.saved", undefined, "Saved")
                            : t("mapAtlas.action.save", undefined, "Save")}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </aside>
        </section>

        {selectedPlace && (
          <section className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
            <p className="text-role-caption uppercase text-muted-foreground">
              {t("mapAtlas.selection.label", undefined, "Selected place")}
            </p>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-role-subheading text-foreground">
                  {selectedPlace.name}
                </p>
                <p className="text-role-secondary text-muted-foreground">
                  {selectedPlace.address}
                </p>
              </div>
              <Button
                type="button"
                onClick={() => navigate(`/venue/${selectedPlace.id}`)}
                className="h-11 rounded-full px-4"
              >
                {t("mapAtlas.action.openVenue", undefined, "Open venue")}
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}

interface MapStatCardProps {
  label: string;
  value: string;
}

function MapStatCard({ label, value }: MapStatCardProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-2.5">
      <p className="text-role-caption uppercase text-muted-foreground">
        {label}
      </p>
      <p className="text-role-subheading text-numeric-tabular mt-1 text-foreground">
        {value}
      </p>
    </div>
  );
}
