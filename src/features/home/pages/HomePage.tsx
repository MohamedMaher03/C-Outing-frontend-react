import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Flame,
  Compass,
  Sparkles,
  WandSparkles,
  RotateCcw,
  ShieldAlert,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { Input } from "@/components/ui/input";
import PlaceCard from "@/features/home/components/PlaceCard";
import LocationPermissionBanner from "@/features/home/components/LocationPermissionBanner";
import { GuidedTour } from "@/features/home/components/GuidedTour";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useHome } from "@/features/home/hooks/useHomeHook";
import { useGuidedTour } from "@/features/home/hooks/useGuidedTour";
import { cn } from "@/lib/utils";
import {
  FILTER_OPTIONS,
  DISCOVERY_SOURCE_OPTIONS,
  MOOD_ICON_MAP,
  VENUE_PRICE_RANGE_OPTIONS,
} from "@/features/home/mocks";
import type { VenuePriceRange } from "@/features/home/types";
import cairoBg from "@/assets/images/cairo-bg.jpg";
import { normalizeSearchTerm } from "@/utils/textNormalization";
import { getTranslatedText } from "@/utils/helpers";
import { GroupSessionWidget } from "@/features/session/components/GroupSessionWidget";

interface HorizontalScrollerProps {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
}

const HorizontalScroller = ({
  children,
  ariaLabel,
  className,
}: HorizontalScrollerProps) => {
  const { t } = useI18n();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    const ro = new ResizeObserver(updateScrollButtons);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      ro.disconnect();
    };
  }, [updateScrollButtons]);

  useEffect(() => {
    updateScrollButtons();
  }, [children, updateScrollButtons]);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(Math.round(el.clientWidth * 0.8), 280);
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollBy("left")}
        aria-label={t("home.scroller.scrollLeft", { label: ariaLabel })}
        disabled={!canScrollLeft}
        className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-card/95 text-foreground shadow-sm transition-opacity hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 md:inline-flex"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div
        ref={scrollRef}
        className={cn(
          "-mx-4 flex snap-x snap-proximity gap-4 overflow-x-auto overscroll-x-contain px-4 pb-3 scrollbar-hide",
          className,
        )}
        aria-label={ariaLabel}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scrollBy("right")}
        aria-label={t("home.scroller.scrollRight", { label: ariaLabel })}
        disabled={!canScrollRight}
        className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-card/95 text-foreground shadow-sm transition-opacity hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 md:inline-flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// HomePage
// ---------------------------------------------------------------------------
const HomePage = () => {
  const { t, formatNumber, locale } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tourActive, currentStep, totalSteps, next, skip, finish } =
    useGuidedTour();

  const {
    search,
    setSearch,
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
    globalTopRatedVenues,
    topRatedInAreaVenues,
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

  const compactNumberFormatter = useMemo(
    () => new Intl.NumberFormat(locale, { notation: "compact" }),
    [locale],
  );

  const localizedFilters = useMemo(
    () =>
      FILTER_OPTIONS.map((filter) => ({
        ...filter,
        label: t(`home.filter.${filter.id}`, undefined, filter.label),
      })),
    [t],
  );

  const localizedDiscoverySources = useMemo(
    () =>
      DISCOVERY_SOURCE_OPTIONS.map((source) => ({
        ...source,
        label: t(`home.discovery.source.${source.id}`, undefined, source.label),
      })),
    [t],
  );

  const localizedPriceRangeOptions = useMemo(
    () =>
      VENUE_PRICE_RANGE_OPTIONS.map((option) => ({
        ...option,
        label: t(`budget.${option.id}`, undefined, option.label),
        caption: t(
          `home.price.caption.${option.id}`,
          undefined,
          option.caption,
        ),
      })),
    [t],
  );

  const typeDiscoveryOptions = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        label: getTranslatedText(category.nameKey, category.label, t),
      })),
    [categories, t],
  );

  const showDiscoverySkeleton =
    isDiscoveryLoading ||
    (activeDiscoverySource === "top-rated" && isGlobalTopRatedLoading) ||
    (activeDiscoverySource === "top-rated-area" && isTopRatedInAreaLoading);

  const discoveryResultCount = discoveryPlaces.length;
  const [similarSearchInput, setSimilarSearchInput] = useState("");
  const [isSimilarInputFocused, setIsSimilarInputFocused] = useState(false);
  const moodSectionRef = useRef<HTMLElement | null>(null);

  const similarSeedOptions = similarSeedPlaces;

  const selectedSimilarSeedPlace =
    similarSeedOptions.find((place) => place.id === selectedSimilarSeedId) ??
    null;

  const selectedMoodOption = useMemo(
    () => moodOptions.find((mood) => mood.id === selectedMood) ?? null,
    [moodOptions, selectedMood],
  );

  const similarSeedSearchIndex = useMemo(
    () =>
      similarSeedOptions.map((place) => ({
        place,
        name: normalizeSearchTerm(place.name),
        address: normalizeSearchTerm(place.address),
        category: normalizeSearchTerm(place.category),
        tags: normalizeSearchTerm((place.atmosphereTags ?? []).join(" ")),
      })),
    [similarSeedOptions],
  );

  const similarSearchResults = useMemo(() => {
    const query = normalizeSearchTerm(similarSearchInput);
    if (!query) return similarSeedOptions.slice(0, 8);
    return similarSeedSearchIndex
      .filter(
        ({ name, address, category, tags }) =>
          name.includes(query) ||
          address.includes(query) ||
          category.includes(query) ||
          tags.includes(query),
      )
      .map(({ place }) => place)
      .slice(0, 8);
  }, [similarSearchInput, similarSeedOptions, similarSeedSearchIndex]);

  const getMoodLabel = useCallback(
    (moodId: string, fallback: string) =>
      t(`home.mood.${moodId}.label`, undefined, fallback),
    [t],
  );

  const getMoodDescription = useCallback(
    (moodId: string, fallback: string) =>
      t(`home.mood.${moodId}.description`, undefined, fallback),
    [t],
  );

  const showSimilarSuggestions =
    isSimilarInputFocused ||
    (similarSearchInput.trim().length > 0 &&
      similarSearchInput !== selectedSimilarSeedPlace?.name);

  const scrollMoodSectionIntoView = useCallback(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let attempts = 0;
    const tryScroll = () => {
      const el = moodSectionRef.current;
      if (el) {
        el.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
        return;
      }
      if (++attempts < 8) window.requestAnimationFrame(tryScroll);
    };
    window.requestAnimationFrame(tryScroll);
  }, []);

  const handleMoodOptionSelect = useCallback(
    (moodId: string, isActive: boolean) => {
      if (isActive) {
        setSelectedMood(null);
        return;
      }
      setSelectedMood(moodId);
      scrollMoodSectionIntoView();
    },
    [scrollMoodSectionIntoView, setSelectedMood],
  );

  const handlePriceRangeSelect = (priceRange: VenuePriceRange) => {
    setSelectedPriceRange(
      selectedPriceRange === priceRange ? null : priceRange,
    );
    setActiveDiscoverySource("price-range");
  };

  const handleSearchNavigate = useCallback(() => {
    const trimmed = search.trim();
    if (!trimmed) return;
    navigate(`/home/search?q=${encodeURIComponent(trimmed)}`);
  }, [navigate, search]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("home.greeting.morning");
    if (hour < 18) return t("home.greeting.afternoon");
    return t("home.greeting.evening");
  };

  const userName = user?.name?.split(" ")[0] || t("home.user.explorer");

  // ── Loading / Error states ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <PageLoading
        text={t("app.loading.discovering")}
        subText={t("app.loading.finding")}
      />
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary via-primary/92 to-primary/80">
        <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-secondary/10 blur-2xl" />
        <div className="absolute right-0 top-12 h-64 w-64 rounded-full bg-secondary/10 blur-2xl" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
          <section
            className="w-full overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-xl"
            role="alert"
            aria-live="assertive"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-6 p-6 sm:p-8 lg:p-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary dark:border-primary/40 dark:bg-primary/18 dark:text-primary">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {t("home.error.badge")}
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {t("home.error.title")}
                  </h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {t("home.error.description")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={() => void reloadPlaces()}
                    variant="secondary"
                    className="h-10 rounded-full px-5 text-sm font-semibold text-primary shadow-sm"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {t("common.retry")}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="h-10 rounded-full border-border/70 bg-background/60 px-5 text-sm font-semibold text-foreground hover:bg-background"
                  >
                    {t("home.error.refreshPage")}
                  </Button>
                </div>
              </div>
              <aside className="border-t border-border/70 bg-background/45 p-6 sm:p-8 lg:border-l lg:border-t-0">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("home.error.quickCheck")}
                </h2>
                <ul className="mt-4 space-y-3">
                  <li className="rounded-2xl border border-border/70 bg-card/70 p-3 text-sm text-foreground">
                    <span className="flex items-center gap-2 font-semibold text-foreground">
                      <Wifi className="h-4 w-4 text-secondary dark:text-primary" />
                      {t("home.error.networkTitle")}
                    </span>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {t("home.error.networkDescription")}
                    </p>
                  </li>
                </ul>
              </aside>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Guided tour — kept outside scroll flow */}
      {tourActive && (
        <GuidedTour
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={next}
          onSkip={skip}
          onFinish={finish}
        />
      )}

      {/* ── HERO ── */}
      <div className="relative h-[340px] overflow-hidden sm:h-[390px] lg:h-[420px]">
        {/* Static background — no motion, no scale */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${cairoBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy)/0.86)] via-[hsl(var(--navy)/0.56)] to-transparent dark:from-black/72 dark:via-black/46" />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--navy)/0.26)] via-transparent to-black/10 dark:from-black/24 dark:to-black/18" />

        {/* Hero text — plain div, CSS fade */}
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-5 pt-8 sm:pb-6 sm:pt-10 [animation:hp-fade-up_0.5s_ease-out_both]">
          <div className="mb-6 space-y-2">
            <p className="text-white/80 text-sm font-medium tracking-wide uppercase">
              {getGreeting()}, {userName} ✦
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-5xl lg:text-[3.4rem]">
              <span className="text-cream">{t("home.hero.title")}</span>
            </h1>
            <p className="max-w-md text-sm text-white/85 sm:text-base">
              {t("home.hero.subtitle")}
            </p>
          </div>

          {/* Search bar */}
          <div
            className="relative w-full max-w-2xl"
            data-tour="tour-search"
            id="tour-search"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
            <Input
              placeholder={t("home.hero.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearchNavigate();
              }}
              aria-label={t("home.hero.searchAria")}
              className="h-12 rounded-2xl border border-white/20 bg-black/30 pl-12 pr-24 text-base text-white shadow-lg transition-colors placeholder:text-white/65 focus:border-secondary/70 focus:bg-black/35 focus:ring-secondary/20 sm:h-14"
            />
            <button
              type="button"
              onClick={handleSearchNavigate}
              className="absolute right-2 top-1/2 z-10 h-9 -translate-y-1/2 rounded-full bg-secondary/90 px-4 text-xs font-semibold text-secondary-foreground shadow-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:h-10"
              aria-label={t("home.hero.searchAction", undefined, "Search")}
            >
              {t("home.hero.searchAction", undefined, "Search")}
            </button>
          </div>

          {/* Filter pills — plain horizontal scroll, no motion.button */}
          <div
            className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide"
            aria-label={t("home.hero.filterAria")}
            data-tour="tour-filters"
            id="tour-filters"
          >
            {localizedFilters.map((filter) => {
              const Icon = filter.icon;
              const isActive =
                filter.id === "all"
                  ? selectedFilters.length === 0
                  : selectedFilters.includes(filter.id);
              return (
                <button
                  type="button"
                  key={filter.id}
                  aria-pressed={isActive}
                  onClick={() => toggleFilter(filter.id)}
                  className={`inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-5 ${
                    isActive
                      ? "border-accent/90 bg-accent text-accent-foreground shadow-sm"
                      : "border-white/20 bg-black/25 text-white/90 hover:border-primary/65 hover:bg-primary/28 hover:text-primary-foreground dark:hover:bg-primary/35 dark:hover:text-cream"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Location banner */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <LocationPermissionBanner
          userLocation={userLocation}
          onEnableLocation={requestUserLocation}
        />
      </div>

      {/* Save error toast */}
      {saveError && (
        <div className="mx-auto mt-4 max-w-7xl px-4">
          <div
            className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-destructive">
                {saveError}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSaveError}
                className="h-8 rounded-full border-destructive/30 px-3 text-xs font-semibold text-destructive hover:bg-destructive/5 hover:text-destructive"
              >
                {t("common.dismiss")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MAIN CONTENT ====== */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* ── LEFT: Main Feed ── */}
          <div className="flex-1 min-w-0 space-y-12">
            {/* Group Session Banner (mobile/tablet) */}
            <section
              className="lg:hidden"
              aria-label={t("session.widget.ariaLabel")}
            >
              <GroupSessionWidget variant="banner" />
            </section>

            {/* ── MOOD SELECTOR (mobile/tablet) ── */}
            <section
              className="space-y-4 lg:hidden"
              data-tour="tour-mood"
              id="tour-mood"
            >
              <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-foreground">
                    {t("home.mobile.moodSelectorTitle")}
                  </h2>
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("home.mobile.moodSelectorHint")}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {moodOptions.map((mood) => {
                    const isActive = selectedMood === mood.id;
                    const MoodIcon = MOOD_ICON_MAP[mood.icon] ?? Sparkles;
                    return (
                      <button
                        type="button"
                        key={`mobile-mood-${mood.id}`}
                        onClick={() =>
                          handleMoodOptionSelect(mood.id, isActive)
                        }
                        className={`flex min-h-[44px] items-center gap-2 rounded-2xl border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                          isActive
                            ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                            : "border-border/60 bg-background hover:border-primary/55 hover:bg-primary/12"
                        }`}
                      >
                        <MoodIcon className="h-4 w-4 shrink-0 text-secondary/90 dark:text-primary" />
                        <span className="min-w-0 truncate text-xs font-medium text-foreground">
                          {getMoodLabel(mood.id, mood.label)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ── VENUE DISCOVERY STUDIO ── */}
            <section
              className="rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/30 p-5 sm:p-6 shadow-sm"
              data-tour="tour-discovery"
              id="tour-discovery"
            >
              <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/12 text-secondary dark:bg-primary/18 dark:text-primary">
                        <Compass className="h-4 w-4" />
                      </span>
                      {t("home.discovery.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("home.discovery.subtitle")}
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-2 text-xs sm:w-auto sm:justify-end">
                    <span className="max-w-[180px] truncate rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1.5 font-medium text-foreground">
                      {t("home.discovery.topRatedCount", {
                        count: compactNumberFormatter.format(
                          globalTopRatedVenues.length,
                        ),
                      })}
                    </span>
                    <span className="max-w-[180px] truncate rounded-full border border-border/70 bg-background px-3 py-1.5 font-medium text-foreground">
                      {t("home.discovery.areaCount", {
                        area: selectedArea,
                        count: compactNumberFormatter.format(
                          topRatedInAreaVenues.length,
                        ),
                      })}
                    </span>
                  </div>
                </div>

                {/* Source selector tabs */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {localizedDiscoverySources.map((source) => {
                    const Icon = source.icon;
                    const isActive = activeDiscoverySource === source.id;
                    return (
                      <button
                        type="button"
                        key={source.id}
                        onClick={() => setActiveDiscoverySource(source.id)}
                        className={`group min-h-[44px] rounded-2xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                          isActive
                            ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                            : "border-border/60 bg-card/90 hover:border-primary/60 hover:bg-primary/10 dark:hover:bg-primary/20 dark:hover:text-cream"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
                              isActive
                                ? "bg-primary-foreground/18 text-primary-foreground"
                                : "bg-muted/80 text-muted-foreground group-hover:text-primary dark:bg-primary/15 dark:text-primary/85 dark:group-hover:bg-primary/24 dark:group-hover:text-primary"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span
                            className={`text-xs font-medium leading-tight ${
                              isActive
                                ? "text-primary-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {source.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* District filter */}
                {activeDiscoverySource === "district" && (
                  <HorizontalScroller
                    ariaLabel={t(
                      "home.discovery.districtsAria",
                      undefined,
                      "Popular districts",
                    )}
                    className="-mx-2 px-2"
                  >
                    {popularDistricts.map((district) => {
                      const isActive = selectedDistrict === district.name;
                      const label = getTranslatedText(
                        district.nameKey,
                        district.name,
                        t,
                      );
                      return (
                        <button
                          type="button"
                          key={district.id}
                          onClick={() => {
                            setSelectedDistrict(
                              isActive ? null : district.name,
                            );
                            setActiveDiscoverySource("district");
                          }}
                          className={`flex-shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            isActive
                              ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                              : "border-border/70 bg-card text-foreground hover:border-primary/60 hover:bg-primary/12 dark:hover:bg-primary/24 dark:hover:text-cream"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </HorizontalScroller>
                )}

                {/* Type filter */}
                {activeDiscoverySource === "type" && (
                  <div className="flex flex-wrap gap-2">
                    {typeDiscoveryOptions.map((option) => {
                      const isActive = selectedVenueType === option.id;
                      return (
                        <button
                          type="button"
                          key={option.id}
                          onClick={() => {
                            setSelectedVenueType(isActive ? null : option.id);
                            setActiveDiscoverySource("type");
                          }}
                          className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            isActive
                              ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                              : "border-border/70 bg-card text-foreground hover:border-primary/60 hover:bg-primary/12 dark:hover:bg-primary/24 dark:hover:text-cream"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Price range filter */}
                {activeDiscoverySource === "price-range" && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {localizedPriceRangeOptions.map((option) => {
                      const isActive = selectedPriceRange === option.id;
                      return (
                        <button
                          type="button"
                          key={option.id}
                          onClick={() => handlePriceRangeSelect(option.id)}
                          className={`rounded-2xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            isActive
                              ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                              : "border-border/60 bg-card hover:border-primary/60 hover:bg-primary/10 dark:hover:bg-primary/20 dark:hover:text-cream"
                          }`}
                        >
                          <p
                            className={`text-sm font-semibold tracking-tight ${isActive ? "text-primary-foreground" : "text-foreground"}`}
                          >
                            {option.label}
                          </p>
                          <p
                            className={`text-[11px] font-medium ${isActive ? "text-primary-foreground/85" : "text-muted-foreground"}`}
                          >
                            {option.caption}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Top-rated area filter */}
                {activeDiscoverySource === "top-rated-area" && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                      {t("home.discovery.selectArea")}
                    </p>
                    <HorizontalScroller
                      ariaLabel={t(
                        "home.discovery.areasAria",
                        undefined,
                        "Popular areas",
                      )}
                      className="-mx-2 px-2"
                    >
                      {popularDistricts.map((district) => {
                        const isActive = selectedArea === district.name;
                        const label = getTranslatedText(
                          district.nameKey,
                          district.name,
                          t,
                        );
                        return (
                          <button
                            type="button"
                            key={`${district.id}-area`}
                            onClick={() => {
                              setSelectedArea(district.name);
                              setActiveDiscoverySource("top-rated-area");
                            }}
                            className={`flex-shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                              isActive
                                ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                                : "border-border/70 bg-card text-foreground hover:border-primary/60 hover:bg-primary/12 dark:hover:bg-primary/24 dark:hover:text-cream"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </HorizontalScroller>
                  </div>
                )}

                {/* Results count row */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {t("home.discovery.results", {
                        count: formatNumber(discoveryResultCount),
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[170px] text-right">
                      {t("home.discovery.sourceLabel", {
                        source: t(
                          `home.discovery.source.${activeDiscoverySource}`,
                          undefined,
                          activeDiscoverySource.replace("-", " "),
                        ),
                      })}
                    </p>
                  </div>

                  {/* Discovery results — CSS fade between states */}
                  {showDiscoverySkeleton ? (
                    <HorizontalScroller
                      ariaLabel={t("home.scroller.label.discovery")}
                      className="-mx-2 px-2"
                    >
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-[280px] h-[240px] flex-shrink-0 rounded-2xl bg-muted animate-pulse"
                        />
                      ))}
                    </HorizontalScroller>
                  ) : discoveryError ? (
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4">
                      <p className="text-sm font-semibold text-destructive">
                        {t("home.discovery.errorTitle")}
                      </p>
                      <p className="text-xs text-destructive/80 mt-1">
                        {discoveryError}
                      </p>
                      <Button
                        type="button"
                        onClick={retryDiscovery}
                        variant="outline"
                        size="sm"
                        className="mt-3 h-8 rounded-full border-destructive/30 px-3 text-xs font-semibold text-destructive hover:bg-destructive/5 hover:text-destructive"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {t("home.discovery.retry")}
                      </Button>
                    </div>
                  ) : discoveryPlaces.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-card/70 px-4 py-8 text-center">
                      <p className="font-semibold text-foreground">
                        {t("home.discovery.emptyTitle")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("home.discovery.emptyDescription")}
                      </p>
                    </div>
                  ) : (
                    <HorizontalScroller
                      ariaLabel={t("home.scroller.label.discovery")}
                      className="-mx-2 px-2"
                    >
                      {discoveryPlaces.map((place) => (
                        <div
                          key={`${activeDiscoverySource}-${place.id}`}
                          className="snap-start"
                        >
                          <PlaceCard
                            place={place}
                            variant="horizontal"
                            userLocation={userLocation}
                            onToggleSave={toggleSave}
                            isSavePending={isPlaceSavePending(place.id)}
                            onClick={(id) => navigate(`/venue/${id}`)}
                          />
                        </div>
                      ))}
                    </HorizontalScroller>
                  )}
                </div>
              </div>
            </section>

            {/* ── MOOD PICKS — only rendered when mood is selected ── */}
            {selectedMood && (
              <section
                ref={moodSectionRef}
                className="space-y-4 [animation:hp-fade-up_0.25s_ease-out_both]"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                      <div className="rounded-lg bg-secondary/12 p-1.5 dark:bg-primary/18">
                        {(() => {
                          const MoodIcon = selectedMoodOption
                            ? (MOOD_ICON_MAP[selectedMoodOption.icon] ??
                              Sparkles)
                            : Sparkles;
                          return (
                            <MoodIcon className="h-5 w-5 text-secondary dark:text-primary" />
                          );
                        })()}
                      </div>
                      {selectedMoodOption?.label
                        ? getMoodLabel(
                            selectedMoodOption.id,
                            selectedMoodOption.label,
                          )
                        : t("home.mood.defaultTitle")}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground sm:ml-10">
                      {selectedMoodOption?.description
                        ? getMoodDescription(
                            selectedMoodOption.id,
                            selectedMoodOption.description,
                          )
                        : t("home.mood.defaultDescription")}
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedMood(null)}
                    variant="ghost"
                    size="sm"
                    className="h-11 px-3 text-xs text-muted-foreground sm:h-8 sm:px-2"
                  >
                    {t("home.mood.clear")}
                  </Button>
                </div>

                {isMoodLoading ? (
                  <HorizontalScroller ariaLabel={t("home.scroller.label.mood")}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-[280px] h-[240px] flex-shrink-0 rounded-2xl bg-muted animate-pulse"
                      />
                    ))}
                  </HorizontalScroller>
                ) : moodError ? (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4">
                    <p className="text-sm font-semibold text-destructive">
                      {t("home.mood.errorTitle")}
                    </p>
                    <p className="text-xs text-destructive/80 mt-1">
                      {moodError}
                    </p>
                    <Button
                      type="button"
                      onClick={retryMood}
                      variant="outline"
                      size="sm"
                      className="mt-3 h-8 rounded-full border-destructive/30 px-3 text-xs font-semibold text-destructive hover:bg-destructive/5 hover:text-destructive"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      {t("home.mood.retry")}
                    </Button>
                  </div>
                ) : moodPlaces.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/30">
                    <span className="text-3xl mb-3">🔍</span>
                    <p className="font-semibold text-foreground">
                      {t("home.mood.emptyTitle")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("home.mood.emptyDescription")}
                    </p>
                  </div>
                ) : (
                  <HorizontalScroller ariaLabel={t("home.scroller.label.mood")}>
                    {moodPlaces.map((place) => (
                      <div key={place.id} className="snap-start">
                        <PlaceCard
                          place={place}
                          variant="horizontal"
                          userLocation={userLocation}
                          onToggleSave={toggleSave}
                          isSavePending={isPlaceSavePending(place.id)}
                          onClick={(id) => navigate(`/venue/${id}`)}
                        />
                      </div>
                    ))}
                  </HorizontalScroller>
                )}
              </section>
            )}

            {/* ── CURATED FOR YOU ── */}
            <section
              className="space-y-4"
              data-tour="tour-curated"
              id="tour-curated"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                    <div className="p-1.5 rounded-lg bg-secondary/15 dark:bg-primary/20">
                      <Sparkles className="h-5 w-5 text-secondary dark:text-primary" />
                    </div>
                    {t("home.curated.title")}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground sm:ml-10">
                    {t("home.curated.subtitle")}
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/home/see-all/curated")}
                  variant="ghost"
                  size="sm"
                  className="h-11 px-3 text-xs text-muted-foreground hover:text-foreground sm:h-8 sm:px-2"
                >
                  {t("home.seeAll")}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              <HorizontalScroller ariaLabel={t("home.scroller.label.curated")}>
                {curatedPlaces.map((place) => (
                  <div key={place.id} className="snap-start">
                    <PlaceCard
                      place={place}
                      variant="horizontal"
                      userLocation={userLocation}
                      onToggleSave={toggleSave}
                      isSavePending={isPlaceSavePending(place.id)}
                      onClick={(id) => navigate(`/venue/${id}`)}
                    />
                  </div>
                ))}
              </HorizontalScroller>
            </section>

            {/* ── TRENDING NOW ── */}
            {trendingPlaces.length > 0 && (
              <section className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                      <div className="p-1.5 rounded-lg bg-secondary/15 dark:bg-primary/20">
                        <Flame className="h-5 w-5 text-secondary dark:text-primary" />
                      </div>
                      {t("home.trending.title")}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground sm:ml-10">
                      {t("home.trending.subtitle")}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/home/see-all/trending")}
                    variant="ghost"
                    size="sm"
                    className="h-11 px-3 text-xs text-muted-foreground hover:text-foreground sm:h-8 sm:px-2"
                  >
                    {t("home.seeAll")}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <HorizontalScroller
                  ariaLabel={t("home.scroller.label.trending")}
                >
                  {trendingPlaces.map((place) => (
                    <div key={place.id} className="snap-start">
                      <PlaceCard
                        place={place}
                        variant="horizontal"
                        userLocation={userLocation}
                        onToggleSave={toggleSave}
                        isSavePending={isPlaceSavePending(place.id)}
                        onClick={(id) => navigate(`/venue/${id}`)}
                      />
                    </div>
                  ))}
                </HorizontalScroller>
              </section>
            )}

            {/* ── SIMILAR PLACES STUDIO ── */}
            <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/30 p-5 sm:p-6 shadow-sm">
              <div className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/12 text-secondary dark:bg-primary/18 dark:text-primary">
                        <WandSparkles className="h-4 w-4" />
                      </span>
                      {t("home.similar.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("home.similar.subtitle")}
                    </p>
                  </div>
                  {selectedSimilarSeedPlace && (
                    <span
                      className="max-w-full truncate rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-medium text-foreground"
                      title={selectedSimilarSeedPlace.name}
                    >
                      {t("home.similar.selected", {
                        name: selectedSimilarSeedPlace.name,
                      })}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Search input + autocomplete dropdown */}
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground/75 [inset-inline-start:1rem]" />
                    <Input
                      value={similarSearchInput}
                      onChange={(e) => setSimilarSearchInput(e.target.value)}
                      onFocus={() => setIsSimilarInputFocused(true)}
                      onBlur={() => {
                        setTimeout(() => setIsSimilarInputFocused(false), 120);
                      }}
                      placeholder={t("home.similar.searchPlaceholder")}
                      className="h-12 rounded-2xl border-border/70 bg-card/90 [padding-inline-start:2.75rem] focus-visible:ring-secondary/30"
                    />

                    {/* Autocomplete dropdown — absolutely positioned, isolated layer */}
                    {showSimilarSuggestions && (
                      <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-border/70 bg-card p-2 shadow-lg [animation:hp-fade-up_0.15s_ease-out_both]">
                        {similarSearchResults.length > 0 ? (
                          similarSearchResults.map((place) => {
                            const isActive = selectedSimilarSeedId === place.id;
                            return (
                              <button
                                type="button"
                                key={`suggestion-${place.id}`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setSimilarSearchInput(place.name);
                                  selectPlaceForSimilar(place.id);
                                }}
                                className={`w-full rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                                  isActive
                                    ? "bg-primary text-primary-foreground dark:text-cream"
                                    : "hover:bg-primary/12 hover:text-primary dark:hover:bg-primary/24 dark:hover:text-cream"
                                }`}
                              >
                                <p
                                  className={`text-sm font-semibold ${isActive ? "text-primary-foreground dark:text-cream" : "text-foreground"}`}
                                >
                                  {place.name}
                                </p>
                                <p
                                  className={`mt-0.5 truncate text-xs ${isActive ? "text-primary-foreground/90 dark:text-cream/90" : "text-muted-foreground"}`}
                                >
                                  {place.address}
                                </p>
                              </button>
                            );
                          })
                        ) : (
                          <p className="px-3 py-2 text-xs text-muted-foreground">
                            {t("home.similar.noMatches")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick seed chips */}
                  <div className="flex flex-wrap gap-2">
                    {similarSeedOptions.slice(0, 6).map((place) => {
                      const isActive = selectedSimilarSeedId === place.id;
                      return (
                        <button
                          type="button"
                          key={`quick-seed-${place.id}`}
                          onClick={() => {
                            setSimilarSearchInput(place.name);
                            selectPlaceForSimilar(place.id);
                          }}
                          className={`rounded-full border px-4 py-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            isActive
                              ? "border-primary/85 bg-primary text-primary-foreground shadow-sm dark:text-cream"
                              : "border-border/70 bg-card text-foreground hover:border-primary/60 hover:bg-primary/12 dark:hover:bg-primary/24 dark:hover:text-cream"
                          }`}
                        >
                          {place.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Similar results */}
                {isSimilarLoading ? (
                  <HorizontalScroller
                    ariaLabel={t("home.scroller.label.similar")}
                    className="-mx-2 px-2"
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={`similar-skeleton-${i}`}
                        className="w-[280px] h-[240px] flex-shrink-0 rounded-2xl bg-muted animate-pulse"
                      />
                    ))}
                  </HorizontalScroller>
                ) : similarError ? (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4">
                    <p className="text-sm font-semibold text-destructive">
                      {t("home.similar.errorTitle")}
                    </p>
                    <p className="text-xs text-destructive/80 mt-1">
                      {similarError}
                    </p>
                    <Button
                      type="button"
                      onClick={retrySimilar}
                      variant="outline"
                      size="sm"
                      className="mt-3 h-8 rounded-full border-destructive/30 px-3 text-xs font-semibold text-destructive hover:bg-destructive/5 hover:text-destructive"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      {t("home.similar.retry")}
                    </Button>
                  </div>
                ) : similarPlaces.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-card/70 px-4 py-8 text-center">
                    <p className="font-semibold text-foreground">
                      {t("home.similar.emptyTitle")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("home.similar.emptyDescription")}
                    </p>
                  </div>
                ) : (
                  <HorizontalScroller
                    ariaLabel={t("home.scroller.label.similar")}
                    className="-mx-2 px-2"
                  >
                    {similarPlaces.map((place) => (
                      <div key={`similar-${place.id}`} className="snap-start">
                        <PlaceCard
                          place={place}
                          variant="horizontal"
                          userLocation={userLocation}
                          onToggleSave={toggleSave}
                          isSavePending={isPlaceSavePending(place.id)}
                          hideTopRatedBadge={showSimilarSuggestions}
                          onClick={(id) => navigate(`/venue/${id}`)}
                        />
                      </div>
                    ))}
                  </HorizontalScroller>
                )}
              </div>
            </section>
          </div>
          {/* end LEFT */}

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="sticky top-6 hidden w-[280px] flex-shrink-0 flex-col gap-6 lg:flex">
            <GroupSessionWidget variant="sidebar" />

            {/* Sidebar Mood Selector */}
            <div
              className="bg-card rounded-3xl border border-border/50 shadow-sm p-5 space-y-4"
              data-tour="tour-mood"
              id="tour-mood"
            >
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <span className="text-xl">✨</span>
                {t("home.sidebar.moodTitle")}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {moodOptions.map((mood) => {
                  const isActive = selectedMood === mood.id;
                  const MoodIcon = MOOD_ICON_MAP[mood.icon] ?? Sparkles;
                  return (
                    <button
                      type="button"
                      key={mood.id}
                      onClick={() => handleMoodOptionSelect(mood.id, isActive)}
                      className={`flex min-h-[44px] flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                        isActive
                          ? "border-primary/85 bg-primary text-primary-foreground shadow-sm dark:text-cream"
                          : "bg-background border-border/50 hover:border-primary/55 hover:bg-primary/12 dark:hover:bg-primary/24 dark:hover:text-cream"
                      }`}
                    >
                      <MoodIcon
                        className={cn(
                          "h-5 w-5",
                          isActive
                            ? "text-primary-foreground dark:text-cream"
                            : "text-secondary dark:text-primary",
                        )}
                      />
                      <span
                        className={cn(
                          "text-[11px] font-medium leading-tight",
                          isActive
                            ? "text-primary-foreground dark:text-cream"
                            : "text-foreground",
                        )}
                      >
                        {getMoodLabel(mood.id, mood.label)}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] leading-tight",
                          isActive
                            ? "text-primary-foreground/90 dark:text-cream/90"
                            : "text-muted-foreground",
                        )}
                      >
                        {getMoodDescription(mood.id, mood.description)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @keyframes hp-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
