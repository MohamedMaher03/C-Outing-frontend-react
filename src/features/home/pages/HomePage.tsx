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
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { Input } from "@/components/ui/input";
import PlaceCard from "@/features/home/components/PlaceCard";
import LocationPermissionBanner from "@/features/home/components/LocationPermissionBanner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useHome } from "@/features/home/hooks/useHomeHook";
import { cn } from "@/lib/utils";
import {
  FILTER_OPTIONS,
  DISCOVERY_SOURCE_OPTIONS,
  MOOD_ICON_MAP,
  VENUE_PRICE_RANGE_OPTIONS,
} from "@/features/home/mocks";
import type { VenuePriceRange } from "@/features/home/types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import cairoBg from "@/assets/images/cairo-bg.jpg";

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    setCanScrollLeft(element.scrollLeft > 8);
    setCanScrollRight(element.scrollLeft < maxScrollLeft - 8);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    element.addEventListener("scroll", updateScrollButtons, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollButtons);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener("scroll", updateScrollButtons);
      resizeObserver.disconnect();
    };
  }, [updateScrollButtons]);

  useEffect(() => {
    updateScrollButtons();
  }, [children, updateScrollButtons]);

  const scrollByDirection = (direction: "left" | "right") => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const amount = Math.max(Math.round(element.clientWidth * 0.8), 280);
    element.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollByDirection("left")}
        aria-label={`Scroll ${ariaLabel} left`}
        disabled={!canScrollLeft}
        className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-card/95 text-foreground shadow-sm transition-opacity hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 md:inline-flex"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div
        ref={scrollRef}
        className={cn(
          "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 scrollbar-hide",
          className,
        )}
        aria-label={ariaLabel}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scrollByDirection("right")}
        aria-label={`Scroll ${ariaLabel} right`}
        disabled={!canScrollRight}
        className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-card/95 text-foreground shadow-sm transition-opacity hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 md:inline-flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    trendingTags,
    popularDistricts,
  } = useHome();

  const compactNumberFormatter = useMemo(
    () => new Intl.NumberFormat(undefined, { notation: "compact" }),
    [],
  );

  const typeDiscoveryOptions = categories.map((category) => ({
    id: category.id,
    label: category.label,
  }));

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

  const similarSearchResults = useMemo(() => {
    const query = similarSearchInput.trim().toLowerCase();
    if (!query) {
      return similarSeedOptions.slice(0, 8);
    }

    return similarSeedOptions
      .filter((place) => {
        const tags = (place.atmosphereTags ?? []).join(" ").toLowerCase();
        return (
          place.name.toLowerCase().includes(query) ||
          place.address.toLowerCase().includes(query) ||
          place.category.toLowerCase().includes(query) ||
          tags.includes(query)
        );
      })
      .slice(0, 8);
  }, [similarSearchInput, similarSeedOptions]);

  const showSimilarSuggestions =
    isSimilarInputFocused ||
    (similarSearchInput.trim().length > 0 &&
      similarSearchInput !== selectedSimilarSeedPlace?.name);
  const shouldReduceMotion = useReducedMotion();

  const stateTransition = useMemo(
    () => ({
      duration: shouldReduceMotion ? 0.01 : 0.24,
      ease: EASE_OUT_QUART,
    }),
    [shouldReduceMotion],
  );

  const heroContainerVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduceMotion ? 0.01 : 0.62,
          ease: EASE_OUT_EXPO,
          staggerChildren: shouldReduceMotion ? 0 : 0.12,
          delayChildren: shouldReduceMotion ? 0 : 0.08,
        },
      },
    }),
    [shouldReduceMotion],
  );

  const heroItemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduceMotion ? 0.01 : 0.48,
          ease: EASE_OUT_QUART,
        },
      },
    }),
    [shouldReduceMotion],
  );

  const cardDelay = useCallback(
    (index: number, base = 0) =>
      shouldReduceMotion ? 0 : base + Math.min(index * 0.06, 0.28),
    [shouldReduceMotion],
  );

  const handlePriceRangeSelect = (priceRange: VenuePriceRange) => {
    setSelectedPriceRange(
      selectedPriceRange === priceRange ? null : priceRange,
    );
    setActiveDiscoverySource("price-range");
  };

  const scrollMoodSectionIntoView = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const maxAttempts = 8;
    let attempts = 0;

    const tryScroll = () => {
      const moodSection = moodSectionRef.current;
      if (moodSection) {
        moodSection.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
        return;
      }

      attempts += 1;
      if (attempts < maxAttempts) {
        window.requestAnimationFrame(tryScroll);
      }
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const userName = user?.name?.split(" ")[0] || "Explorer";

  if (isLoading) {
    return (
      <PageLoading
        text="Discovering Cairo"
        subText="Finding the best places for you..."
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
            className="w-full overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-xl backdrop-blur-md"
            role="alert"
            aria-live="assertive"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-6 p-6 sm:p-8 lg:p-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Something went wrong
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    We could not load your home feed right now
                  </h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    No worries, your account and preferences are safe. Please
                    try again in a moment.
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
                    Try again
                  </Button>

                  <Button
                    type="button"
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="h-10 rounded-full border-border/70 bg-background/60 px-5 text-sm font-semibold text-foreground hover:bg-background"
                  >
                    Refresh page
                  </Button>
                </div>
              </div>

              <aside className="border-t border-border/70 bg-background/45 p-6 sm:p-8 lg:border-l lg:border-t-0">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Quick check
                </h2>

                <ul className="mt-4 space-y-3">
                  <li className="rounded-2xl border border-border/70 bg-card/70 p-3 text-sm text-foreground">
                    <span className="flex items-center gap-2 font-semibold text-foreground">
                      <Wifi className="h-4 w-4 text-secondary" />
                      Network connection
                    </span>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Confirm your internet is active, then retry.
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

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : 0.32,
        ease: EASE_OUT_QUART,
      }}
    >
      {/* ====== HERO SECTION ====== */}
      <div className="relative h-[340px] overflow-hidden sm:h-[390px] lg:h-[420px]">
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${cairoBg})` }}
          initial={{ scale: shouldReduceMotion ? 1 : 1.06 }}
          animate={{ scale: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0.01 : 0.85,
            ease: EASE_OUT_EXPO,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy)/0.86)] via-[hsl(var(--navy)/0.56)] to-transparent dark:from-black/72 dark:via-black/46" />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--navy)/0.26)] via-transparent to-black/10 dark:from-black/24 dark:to-black/18" />

        <motion.div
          className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-5 pt-8 sm:pb-6 sm:pt-10"
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-6 space-y-2" variants={heroItemVariants}>
            <p className="text-white/80 text-sm font-medium tracking-wide uppercase">
              {getGreeting()}, {userName} ✦
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-5xl lg:text-[3.4rem]">
              <span className="text-cream">Discover Cairo</span>
            </h1>
            <p className="max-w-md text-sm text-white/85 sm:text-base">
              AI-powered spots curated for your vibe. Where are we heading
              today?
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="relative w-full max-w-2xl"
            variants={heroItemVariants}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary/85" />
            <Input
              placeholder="Search places, districts, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search Cairo venues"
              className="h-12 rounded-2xl border border-white/20 bg-black/25 pl-12 pr-14 text-base text-white shadow-lg transition-colors placeholder:text-white/65 focus:border-secondary/70 focus:bg-black/30 focus:ring-secondary/20 backdrop-blur-md sm:h-14"
            />
          </motion.div>

          {/* Filter Pills */}
          <motion.div
            className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide"
            aria-label="Filter venues"
            variants={heroItemVariants}
          >
            {FILTER_OPTIONS.map((filter, index) => {
              const Icon = filter.icon;
              const isActive =
                filter.id === "all"
                  ? selectedFilters.length === 0
                  : selectedFilters.includes(filter.id);
              return (
                <motion.button
                  type="button"
                  key={filter.id}
                  aria-pressed={isActive}
                  onClick={() => toggleFilter(filter.id)}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : { y: -2, transition: { duration: 0.16 } }
                  }
                  whileTap={
                    shouldReduceMotion
                      ? undefined
                      : { scale: 0.97, transition: { duration: 0.1 } }
                  }
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0.01 : 0.26,
                    ease: EASE_OUT_QUART,
                    delay: cardDelay(index, 0.18),
                  }}
                  className={`inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-5 ${
                    isActive
                      ? "border-accent/90 bg-accent text-accent-foreground shadow-sm"
                      : "border-white/20 bg-black/20 text-white/90 backdrop-blur-md hover:border-primary/65 hover:bg-primary/28 hover:text-primary-foreground dark:hover:bg-primary/35 dark:hover:text-cream"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {filter.label}
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="max-w-7xl mx-auto px-4 pt-4"
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0.01 : 0.36,
          ease: EASE_OUT_QUART,
          delay: shouldReduceMotion ? 0 : 0.1,
        }}
      >
        <LocationPermissionBanner
          userLocation={userLocation}
          onEnableLocation={requestUserLocation}
        />
      </motion.div>

      <AnimatePresence initial={false}>
        {saveError && (
          <motion.div
            key="save-error"
            className="mx-auto mt-4 max-w-7xl px-4"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
            transition={stateTransition}
          >
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
                  Dismiss
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== MAIN CONTENT: TWO-COLUMN LAYOUT ====== */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* ── LEFT: Main Feed ── */}
          <div className="flex-1 min-w-0 space-y-12">
            {/* ── QUICK CONTROLS (MOBILE/TABLET) ── */}
            <section className="space-y-4 lg:hidden">
              <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-foreground">
                    Mood selector
                  </h2>
                  <span className="text-xs font-medium text-muted-foreground">
                    Tap to personalize suggestions
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
                        className={`flex min-h-11 items-center gap-2 rounded-2xl border px-3 py-2 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                          isActive
                            ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                            : "border-border/60 bg-background hover:border-primary/55 hover:bg-primary/12"
                        }`}
                      >
                        <MoodIcon className="h-4 w-4 shrink-0 text-secondary/90" />
                        <span className="min-w-0 truncate text-xs font-medium text-foreground">
                          {mood.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
                <h2 className="text-base font-semibold text-foreground">
                  Trending tags
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {trendingTags.map((tag) => (
                    <button
                      type="button"
                      key={`mobile-tag-${tag.id}`}
                      onClick={() => setSearch(tag.label)}
                      className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border/60 bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors duration-200 hover:border-primary/55 hover:bg-primary/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <span className="text-muted-foreground">#</span>
                      <span
                        className="max-w-[120px] truncate"
                        title={tag.label}
                      >
                        {tag.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {compactNumberFormatter.format(tag.searchCount)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Venue Discovery Studio (New Endpoints) ── */}
            <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/30 p-5 sm:p-6 shadow-sm">
              <div className="relative z-10 space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/12 text-secondary">
                        <Compass className="h-4 w-4" />
                      </span>
                      Venue Discovery Studio
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Explore live venue slices by district, type, budget, and
                      rating intelligence.
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-2 text-xs sm:w-auto sm:justify-end">
                    <span className="max-w-[180px] truncate rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1.5 font-medium text-foreground">
                      Top Rated:{" "}
                      {compactNumberFormatter.format(
                        globalTopRatedVenues.length,
                      )}
                    </span>
                    <span className="max-w-[180px] truncate rounded-full border border-border/70 bg-background px-3 py-1.5 font-medium text-foreground">
                      {selectedArea}:{" "}
                      {compactNumberFormatter.format(
                        topRatedInAreaVenues.length,
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {DISCOVERY_SOURCE_OPTIONS.map((source) => {
                    const Icon = source.icon;
                    const isActive = activeDiscoverySource === source.id;
                    return (
                      <button
                        type="button"
                        key={source.id}
                        onClick={() => setActiveDiscoverySource(source.id)}
                        className={`group min-h-11 rounded-2xl border px-3 py-2.5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
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
                                : "bg-muted/80 text-muted-foreground group-hover:text-primary dark:group-hover:text-cream"
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

                {activeDiscoverySource === "district" && (
                  <div className="flex flex-wrap gap-2">
                    {popularDistricts.map((district) => {
                      const isActive = selectedDistrict === district.name;
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
                          className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            isActive
                              ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                              : "border-border/70 bg-card text-foreground hover:border-primary/60 hover:bg-primary/12 dark:hover:bg-primary/24 dark:hover:text-cream"
                          }`}
                        >
                          {district.name}
                        </button>
                      );
                    })}
                  </div>
                )}

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

                {activeDiscoverySource === "price-range" && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {VENUE_PRICE_RANGE_OPTIONS.map((option) => {
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
                            className={`text-sm font-semibold tracking-tight ${
                              isActive
                                ? "text-primary-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {option.label}
                          </p>
                          <p
                            className={`text-[11px] font-medium ${
                              isActive
                                ? "text-primary-foreground/85"
                                : "text-muted-foreground"
                            }`}
                          >
                            {option.caption}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeDiscoverySource === "top-rated-area" && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                      Select Area
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {popularDistricts.map((district) => {
                        const isActive = selectedArea === district.name;
                        return (
                          <button
                            type="button"
                            key={`${district.id}-area`}
                            onClick={() => {
                              setSelectedArea(district.name);
                              setActiveDiscoverySource("top-rated-area");
                            }}
                            className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                              isActive
                                ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                                : "border-border/70 bg-card text-foreground hover:border-primary/60 hover:bg-primary/12 dark:hover:bg-primary/24 dark:hover:text-cream"
                            }`}
                          >
                            {district.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {new Intl.NumberFormat().format(discoveryResultCount)}{" "}
                      venue
                      {discoveryResultCount === 1 ? "" : "s"} found
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[170px] text-right">
                      Source: {activeDiscoverySource.replace("-", " ")}
                    </p>
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                    {showDiscoverySkeleton ? (
                      <motion.div
                        key="discovery-loading"
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                        transition={stateTransition}
                      >
                        <HorizontalScroller
                          ariaLabel="discovery venues"
                          className="-mx-2 px-2"
                        >
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-[280px] h-[240px] flex-shrink-0 rounded-2xl bg-muted animate-pulse"
                            />
                          ))}
                        </HorizontalScroller>
                      </motion.div>
                    ) : discoveryError ? (
                      <motion.div
                        key="discovery-error"
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                        transition={stateTransition}
                        className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4"
                      >
                        <p className="text-sm font-semibold text-destructive">
                          Could not load discovery venues
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
                          Retry discovery
                        </Button>
                      </motion.div>
                    ) : discoveryPlaces.length === 0 ? (
                      <motion.div
                        key="discovery-empty"
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                        transition={stateTransition}
                        className="rounded-2xl border border-dashed border-border/70 bg-card/70 px-4 py-8 text-center"
                      >
                        <p className="font-semibold text-foreground">
                          No venues for this filter yet
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Try another district, type, or budget range.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="discovery-ready"
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                        transition={stateTransition}
                      >
                        <HorizontalScroller
                          ariaLabel="discovery venues"
                          className="-mx-2 px-2"
                        >
                          {discoveryPlaces.map((place, index) => (
                            <motion.div
                              key={`${activeDiscoverySource}-${place.id}`}
                              className="snap-start"
                              initial={{
                                opacity: 0,
                                y: shouldReduceMotion ? 0 : 12,
                              }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: shouldReduceMotion ? 0.01 : 0.3,
                                ease: EASE_OUT_QUART,
                                delay: cardDelay(index),
                              }}
                            >
                              <PlaceCard
                                place={place}
                                variant="horizontal"
                                userLocation={userLocation}
                                onToggleSave={toggleSave}
                                isSavePending={isPlaceSavePending(place.id)}
                                onClick={(id) => navigate(`/venue/${id}`)}
                              />
                            </motion.div>
                          ))}
                        </HorizontalScroller>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* ── Mood Picks ── */}
            <AnimatePresence initial={false} mode="wait">
              {selectedMood && (
                <motion.section
                  ref={moodSectionRef}
                  className="space-y-4"
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                  transition={{
                    duration: shouldReduceMotion ? 0.01 : 0.28,
                    ease: EASE_OUT_QUART,
                  }}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                        <div className="rounded-lg bg-secondary/12 p-1.5">
                          {(() => {
                            const mood = moodOptions.find(
                              (m) => m.id === selectedMood,
                            );
                            const MoodIcon = mood
                              ? (MOOD_ICON_MAP[mood.icon] ?? Sparkles)
                              : Sparkles;
                            return (
                              <MoodIcon className="h-5 w-5 text-secondary" />
                            );
                          })()}
                        </div>
                        {moodOptions.find((m) => m.id === selectedMood)
                          ?.label ?? "Mood Picks"}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground sm:ml-10">
                        {moodOptions.find((m) => m.id === selectedMood)
                          ?.description ?? "Places that match your vibe"}
                      </p>
                    </div>
                    <Button
                      onClick={() => setSelectedMood(null)}
                      variant="ghost"
                      size="sm"
                      className="h-11 px-3 text-xs text-muted-foreground sm:h-8 sm:px-2"
                    >
                      Clear mood
                    </Button>
                  </div>

                  {isMoodLoading ? (
                    <HorizontalScroller ariaLabel="mood venues">
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
                        Could not load mood picks
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
                        Retry mood picks
                      </Button>
                    </div>
                  ) : moodPlaces.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/30">
                      <span className="text-3xl mb-3">🔍</span>
                      <p className="font-semibold text-foreground">
                        No spots found for this mood
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try a different vibe!
                      </p>
                    </div>
                  ) : (
                    <HorizontalScroller ariaLabel="mood venues">
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
                </motion.section>
              )}
            </AnimatePresence>

            {/* ── Curated For You ── */}
            <section className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                    <div className="p-1.5 rounded-lg bg-secondary/15">
                      <Sparkles className="h-5 w-5 text-secondary" />
                    </div>
                    Curated for You
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground sm:ml-10">
                    AI-powered picks based on your preferences
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/home/see-all/curated")}
                  variant="ghost"
                  size="sm"
                  className="h-11 px-3 text-xs text-muted-foreground hover:text-foreground sm:h-8 sm:px-2"
                >
                  See all <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              <HorizontalScroller ariaLabel="curated venues">
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

            {/* ── Trending Now ── */}
            {trendingPlaces.length > 0 && (
              <section className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                      <div className="p-1.5 rounded-lg bg-secondary/15">
                        <Flame className="h-5 w-5 text-secondary" />
                      </div>
                      Trending Now
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground sm:ml-10">
                      Most popular this week in Cairo
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/home/see-all/trending")}
                    variant="ghost"
                    size="sm"
                    className="h-11 px-3 text-xs text-muted-foreground hover:text-foreground sm:h-8 sm:px-2"
                  >
                    See all <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <HorizontalScroller ariaLabel="trending venues">
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

            {/* ── Similar Places Studio ── */}
            <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/30 p-5 sm:p-6 shadow-sm">
              <div className="relative z-10 space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/12 text-secondary">
                        <WandSparkles className="h-4 w-4" />
                      </span>
                      Because You Like This Place
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pick one venue and we will get similar recommendations
                      instantly for you.
                    </p>
                  </div>
                  {selectedSimilarSeedPlace && (
                    <span
                      className="max-w-full truncate rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-medium text-foreground"
                      title={selectedSimilarSeedPlace.name}
                    >
                      Selected: {selectedSimilarSeedPlace.name}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      value={similarSearchInput}
                      onChange={(e) => setSimilarSearchInput(e.target.value)}
                      onFocus={() => setIsSimilarInputFocused(true)}
                      onBlur={() => {
                        setTimeout(() => setIsSimilarInputFocused(false), 120);
                      }}
                      placeholder="Type a place you like (name, area, or tag)..."
                      className="h-12 rounded-2xl border-border/70 bg-card/90 focus-visible:ring-secondary/30"
                    />

                    <AnimatePresence>
                      {showSimilarSuggestions && (
                        <motion.div
                          key="similar-suggestions"
                          initial={{
                            opacity: 0,
                            y: shouldReduceMotion ? 0 : -8,
                          }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                          transition={stateTransition}
                          className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-border/70 bg-card p-2 shadow-lg"
                        >
                          {similarSearchResults.length > 0 ? (
                            similarSearchResults.map((place) => {
                              const isActive =
                                selectedSimilarSeedId === place.id;
                              return (
                                <button
                                  type="button"
                                  key={`suggestion-${place.id}`}
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                  }}
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
                                    className={`text-sm font-semibold ${
                                      isActive
                                        ? "text-primary-foreground dark:text-cream"
                                        : "text-foreground"
                                    }`}
                                  >
                                    {place.name}
                                  </p>
                                  <p
                                    className={`mt-0.5 truncate text-xs ${
                                      isActive
                                        ? "text-primary-foreground/90 dark:text-cream/90"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {place.address}
                                  </p>
                                </button>
                              );
                            })
                          ) : (
                            <p className="px-3 py-2 text-xs text-muted-foreground">
                              No matches found. Try another keyword.
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

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

                <AnimatePresence mode="wait" initial={false}>
                  {isSimilarLoading ? (
                    <motion.div
                      key="similar-loading"
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                      transition={stateTransition}
                    >
                      <HorizontalScroller
                        ariaLabel="similar venues"
                        className="-mx-2 px-2"
                      >
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={`similar-skeleton-${i}`}
                            className="w-[280px] h-[240px] flex-shrink-0 rounded-2xl bg-muted animate-pulse"
                          />
                        ))}
                      </HorizontalScroller>
                    </motion.div>
                  ) : similarError ? (
                    <motion.div
                      key="similar-error"
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                      transition={stateTransition}
                      className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4"
                    >
                      <p className="text-sm font-semibold text-destructive">
                        Could not load similar places
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
                        Retry similar picks
                      </Button>
                    </motion.div>
                  ) : similarPlaces.length === 0 ? (
                    <motion.div
                      key="similar-empty"
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                      transition={stateTransition}
                      className="rounded-2xl border border-dashed border-border/70 bg-card/70 px-4 py-8 text-center"
                    >
                      <p className="font-semibold text-foreground">
                        Choose a place to get similar recommendations
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        We will recommend venues with a matching vibe and style.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="similar-ready"
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                      transition={stateTransition}
                    >
                      <HorizontalScroller
                        ariaLabel="similar venues"
                        className="-mx-2 px-2"
                      >
                        {similarPlaces.map((place, index) => (
                          <motion.div
                            key={`similar-${place.id}`}
                            className="snap-start"
                            initial={{
                              opacity: 0,
                              y: shouldReduceMotion ? 0 : 12,
                            }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: shouldReduceMotion ? 0.01 : 0.3,
                              ease: EASE_OUT_QUART,
                              delay: cardDelay(index),
                            }}
                          >
                            <PlaceCard
                              place={place}
                              variant="horizontal"
                              userLocation={userLocation}
                              onToggleSave={toggleSave}
                              isSavePending={isPlaceSavePending(place.id)}
                              hideTopRatedBadge={showSimilarSuggestions}
                              onClick={(id) => navigate(`/venue/${id}`)}
                            />
                          </motion.div>
                        ))}
                      </HorizontalScroller>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="sticky top-6 hidden w-[280px] flex-shrink-0 flex-col gap-6 lg:flex">
            {/* Mood Selector Card */}
            <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-5 space-y-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <span className="text-xl">✨</span>
                What's your mood?
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
                      className={`flex min-h-11 flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
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
                            : "text-secondary",
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
                        {mood.label}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] leading-tight",
                          isActive
                            ? "text-primary-foreground/90 dark:text-cream/90"
                            : "text-muted-foreground",
                        )}
                      >
                        {mood.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trending Tags Card */}
            <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-5 space-y-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Flame className="h-4 w-4 text-secondary" />
                Trending in Cairo
              </h2>
              <div className="flex gap-2 flex-wrap">
                {trendingTags.map((tag) => (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => setSearch(tag.label)}
                    className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border/50 bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors duration-200 hover:border-primary/55 hover:bg-primary/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <span className="text-muted-foreground">#</span>
                    <span className="max-w-[110px] truncate" title={tag.label}>
                      {tag.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {compactNumberFormatter.format(tag.searchCount)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
};

export default HomePage;
