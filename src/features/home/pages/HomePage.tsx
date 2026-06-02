import {
  Search,
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
import { GuidedTour } from "@/features/home/components/GuidedTour";
import { useHomePage } from "@/features/home/hooks/useHomePage";
import { cn } from "@/lib/utils";
import { MOOD_ICON_MAP } from "@/features/home/mocks";
import { AnimatePresence, motion } from "framer-motion";
import cairoBg from "@/assets/images/cairo-bg.jpg";
import { getTranslatedText } from "@/utils/helpers";
import HorizontalScroller from "@/features/home/components/HorizontalScroller";
import { GroupSessionWidget } from "@/features/session/components/GroupSessionWidget";
import { isQuickFilterActive } from "@/features/home/utils/homePagePresentation";

const HomePage = () => {
  const {
    t,
    formatNumber,
    shouldReduceMotion,
    greetingKey,
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
    tourActive,
    currentStep,
    totalSteps,
    tourNext,
    tourPrev,
    tourSkip,
    tourFinish,
    tourJumpTo,
    seedSearchQuery,
    setSeedSearchQuery,
    isSeedSearchLoading,
    seedSearchError,
    setIsSeedInputFocused,
    commitSeedSelection,
    resolvedSeedPlace,
    effectiveSuggestions,
    showSuggestionDropdown,
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
  } = useHomePage();

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
            className="w-full overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-xl backdrop-blur-md"
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
                    onClick={reloadDocument}
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

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: homeMotion.pageFadeDuration,
        ease: homeMotion.easeOutQuart,
      }}
      style={{ willChange: "auto", backfaceVisibility: "hidden" }}
    >
      <AnimatePresence>
        {tourActive && (
          <GuidedTour
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={tourNext}
            onPrev={tourPrev}
            onSkip={tourSkip}
            onFinish={tourFinish}
            onJumpTo={tourJumpTo}
          />
        )}
      </AnimatePresence>

      <div className="relative h-[310px] overflow-hidden sm:h-[380px] lg:h-[430px]">
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${cairoBg})` }}
          initial={{ scale: homeMotion.heroImageScaleFrom }}
          animate={{ scale: 1 }}
          transition={{
            duration: homeMotion.heroImageDuration,
            ease: homeMotion.easeOutExpo,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy)/0.86)] via-[hsl(var(--navy)/0.56)] to-transparent dark:from-black/72 dark:via-black/46" />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--navy)/0.26)] via-transparent to-black/10 dark:from-black/24 dark:to-black/18" />

        <motion.div
          className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-6 pt-8 sm:pb-7 sm:pt-10 lg:pb-8"
          variants={homeMotion.heroContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-5 space-y-1.5" variants={homeMotion.heroItemVariants}>
            <p className="text-white/80 text-xs font-medium tracking-widest uppercase">
              {t(greetingKey)}, {explorerFirstName}{" "}
              <Sparkles className="inline-block h-4 w-4 text-cream" />
            </p>
            <h1 className="text-2xl font-semibold leading-tight sm:text-4xl lg:text-[3.2rem] lg:leading-[1.08]">
              <span className="text-cream">{t("home.hero.title")}</span>
            </h1>
            <p className="max-w-sm text-sm text-white/80 sm:text-base sm:max-w-md leading-snug">
              {t("home.hero.subtitle")}
            </p>
          </motion.div>

          <motion.div
            className="relative w-full max-w-2xl"
            variants={homeMotion.heroItemVariants}
            data-tour="tour-search"
            id="tour-search"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4.5 w-4.5 -translate-y-1/2 text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
            <Input
              placeholder={t("home.hero.searchPlaceholder")}
              value={heroSearchDraft}
              onChange={(e) => setHeroSearchDraft(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") commitHeroSearchNavigation();
              }}
              aria-label={t("home.hero.searchAria")}
              className="h-12 rounded-2xl border border-white/25 bg-white/85 pl-11 pr-[5.5rem] text-sm text-slate-900 shadow-lg transition-colors placeholder:text-slate-500 focus:border-secondary/70 focus:bg-white focus:ring-secondary/20 backdrop-blur-md dark:bg-black/45 dark:text-white dark:placeholder:text-white/65 dark:focus:bg-black/55 sm:h-14 sm:pl-12 sm:pr-28 sm:text-base"
            />
            <button
              type="button"
              onClick={commitHeroSearchNavigation}
              className="absolute right-2 top-1/2 z-10 h-10 min-w-[4.5rem] -translate-y-1/2 rounded-full bg-secondary/90 px-3 text-xs font-semibold text-secondary-foreground shadow-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:h-11 sm:px-4"
              aria-label={t("home.hero.searchAction", undefined, "Search")}
            >
              {t("home.hero.searchAction", undefined, "Search")}
            </button>
          </motion.div>

          <motion.div
            className="-mx-4 mt-3 flex gap-2 overflow-x-auto overflow-y-visible px-4 pb-1 pt-1 scrollbar-hide"
            aria-label={t("home.hero.filterAria")}
            variants={homeMotion.heroItemVariants}
            data-tour="tour-filters"
            id="tour-filters"
          >
            {localizedFilters.map((filter, index) => {
              const Icon = filter.icon;
              const isActive = isQuickFilterActive(filter.id, selectedFilters);
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
                    ease: homeMotion.easeOutQuart,
                    delay: homeMotion.cardDelay(index, 0.18),
                  }}
                  className={`inline-flex h-11 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:h-11 sm:gap-2 sm:px-5 sm:text-sm ${
                    isActive
                      ? "border-accent/90 bg-accent text-accent-foreground shadow-sm"
                      : "border-white/20 bg-black/20 text-white/90 backdrop-blur-md hover:border-primary/65 hover:bg-primary/28 hover:text-primary-foreground dark:hover:bg-primary/35 dark:hover:text-cream"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
          ease: homeMotion.easeOutQuart,
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
            transition={homeMotion.stateTransition}
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
                  {t("common.dismiss")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 pt-5 [padding-bottom:max(2.5rem,calc(env(safe-area-inset-bottom,0px)+2.5rem))] sm:py-6 sm:pb-12 md:py-8 md:pb-8">
        <div className="grid grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div
            className="flex-1 min-w-0 space-y-8 sm:space-y-10 lg:space-y-12"
            style={{ isolation: "isolate" }}
          >
            <section
              className="lg:hidden"
              aria-label={t("session.widget.ariaLabel")}
              data-tour="tour-group"
              id="tour-group"
            >
              <GroupSessionWidget variant="banner" />
            </section>

            <section
              className="space-y-4 lg:hidden"
              style={{ isolation: "isolate", position: "relative", zIndex: 1 }}
              data-tour="tour-mood"
              id="tour-mood"
            >
              <div
                className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
                style={{
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    {t("home.mobile.moodSelectorTitle")}
                  </h2>
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("home.mobile.moodSelectorHint")}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {moodOptions.map((mood) => {
                    const isActive = selectedMood === mood.id;
                    const MoodIcon = MOOD_ICON_MAP[mood.icon] ?? Sparkles;
                    return (
                      <button
                        type="button"
                        key={`mobile-mood-${mood.id}`}
                        onClick={() =>
                          commitMoodSelection(mood.id, isActive)
                        }
                        className={`flex min-h-[2.75rem] items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                          isActive
                            ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                            : "border-border/60 bg-card hover:border-primary/55 hover:bg-primary/10"
                        }`}
                        style={{ transform: "translateZ(0)" }}
                      >
                        <MoodIcon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive
                              ? "text-primary-foreground"
                              : "text-secondary/90 dark:text-primary",
                          )}
                        />
                        <span className="min-w-0 truncate text-xs font-medium text-foreground leading-tight">
                          {translateMoodLabel(mood.id, mood.label)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section
              className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-sm"
              style={{ isolation: "isolate" }}
              data-tour="tour-discovery"
              id="tour-discovery"
            >
              <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                      <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/12 text-secondary dark:bg-primary/18 dark:text-primary sm:h-8 sm:w-8">
                        <Compass className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </span>
                      {t("home.discovery.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5 mb-2 ml-0 sm:mt-2">
                      {t("home.discovery.subtitle")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-2 mb-2" />
                </div>
              </div>

              <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2.5 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
                {localizedDiscoverySources.map((source) => {
                  const Icon = source.icon;
                  const isActive = activeDiscoverySource === source.id;
                  return (
                    <button
                      type="button"
                      key={source.id}
                      onClick={() => setActiveDiscoverySource(source.id)}
                      className={`group min-h-[2.75rem] min-w-[6.5rem] flex-shrink-0 rounded-xl border px-2 py-2 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:min-w-0 sm:rounded-2xl sm:px-3 sm:py-2.5 ${
                        isActive
                          ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                          : "border-border/60 bg-card/90 hover:border-primary/60 hover:bg-primary/10 dark:hover:bg-primary/20 dark:hover:text-cream"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span
                          className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md sm:h-7 sm:w-7 sm:rounded-lg ${
                            isActive
                              ? "bg-primary-foreground/18 text-primary-foreground"
                              : "bg-muted/80 text-muted-foreground group-hover:text-primary dark:bg-primary/15 dark:text-primary/85 dark:group-hover:bg-primary/24 dark:group-hover:text-primary"
                          }`}
                        >
                          <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </span>
                        <span
                          className={`text-[11px] font-medium leading-tight sm:text-xs ${
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
                <HorizontalScroller
                  ariaLabel={t(
                    "home.discovery.districtsAria",
                    undefined,
                    "Popular districts",
                  )}
                  showArrows={false}
                >
                  {popularDistricts.map((district) => {
                    const isActive = selectedDistrict === district.name;
                    const translatedName = getTranslatedText(
                      district.nameKey,
                      district.name,
                      t,
                    );
                    return (
                      <button
                        type="button"
                        key={district.id}
                        onClick={() =>
                          commitDistrictDiscovery(district.name, isActive)
                        }
                        className={`flex-shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                          isActive
                            ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                            : "border-border/70 bg-card text-foreground hover:border-primary/60 hover:bg-primary/12 dark:hover:bg-primary/24 dark:hover:text-cream"
                        }`}
                      >
                        {translatedName}
                      </button>
                    );
                  })}
                </HorizontalScroller>
              )}

              {activeDiscoverySource === "type" && (
                <div className="flex flex-wrap gap-2">
                  {typeDiscoveryOptions.map((option) => {
                    const isActive = selectedVenueType === option.id;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() =>
                          commitVenueTypeDiscovery(option.id, isActive)
                        }
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
                  {localizedPriceRangeOptions.map((option) => {
                    const isActive = selectedPriceRange === option.id;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => commitPriceBandDiscovery(option.id)}
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
                    showArrows={false}
                  >
                    {popularDistricts.map((district) => {
                      const isActive = selectedArea === district.name;
                      const translatedName = getTranslatedText(
                        district.nameKey,
                        district.name,
                        t,
                      );
                      return (
                        <button
                          type="button"
                          key={`${district.id}-area`}
                          onClick={() => commitAreaTopRatedDiscovery(district.name)}
                          className={`flex-shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            isActive
                              ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                              : "border-border/70 bg-card text-foreground hover:border-primary/60 hover:bg-primary/12 dark:hover:bg-primary/24 dark:hover:text-cream"
                          }`}
                        >
                          {translatedName}
                        </button>
                      );
                    })}
                  </HorizontalScroller>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground shrink-0 pt-2">
                    {t("home.discovery.results", {
                      count: formatNumber(discoveryPlaces.length),
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground truncate text-right min-w-0 pt-2">
                    {t("home.discovery.sourceLabel", {
                      source: t(
                        `home.discovery.source.${activeDiscoverySource}`,
                        undefined,
                        activeDiscoverySource.replace("-", " "),
                      ),
                    })}
                  </p>
                </div>

                <div style={{ position: "relative", overflow: "hidden" }}>
                  <AnimatePresence mode="wait" initial={false}>
                    {showDiscoverySkeleton ? (
                      <motion.div
                        key="discovery-loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: shouldReduceMotion ? 0.01 : 0.18,
                        }}
                      >
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
                      </motion.div>
                    ) : discoveryError ? (
                      <motion.div
                        key="discovery-error"
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                        transition={homeMotion.stateTransition}
                        className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4"
                      >
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
                      </motion.div>
                    ) : discoveryPlaces.length === 0 ? (
                      <motion.div
                        key="discovery-empty"
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                        transition={homeMotion.stateTransition}
                        className="rounded-2xl border border-dashed border-border/70 bg-card/70 px-4 py-8 text-center"
                      >
                        <p className="font-semibold text-foreground">
                          {t("home.discovery.emptyTitle")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("home.discovery.emptyDescription")}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="discovery-ready"
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                        transition={homeMotion.stateTransition}
                      >
                        <HorizontalScroller
                          ariaLabel={t("home.scroller.label.discovery")}
                          className="-mx-2 px-2"
                          scrollKey={`${discoveryScrollKey}-${filterScrollKey}`}
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
                                ease: homeMotion.easeOutQuart,
                                delay: homeMotion.cardDelay(index),
                              }}
                            >
                              <PlaceCard
                                place={place}
                                variant="horizontal"
                                userLocation={userLocation}
                                onToggleSave={toggleSave}
                                isSavePending={isPlaceSavePending(place.id)}
                                onClick={openVenueDetailTab}
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
                    ease: homeMotion.easeOutQuart,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground sm:text-xl">
                        <div className="rounded-lg bg-secondary/12 p-1.5 dark:bg-primary/18 flex-shrink-0">
                          {(() => {
                            const MoodIcon = selectedMoodOption
                              ? (MOOD_ICON_MAP[selectedMoodOption.icon] ??
                                Sparkles)
                              : Sparkles;
                            return (
                              <MoodIcon className="h-4 w-4 text-secondary dark:text-primary" />
                            );
                          })()}
                        </div>
                        {selectedMoodOption?.label
                          ? translateMoodLabel(
                              selectedMoodOption.id,
                              selectedMoodOption.label,
                            )
                          : t("home.mood.defaultTitle")}
                      </h2>
                      <p className="mt-0.5 text-sm text-muted-foreground sm:ml-9">
                        {selectedMoodOption?.description
                          ? translateMoodDescription(
                              selectedMoodOption.id,
                              selectedMoodOption.description,
                            )
                          : t("home.mood.defaultDescription")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        onClick={() =>
                          selectedMood && navigateToMoodSeeAll(selectedMood)
                        }
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {t("home.seeAll")}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        onClick={() => setSelectedMood(null)}
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 text-xs text-muted-foreground"
                      >
                        {t("home.mood.clear")}
                      </Button>
                    </div>
                  </div>

                  {isMoodLoading ? (
                    <HorizontalScroller
                      ariaLabel={t("home.scroller.label.mood")}
                    >
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
                    <HorizontalScroller
                      ariaLabel={t("home.scroller.label.mood")}
                      scrollKey={selectedMood ?? undefined}
                    >
                      {moodPlaces.map((place) => (
                        <div key={place.id} className="snap-start">
                          <PlaceCard
                            place={place}
                            variant="horizontal"
                            userLocation={userLocation}
                            onToggleSave={toggleSave}
                            isSavePending={isPlaceSavePending(place.id)}
                            onClick={openVenueDetailTab}
                          />
                        </div>
                      ))}
                    </HorizontalScroller>
                  )}
                </motion.section>
              )}
            </AnimatePresence>

            <section
              className="space-y-4"
              data-tour="tour-curated"
              id="tour-curated"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground sm:text-xl">
                    <div className="p-1.5 rounded-lg bg-secondary/15 dark:bg-primary/20 flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-secondary dark:text-primary" />
                    </div>
                    {t("home.curated.title")}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground sm:ml-9">
                    {t("home.curated.subtitle")}
                  </p>
                </div>
                <Button
                  onClick={() => navigateToSeeAll("curated")}
                  variant="ghost"
                  size="sm"
                  className="h-10 flex-shrink-0 px-3 text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("home.seeAll")}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              <HorizontalScroller
                ariaLabel={t("home.scroller.label.curated")}
                scrollKey={filterScrollKey}
              >
                {curatedPlaces.map((place) => (
                  <div key={place.id} className="snap-start">
                    <PlaceCard
                      place={place}
                      variant="horizontal"
                      userLocation={userLocation}
                      onToggleSave={toggleSave}
                      isSavePending={isPlaceSavePending(place.id)}
                      onClick={openVenueDetailTab}
                    />
                  </div>
                ))}
              </HorizontalScroller>
            </section>

            {trendingPlaces.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground sm:text-xl">
                      <div className="p-1.5 rounded-lg bg-secondary/15 dark:bg-primary/20 flex-shrink-0">
                        <Flame className="h-4 w-4 text-secondary dark:text-primary" />
                      </div>
                      {t("home.trending.title")}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted-foreground sm:ml-9">
                      {t("home.trending.subtitle")}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigateToSeeAll("trending")}
                    variant="ghost"
                    size="sm"
                    className="h-10 flex-shrink-0 px-3 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {t("home.seeAll")}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <HorizontalScroller
                  ariaLabel={t("home.scroller.label.trending")}
                  scrollKey={filterScrollKey}
                >
                  {trendingPlaces.map((place) => (
                    <div key={place.id} className="snap-start">
                      <PlaceCard
                        place={place}
                        variant="horizontal"
                        userLocation={userLocation}
                        onToggleSave={toggleSave}
                        isSavePending={isPlaceSavePending(place.id)}
                        onClick={openVenueDetailTab}
                      />
                    </div>
                  ))}
                </HorizontalScroller>
              </section>
            )}

            <section
              className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-sm"
              style={{ isolation: "isolate" }}
              data-tour="tour-similar"
              id="tour-similar"
            >
              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                        <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/12 text-secondary dark:bg-primary/18 dark:text-primary sm:h-8 sm:w-8">
                          <WandSparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </span>
                        {t("home.similar.title")}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {t("home.similar.subtitle")}
                      </p>
                    </div>
                  </div>
                  {resolvedSeedPlace && (
                    <span
                      className="self-start truncate rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-medium text-foreground max-w-full"
                      title={resolvedSeedPlace.name}
                    >
                      {t("home.similar.selected", {
                        name: resolvedSeedPlace.name,
                      })}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground/75 [inset-inline-start:1rem]" />
                    <Input
                      value={seedSearchQuery}
                      onChange={(e) => setSeedSearchQuery(e.target.value)}
                      onFocus={() => setIsSeedInputFocused(true)}
                      onBlur={() => {
                        setTimeout(() => setIsSeedInputFocused(false), 120);
                      }}
                      placeholder={t("home.similar.searchPlaceholder")}
                      className="h-12 rounded-2xl border-border/70 bg-card/90 [padding-inline-start:2.75rem] focus-visible:ring-secondary/30"
                    />

                    <AnimatePresence>
                      {showSuggestionDropdown && (
                        <motion.div
                          key="similar-suggestions"
                          initial={{
                            opacity: 0,
                            y: shouldReduceMotion ? 0 : -8,
                          }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                          transition={homeMotion.stateTransition}
                          className="absolute z-20 mt-2 max-h-52 w-full overflow-y-auto rounded-2xl border border-border/70 bg-card p-2 shadow-lg sm:max-h-72"
                        >
                          {isSeedSearchLoading ? (
                            <p className="px-3 py-2 text-xs text-muted-foreground">
                              {t(
                                "home.similar.searching",
                                undefined,
                                "Searching...",
                              )}
                            </p>
                          ) : seedSearchError ? (
                            <p className="px-3 py-2 text-xs text-destructive">
                              {seedSearchError}
                            </p>
                          ) : effectiveSuggestions.length > 0 ? (
                            effectiveSuggestions.map((place) => {
                              const isActiveSeed =
                                selectedSimilarSeedId === place.id;
                              return (
                                <button
                                  type="button"
                                  key={`suggestion-${place.id}`}
                                  onMouseDown={(event) =>
                                    event.preventDefault()
                                  }
                                  onClick={() => commitSeedSelection(place)}
                                  className={`w-full rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                                    isActiveSeed
                                      ? "bg-primary text-primary-foreground dark:text-cream"
                                      : "hover:bg-primary/12 hover:text-primary dark:hover:bg-primary/24 dark:hover:text-cream"
                                  }`}
                                >
                                  <p
                                    className={`text-sm font-semibold ${isActiveSeed ? "text-primary-foreground dark:text-cream" : "text-foreground"}`}
                                  >
                                    {place.name}
                                  </p>
                                  <p
                                    className={`mt-0.5 truncate text-xs ${isActiveSeed ? "text-primary-foreground/90 dark:text-cream/90" : "text-muted-foreground"}`}
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                    {quickSeedVenues.map((place) => {
                        const isActiveSeed = selectedSimilarSeedId === place.id;
                        return (
                          <button
                            type="button"
                            key={`quick-seed-${place.id}`}
                            onClick={() => commitSeedSelection(place)}
                            className={`flex-shrink-0 rounded-full border px-4 py-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                              isActiveSeed
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
                      transition={homeMotion.stateTransition}
                    >
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
                    </motion.div>
                  ) : similarError ? (
                    <motion.div
                      key="similar-error"
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                      transition={homeMotion.stateTransition}
                      className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4"
                    >
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
                    </motion.div>
                  ) : similarPlaces.length === 0 ? (
                    <motion.div
                      key="similar-empty"
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                      transition={homeMotion.stateTransition}
                      className="rounded-2xl border border-dashed border-border/70 bg-card/70 px-4 py-8 text-center"
                    >
                      <p className="font-semibold text-foreground">
                        {t("home.similar.emptyTitle")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("home.similar.emptyDescription")}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="similar-ready"
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                      transition={homeMotion.stateTransition}
                    >
                      <HorizontalScroller
                        ariaLabel={t("home.scroller.label.similar")}
                        className="-mx-2 px-2"
                        scrollKey={selectedSimilarSeedId ?? undefined}
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
                              ease: homeMotion.easeOutQuart,
                              delay: homeMotion.cardDelay(index),
                            }}
                          >
                            <PlaceCard
                              place={place}
                              variant="horizontal"
                              userLocation={userLocation}
                              onToggleSave={toggleSave}
                              isSavePending={isPlaceSavePending(place.id)}
                              hideTopRatedBadge={showSuggestionDropdown}
                              onClick={openVenueDetailTab}
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

          <aside className="sticky top-6 hidden w-[280px] flex-shrink-0 flex-col gap-6 lg:flex">
            <div data-tour="tour-group" id="tour-group-desktop">
              <GroupSessionWidget variant="sidebar" />
            </div>

            <div
              className="bg-card rounded-3xl border border-border/50 shadow-sm p-5 space-y-4"
              data-tour="tour-mood"
              id="tour-mood"
            >
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-secondary dark:text-primary" />
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
                      onClick={() => commitMoodSelection(mood.id, isActive)}
                      className={`flex min-h-[3rem] flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                        isActive
                          ? "border-primary/85 bg-primary text-primary-foreground shadow-sm dark:text-cream"
                          : "bg-background border-border/50 hover:border-primary/55 hover:bg-primary/12 dark:hover:bg-primary/24 dark:hover:text-cream"
                      }`}
                    >
                      <MoodIcon
                        className={cn(
                          "h-4 w-4",
                          isActive
                            ? "text-primary-foreground dark:text-cream"
                            : "text-secondary dark:text-primary",
                        )}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-medium leading-tight line-clamp-1",
                          isActive
                            ? "text-primary-foreground dark:text-cream"
                            : "text-foreground",
                        )}
                      >
                        {translateMoodLabel(mood.id, mood.label)}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] leading-tight line-clamp-2",
                          isActive
                            ? "text-primary-foreground/90 dark:text-cream/90"
                            : "text-muted-foreground",
                        )}
                      >
                        {translateMoodDescription(mood.id, mood.description)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
};

export default HomePage;
