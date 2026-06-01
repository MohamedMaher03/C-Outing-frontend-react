import {
  ArrowUpRight,
  Bookmark,
  Clock3,
  Heart,
  Layers3,
  LocateFixed,
  MapPin,
  MapPinned,
  Navigation,
  RefreshCcw,
  Search,
  Star,
  Wifi,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import "@/features/map-atlas/components/map-atlas.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import MapAtlasCanvas from "@/features/map-atlas/components/MapAtlasCanvas";
import MapAtlasRecommendationCountSelector from "@/features/map-atlas/components/MapAtlasRecommendationCountSelector";
import { MapAtlasStatCard } from "@/features/map-atlas/components/MapAtlasStatCard";
import { FILTER_OPTIONS } from "@/features/home/mocks";
import { useMapAtlasPage } from "@/features/map-atlas/hooks/useMapAtlasPage";
import {
  MAP_ATLAS_EASE_OUT_QUART,
  MAP_ATLAS_RATING_FILTERS,
  MAP_ATLAS_SOURCE_META,
  isMapAtlasFilterActive,
  placeHasValidDirections,
  resolveMapAtlasOpenStatusLabel,
  resolveMapAtlasOpenStatusToneClass,
} from "@/features/map-atlas/utils/mapAtlasPresentation";

export default function MapAtlasPage() {
  const page = useMapAtlasPage();

  if (page.isLoading) {
    return (
      <PageLoading
        text={page.t("mapAtlas.loading.title", undefined, "Loading Map Atlas")}
        subText={page.t(
          "mapAtlas.loading.subtitle",
          undefined,
          "Preparing Cairo pins and personalized places...",
        )}
      />
    );
  }

  if (page.error) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center px-4 py-10">
        <section className="w-full rounded-3xl border border-destructive/25 bg-destructive/5 p-6 sm:p-8">
          <p className="text-role-caption uppercase text-destructive">
            {page.t("mapAtlas.error.badge", undefined, "Map Atlas unavailable")}
          </p>
          <h1 className="mt-2 text-role-heading text-foreground text-safe-wrap">
            {page.t(
              "mapAtlas.error.title",
              undefined,
              "We could not load your map experience right now",
            )}
          </h1>
          <p className="mt-2 text-role-secondary text-measure-comfortable text-muted-foreground">
            {page.error}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" onClick={() => void page.reloadPlaces()}>
              <RefreshCcw className="h-4 w-4" />
              {page.t("common.retry")}
            </Button>
            <Button type="button" variant="outline" onClick={page.returnHome}>
              {page.t("mapAtlas.error.backHome", undefined, "Back to Home")}
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
        duration: page.prefersReducedMotion ? 0.01 : 0.22,
        ease: MAP_ATLAS_EASE_OUT_QUART,
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 md:gap-6 md:py-7">
        <section className="overflow-hidden rounded-3xl border border-border/65 bg-card/90 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-role-caption inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-foreground">
                <MapPinned className="h-3.5 w-3.5 text-secondary dark:text-primary" />
                {page.t("mapAtlas.badge", undefined, "Cairo Atlas")}
              </p>
              <h1 className="mt-2 text-role-heading text-foreground text-safe-wrap">
                {page.t("mapAtlas.title", undefined, "Map-First Place Discovery")}
              </h1>
              <p className="mt-1 text-role-secondary text-measure-comfortable text-muted-foreground">
                {page.t(
                  "mapAtlas.subtitle",
                  undefined,
                  "Switch recommendation sources, inspect clusters, and pick your next place directly from Cairo's map.",
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_1fr]">
            <div className="relative">
              <Label htmlFor="map-atlas-search" className="sr-only">
                {page.t("mapAtlas.search.label", undefined, "Search map places")}
              </Label>
              <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="map-atlas-search"
                value={page.search}
                onChange={(event) => page.setSearch(event.target.value)}
                maxLength={140}
                placeholder={page.t(
                  "mapAtlas.search.placeholder",
                  undefined,
                  "Search by place, district, category, or atmosphere tag...",
                )}
                className="h-11 rounded-2xl border-border/70 bg-background pl-11"
              />
            </div>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
              {FILTER_OPTIONS.map((filter) => {
                const active = isMapAtlasFilterActive(
                  filter.id,
                  page.selectedFilters,
                );
                const Icon = filter.icon;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => page.toggleFilter(filter.id)}
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
                    {page.t(`home.filter.${filter.id}`, undefined, filter.label)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
            {page.sourceTabOptions.map((source) => {
              const Icon = MAP_ATLAS_SOURCE_META[source.id].icon;
              const active = page.visibleSource === source.id;

              return (
                <button
                  key={`map-source-${source.id}`}
                  type="button"
                  onClick={() => page.setVisibleSource(source.id)}
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
                    {page.formatNumber(source.count)}
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence initial={false} mode="wait">
            {page.visibleSource === "discovery" && (
              <motion.div
                key="discovery-controls"
                initial={{ opacity: 0, y: page.prefersReducedMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: page.prefersReducedMotion ? 0 : -8 }}
                transition={{ duration: page.prefersReducedMotion ? 0.01 : 0.2 }}
                className="mt-4 space-y-4 rounded-2xl border border-border/65 bg-background/65 p-4"
              >
                <div>
                  <p className="text-role-caption uppercase tracking-wide text-muted-foreground">
                    {page.t(
                      "mapAtlas.discovery.title",
                      undefined,
                      "How do you want to explore?",
                    )}
                  </p>
                  <p className="mt-1 text-role-secondary text-muted-foreground">
                    {page.t(
                      "mapAtlas.discovery.subtitle",
                      undefined,
                      "Pick a discovery lens, then refine your results below.",
                    )}
                  </p>
                </div>

                <div
                  role="radiogroup"
                  aria-label={page.t(
                    "mapAtlas.discovery.lensAria",
                    undefined,
                    "Discovery lens",
                  )}
                  className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5"
                >
                  {page.discoverySourceOptions.map((source) => {
                    const Icon = source.icon;
                    const active = page.activeDiscoverySource === source.id;

                    return (
                      <button
                        key={`discovery-lens-${source.id}`}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => page.setActiveDiscoverySource(source.id)}
                        className={cn(
                          "group min-h-[3.25rem] rounded-2xl border px-3 py-2.5 text-left transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          active
                            ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                            : "border-border/70 bg-card hover:border-primary/55 hover:bg-primary/10",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                              active
                                ? "bg-primary-foreground/18 text-primary-foreground"
                                : "bg-muted/80 text-muted-foreground group-hover:text-primary",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span
                            className={cn(
                              "text-xs font-semibold leading-tight sm:text-sm",
                              active
                                ? "text-primary-foreground"
                                : "text-foreground",
                            )}
                          >
                            {source.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {page.activeDiscoverySource === "district" && (
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Label className="text-role-secondary font-semibold text-foreground">
                        {page.t(
                          "mapAtlas.discovery.districtLabel",
                          undefined,
                          "Choose a district",
                        )}
                      </Label>
                      {page.nearYouDistrictHintVisible &&
                        page.selectedDistrictRecord && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/70 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                            <LocateFixed className="h-3 w-3" />
                            {page.t(
                              "mapAtlas.discovery.nearYou",
                              undefined,
                              "Near you",
                            )}
                          </span>
                        )}
                    </div>

                    {page.userLocation.status === "granted" && (
                      <div className="flex flex-wrap items-start gap-2 rounded-2xl border border-primary/15 bg-primary/5 px-3 py-2 text-role-micro text-muted-foreground sm:items-center">
                        <LocateFixed className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary sm:mt-0" />
                        <p className="min-w-0 flex-1">
                          {page.t(
                            "mapAtlas.discovery.districtSortHint",
                            undefined,
                            "Districts are sorted from nearest to farthest based on your location.",
                          )}
                        </p>
                      </div>
                    )}

                    {page.nearYouDistrictHintVisible &&
                      page.selectedDistrictRecord && (
                        <p className="text-role-micro text-muted-foreground">
                          {page.t(
                            "mapAtlas.discovery.autoDistrict",
                            {
                              district: page.districtLabel(
                                page.selectedDistrictRecord.id,
                                page.selectedDistrictRecord.name,
                              ),
                            },
                            `Showing places in ${page.selectedDistrictRecord.name} — nearest to your location.`,
                          )}
                        </p>
                      )}

                    <div
                      role="listbox"
                      aria-label={page.t(
                        "home.discovery.districtsAria",
                        undefined,
                        "Popular districts",
                      )}
                      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide"
                    >
                      {page.popularDistricts.map((district) => {
                        const isActive =
                          page.selectedDistrict === district.name;
                        const isNearYou =
                          page.autoSelectedDistrictId === district.id &&
                          isActive;

                        return (
                          <button
                            key={district.id}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            onClick={() =>
                              page.selectDistrict(district.name, isActive)
                            }
                            className={cn(
                              "inline-flex min-h-11 flex-shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                              isActive
                                ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                                : "border-border/70 bg-card text-foreground hover:border-primary/60 hover:bg-primary/12",
                            )}
                          >
                            {isNearYou && (
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            )}
                            {page.districtLabel(district.id, district.name)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {page.activeDiscoverySource === "type" && (
                  <div className="space-y-2.5">
                    <Label className="text-role-secondary font-semibold text-foreground">
                      {page.t(
                        "mapAtlas.discovery.typeLabel",
                        undefined,
                        "Choose a venue type",
                      )}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {page.venueTypeOptions.map((option) => {
                        const isActive = page.selectedVenueType === option.id;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              page.selectVenueType(option.id, isActive)
                            }
                            className={cn(
                              "min-h-11 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                              isActive
                                ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                                : "border-border/70 bg-card text-foreground hover:border-primary/60 hover:bg-primary/12",
                            )}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {page.activeDiscoverySource === "price-range" && (
                  <div className="space-y-2.5">
                    <Label className="text-role-secondary font-semibold text-foreground">
                      {page.t(
                        "mapAtlas.discovery.priceLabel",
                        undefined,
                        "Choose a budget level",
                      )}
                    </Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                      {page.priceRangeOptions.map((option) => {
                        const isActive =
                          page.selectedPriceRange === option.id;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              page.selectPriceRange(option.id, isActive)
                            }
                            className={cn(
                              "min-h-[4.5rem] rounded-2xl border px-3 py-3 text-left transition-colors",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                              isActive
                                ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                                : "border-border/60 bg-card hover:border-primary/60 hover:bg-primary/10",
                            )}
                          >
                            <span className="text-xs font-semibold">
                              {option.label}
                            </span>
                            <span
                              className={cn(
                                "mt-1 block text-[11px]",
                                isActive
                                  ? "text-primary-foreground/85"
                                  : "text-muted-foreground",
                              )}
                            >
                              {option.caption}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {page.activeDiscoverySource === "top-rated" && (
                  <p className="text-role-secondary rounded-xl border border-border/60 bg-card/70 px-3.5 py-3 text-muted-foreground">
                    {page.t(
                      "mapAtlas.discovery.topRatedHint",
                      undefined,
                      "Showing the highest-rated venues across Cairo — no extra filter needed.",
                    )}
                  </p>
                )}

                {page.activeDiscoverySource === "top-rated-area" && (
                  <div className="space-y-2.5">
                    <Label className="text-role-secondary font-semibold text-foreground">
                      {page.t(
                        "mapAtlas.discovery.areaLabel",
                        undefined,
                        "Choose an area for top-rated picks",
                      )}
                    </Label>
                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
                      {page.popularDistricts.map((district) => {
                        const isActive = page.selectedArea === district.name;

                        return (
                          <button
                            key={`area-${district.id}`}
                            type="button"
                            onClick={() => page.selectTopRatedArea(district.name)}
                            className={cn(
                              "inline-flex min-h-11 flex-shrink-0 items-center rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                              isActive
                                ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                                : "border-border/70 bg-card text-foreground hover:border-primary/60 hover:bg-primary/12",
                            )}
                          >
                            {page.districtLabel(district.id, district.name)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {(page.visibleSource === "curated" ||
              page.visibleSource === "trending") && (
              <motion.div
                key={`${page.visibleSource}-count-controls`}
                initial={{ opacity: 0, y: page.prefersReducedMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: page.prefersReducedMotion ? 0 : -8 }}
                transition={{ duration: page.prefersReducedMotion ? 0.01 : 0.2 }}
                className="mt-4"
              >
                <MapAtlasRecommendationCountSelector
                  source={page.visibleSource}
                  sourceLabel={page.activeSourceLabel}
                  count={page.recommendationCount}
                  onCountChange={page.setRecommendationCount}
                  isLoading={page.isCuratedTrendingLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MapAtlasStatCard
              label={page.t("mapAtlas.stats.total", undefined, "Total")}
              value={page.formatNumber(page.mapStats.total)}
            />
            <MapAtlasStatCard
              label={page.t("mapAtlas.stats.open", undefined, "Open now")}
              value={page.formatNumber(page.mapStats.openNow)}
            />
            <MapAtlasStatCard
              label={page.t("mapAtlas.stats.saved", undefined, "Saved")}
              value={page.formatNumber(page.mapStats.saved)}
            />
            <MapAtlasStatCard
              label={page.t("mapAtlas.stats.avg", undefined, "Avg rating")}
              value={page.averageRatingDisplay}
            />
          </div>

          <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
            {MAP_ATLAS_RATING_FILTERS.map((filter) => {
              const active = page.minimumRating === filter.value;

              return (
                <button
                  key={`rating-${filter.key}`}
                  type="button"
                  onClick={() => page.setMinimumRating(filter.value)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "border-primary/85 bg-primary text-primary-foreground"
                      : "border-border/70 bg-card hover:border-primary/55 hover:bg-primary/10",
                  )}
                >
                  <Star className="h-3.5 w-3.5" />
                  {page.t(`mapAtlas.rating.${filter.key}`, undefined, filter.label)}
                </button>
              );
            })}
          </div>
        </section>

        <section
          ref={page.mapViewportRef}
          className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,20rem)] 2xl:grid-cols-[minmax(0,1fr)_minmax(20rem,22rem)]"
        >
          <div className="space-y-3">
            <div className="rounded-2xl border border-border/70 bg-card/85 px-3.5 py-3 shadow-sm backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-role-caption uppercase text-muted-foreground">
                    {page.t("mapAtlas.map.toolsLabel", undefined, "Map tools")}
                  </p>
                  <p className="mt-1 text-role-secondary text-muted-foreground">
                    {page.t(
                      "mapAtlas.map.toolsHint",
                      undefined,
                      "Refit the map or jump back to your location.",
                    )}
                  </p>
                </div>

                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 flex-1 rounded-full px-4 sm:flex-none"
                    onClick={page.fitMapToResults}
                  >
                    <Layers3 className="h-4 w-4" />
                    {page.t("mapAtlas.action.fit", undefined, "Fit results")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 flex-1 rounded-full px-4 sm:flex-none"
                    onClick={page.centerMapOnUser}
                    disabled={page.userLocation.status === "loading"}
                  >
                    <LocateFixed className="h-4 w-4" />
                    {page.t("mapAtlas.action.centerMe", undefined, "Center on me")}
                  </Button>
                </div>
              </div>
            </div>

            <MapAtlasCanvas
              places={page.mapPlaces}
              selectedPlaceId={page.selectedPlaceId}
              onSelectPlace={page.setPinnedPlaceId}
              userLocation={page.userLocation}
              resolvedTheme={page.resolvedTheme}
              fitRequestToken={page.fitRequestToken}
              centerUserRequestToken={page.centerUserRequestToken}
            />

            <div className="rounded-2xl border border-border/70 bg-card/80 px-3.5 py-3 text-muted-foreground">
              <p className="text-role-caption text-foreground">
                {page.t("mapAtlas.location.label", undefined, "Location status")}
              </p>
              <p className="mt-1 text-role-secondary">{page.locationStatusLabel}</p>
            </div>
          </div>

          <aside className="rounded-3xl border border-border/70 bg-card/90 p-3.5 shadow-sm lg:sticky lg:top-[5.75rem] lg:max-h-[calc(100vh-7rem)] lg:overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <p className="text-role-caption uppercase text-muted-foreground">
                  {page.t("mapAtlas.side.title", undefined, "Mapped places")}
                </p>
                <p className="mt-1 text-role-secondary font-semibold text-foreground">
                  {page.t(
                    "mapAtlas.side.subtitle",
                    {
                      count: page.formatNumber(page.mapPlaces.length),
                      source: page.activeSourceLabel,
                    },
                    `${page.formatNumber(page.mapPlaces.length)} places in ${page.visibleSource}`,
                  )}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-11 rounded-full px-3"
                onClick={page.retryVisibleSource}
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                {page.t("common.retry")}
              </Button>
            </div>

            {page.saveError && (
              <div
                role="alert"
                className="mt-3 rounded-2xl border border-destructive/25 bg-destructive/10 px-3.5 py-3"
              >
                <p className="text-role-micro font-semibold text-destructive">
                  {page.saveError}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-11 rounded-full px-3 text-xs"
                  onClick={page.clearSaveError}
                >
                  {page.t("common.dismiss", undefined, "Dismiss")}
                </Button>
              </div>
            )}

            {page.sourceError ? (
              <div className="mt-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-3.5 py-3">
                <p className="text-role-micro font-semibold text-destructive">
                  {page.sourceError}
                </p>
              </div>
            ) : page.sourceIsLoading ? (
              <div className="mt-3 space-y-2.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`map-list-skeleton-${index}`}
                    className="h-24 animate-pulse rounded-2xl border border-border/60 bg-muted/55"
                  />
                ))}
              </div>
            ) : page.mapPlaces.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-border/75 bg-muted/35 px-3.5 py-6 text-center">
                <p className="text-role-secondary font-semibold text-foreground">
                  {page.t(
                    "mapAtlas.empty.title",
                    undefined,
                    "No places for this map state",
                  )}
                </p>
                <p className="mt-1 text-role-micro text-muted-foreground">
                  {page.t(
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
                {page.mapPlaces.map((place) => {
                  const selected = place.id === page.selectedPlaceId;
                  const distanceLabel = page.resolvePlaceDistanceLabel(place);
                  const openStatusCopy = resolveMapAtlasOpenStatusLabel(
                    place.isOpen,
                    page.t,
                  );

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
                        onClick={() => page.setPinnedPlaceId(place.id)}
                        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-pressed={selected}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-role-secondary line-clamp-2 font-semibold text-foreground">
                            {place.name}
                          </p>
                          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-border/70 bg-muted/55 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                            <Star className="h-3 w-3 text-secondary dark:text-primary" />
                            {page.formatNumber(place.rating, {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 1,
                            })}
                          </span>
                        </div>

                        <p className="text-role-micro mt-1 line-clamp-2 text-muted-foreground">
                          {place.address}
                        </p>

                        {distanceLabel && (
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                              <LocateFixed className="h-3 w-3" />
                              {distanceLabel}
                            </span>
                          </div>
                        )}

                        <div className="text-role-micro mt-2 flex flex-wrap items-center gap-1.5 font-semibold">
                          {openStatusCopy && (
                            <span
                              className={cn(
                                "rounded-full border px-2 py-0.5",
                                resolveMapAtlasOpenStatusToneClass(place.isOpen),
                              )}
                            >
                              <Clock3 className="mr-1 inline h-3 w-3" />
                              {openStatusCopy}
                            </span>
                          )}

                          {place.hasWifi && (
                            <span className="rounded-full border border-border/70 bg-muted/55 px-2 py-0.5 text-foreground">
                              <Wifi className="mr-1 inline h-3 w-3" />
                              {page.t("mapAtlas.badge.wifi", undefined, "Wi-Fi")}
                            </span>
                          )}

                          {place.priceLevel && (
                            <span className="rounded-full border border-border/70 bg-muted/55 px-2 py-0.5 text-foreground">
                              {page.budgetLabel(place.priceLevel)}
                            </span>
                          )}
                        </div>
                      </button>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="h-11 rounded-full px-3 text-xs"
                          onClick={() => page.openVenueDetail(place.id)}
                        >
                          {page.t("mapAtlas.action.details", undefined, "Details")}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={!placeHasValidDirections(place)}
                          className="h-11 rounded-full px-3 text-xs"
                          onClick={() => page.openVenueDirections(place)}
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          {page.t(
                            "mapAtlas.action.directions",
                            undefined,
                            "Directions",
                          )}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant={place.isSaved ? "secondary" : "outline"}
                          disabled={page.isPlaceSavePending(place.id)}
                          className="h-11 rounded-full px-3 text-xs"
                          onClick={() => void page.toggleSave(place.id)}
                        >
                          {place.isSaved ? (
                            <Bookmark className="h-3.5 w-3.5" />
                          ) : (
                            <Heart className="h-3.5 w-3.5" />
                          )}
                          {place.isSaved
                            ? page.t("mapAtlas.action.saved", undefined, "Saved")
                            : page.t("mapAtlas.action.save", undefined, "Save")}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </aside>
        </section>

        {page.selectedPlace && (
          <section className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
            <p className="text-role-caption uppercase text-muted-foreground">
              {page.t("mapAtlas.selection.label", undefined, "Selected place")}
            </p>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
              <div>
                <a
                  href={`/venue/${page.selectedPlace.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-left text-role-subheading text-foreground underline-offset-4 transition hover:underline focus-visible:underline"
                >
                  {page.selectedPlace.name}
                </a>
                <p className="text-role-secondary text-muted-foreground">
                  {page.selectedPlace.address}
                </p>
              </div>
              <Button
                type="button"
                onClick={() => page.openVenueDetail(page.selectedPlace!.id)}
                className="h-11 rounded-full px-4"
              >
                {page.t("mapAtlas.action.openVenue", undefined, "Open venue")}
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}
