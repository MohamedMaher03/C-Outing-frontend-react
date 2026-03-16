import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronRight,
  Flame,
  Compass,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { Input } from "@/components/ui/input";
import PlaceCard from "@/features/home/components/PlaceCard";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useHome } from "@/features/home/hooks/useHomeHook";
import {
  FILTER_OPTIONS,
  DISCOVERY_SOURCE_OPTIONS,
  MOOD_ICON_MAP,
  VENUE_PRICE_RANGE_OPTIONS,
} from "@/features/home/mocks";
import type { VenuePriceRange } from "@/features/home/types";
import cairoBg from "@/assets/images/cairo-bg.jpg";

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
    selectedSimilarSeedId,
    similarSeedPlaces,
    similarPlaces,
    isSimilarLoading,
    similarError,
    selectPlaceForSimilar,
    toggleSave,
    isLoading,
    error,
    categories,
    moodOptions,
    trendingTags,
    popularDistricts,
  } = useHome();

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

  const handlePriceRangeSelect = (priceRange: VenuePriceRange) => {
    setSelectedPriceRange(
      selectedPriceRange === priceRange ? null : priceRange,
    );
    setActiveDiscoverySource("price-range");
  };

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😔</span>
          </div>
          <p className="text-destructive font-semibold mb-2">
            Failed to load places
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ====== HERO SECTION ====== */}
      <div className="relative overflow-hidden h-[380px] sm:h-[400px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-20s hover:scale-110"
          style={{ backgroundImage: `url(${cairoBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-secondary/10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 pb-6 h-full flex flex-col justify-end">
          <div className="space-y-2 mb-7 animate-fade-in-up">
            <p className="text-white/80 text-sm font-medium tracking-wide uppercase">
              {getGreeting()}, {userName} ✦
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              <span className="text-gradient-gold">Discover Cairo</span>
            </h1>
            <p className="text-white/90 text-base max-w-md">
              AI-powered spots curated for your vibe. Where are we heading
              today?
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative animate-fade-in-up animate-delay-100 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
            <Input
              placeholder="Search places, districts, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search Cairo venues"
              className="pl-12 pr-14 h-14 rounded-2xl border border-white/20 bg-white/15 backdrop-blur-xl text-white placeholder:text-white/50 focus:border-secondary focus:ring-secondary/30 focus:bg-white/20 transition-all text-base shadow-xl"
            />
          </div>

          {/* Filter Pills */}
          <div
            className="flex gap-2 overflow-x-auto pb-2 mt-4 scrollbar-hide -mx-4 px-4 animate-fade-in-up animate-delay-200"
            role="tablist"
            aria-label="Filter venues"
          >
            {FILTER_OPTIONS.map((filter) => {
              const Icon = filter.icon;
              const isActive =
                filter.id === "all"
                  ? selectedFilters.length === 0
                  : selectedFilters.includes(filter.id);
              return (
                <button
                  key={filter.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => toggleFilter(filter.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-secondary text-primary shadow-lg shadow-secondary/40 scale-105 glow-gold"
                      : "bg-white/10 text-white/90 hover:bg-white/20 border border-white/10 backdrop-blur-xl hover:border-secondary/30"
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

      {/* ====== MAIN CONTENT: TWO-COLUMN LAYOUT ====== */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8 items-start">
          {/* ── LEFT: Main Feed ── */}
          <div className="flex-1 min-w-0 space-y-12">
            {/* ── Venue Discovery Studio (New Endpoints) ── */}
            <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-white via-amber-50/40 to-orange-50/30 p-5 sm:p-6 shadow-sm">
              <div className="absolute -top-20 -right-16 h-52 w-52 rounded-full bg-secondary/15 blur-3xl" />
              <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-orange-200/20 blur-3xl" />

              <div className="relative z-10 space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/20 text-secondary">
                        <Compass className="h-4 w-4" />
                      </span>
                      Venue Discovery Studio
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Explore live venue slices by district, type, budget, and
                      rating intelligence.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-foreground text-white px-3 py-1 font-semibold">
                      Top Rated: {globalTopRatedVenues.length}
                    </span>
                    <span className="rounded-full bg-white/80 border border-border/70 px-3 py-1 font-semibold text-foreground">
                      {selectedArea}: {topRatedInAreaVenues.length}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {DISCOVERY_SOURCE_OPTIONS.map((source) => {
                    const Icon = source.icon;
                    const isActive = activeDiscoverySource === source.id;
                    return (
                      <button
                        key={source.id}
                        onClick={() => setActiveDiscoverySource(source.id)}
                        className={`group rounded-2xl border px-3 py-2.5 text-left transition-all duration-200 ${
                          isActive
                            ? "border-secondary/60 bg-secondary/15 shadow-md"
                            : "border-border/60 bg-white/80 hover:border-secondary/30 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
                              isActive
                                ? "bg-secondary/20 text-secondary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="text-xs font-semibold text-foreground leading-tight">
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
                          key={district.id}
                          onClick={() => {
                            setSelectedDistrict(
                              isActive ? null : district.name,
                            );
                            setActiveDiscoverySource("district");
                          }}
                          className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-foreground text-white shadow-md"
                              : "bg-white border border-border/70 text-foreground hover:border-foreground/30"
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
                          key={option.id}
                          onClick={() => {
                            setSelectedVenueType(isActive ? null : option.id);
                            setActiveDiscoverySource("type");
                          }}
                          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-secondary text-primary shadow-md"
                              : "bg-white border border-border/70 text-foreground hover:border-secondary/40"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeDiscoverySource === "price-range" && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {VENUE_PRICE_RANGE_OPTIONS.map((option) => {
                      const isActive = selectedPriceRange === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handlePriceRangeSelect(option.id)}
                          className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                            isActive
                              ? "border-secondary/60 bg-secondary/10 shadow-md"
                              : "border-border/60 bg-white hover:border-secondary/40"
                          }`}
                        >
                          <p className="text-sm font-black tracking-tight text-foreground">
                            {option.label}
                          </p>
                          <p className="text-[11px] font-medium text-muted-foreground">
                            {option.caption}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeDiscoverySource === "top-rated-area" && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                      Select Area
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {popularDistricts.map((district) => {
                        const isActive = selectedArea === district.name;
                        return (
                          <button
                            key={`${district.id}-area`}
                            onClick={() => {
                              setSelectedArea(district.name);
                              setActiveDiscoverySource("top-rated-area");
                            }}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                              isActive
                                ? "bg-secondary text-primary"
                                : "bg-white border border-border/70 text-foreground hover:border-secondary/40"
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
                    <p className="text-sm font-semibold text-foreground">
                      {discoveryResultCount} venue
                      {discoveryResultCount === 1 ? "" : "s"} found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Source: {activeDiscoverySource.replace("-", " ")}
                    </p>
                  </div>

                  {showDiscoverySkeleton ? (
                    <div className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-[280px] h-[240px] flex-shrink-0 rounded-2xl bg-muted animate-pulse"
                        />
                      ))}
                    </div>
                  ) : discoveryError ? (
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4">
                      <p className="text-sm font-semibold text-destructive">
                        Could not load discovery venues
                      </p>
                      <p className="text-xs text-destructive/80 mt-1">
                        {discoveryError}
                      </p>
                    </div>
                  ) : discoveryPlaces.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-white/70 px-4 py-8 text-center">
                      <p className="font-semibold text-foreground">
                        No venues for this filter yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try another district, type, or budget range.
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide">
                      {discoveryPlaces.map((place, i) => (
                        <div
                          key={`${activeDiscoverySource}-${place.id}`}
                          className="animate-slide-in-right"
                          style={{ animationDelay: `${i * 45}ms` }}
                        >
                          <PlaceCard
                            place={place}
                            variant="horizontal"
                            onToggleSave={toggleSave}
                            onClick={(id) => navigate(`/venue/${id}`)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ── Mood Picks ── */}
            {selectedMood && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-secondary/15">
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
                      {moodOptions.find((m) => m.id === selectedMood)?.label ??
                        "Mood Picks"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 ml-10">
                      {moodOptions.find((m) => m.id === selectedMood)
                        ?.description ?? "Places that match your vibe"}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMood(null)}
                    className="text-xs text-muted-foreground font-semibold hover:text-foreground transition-colors"
                  >
                    Clear mood
                  </button>
                </div>

                {isMoodLoading ? (
                  <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-[280px] h-[240px] flex-shrink-0 rounded-2xl bg-muted animate-pulse"
                      />
                    ))}
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
                  <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                    {moodPlaces.map((place, i) => (
                      <div
                        key={place.id}
                        className="animate-slide-in-right"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <PlaceCard
                          place={place}
                          variant="horizontal"
                          onToggleSave={toggleSave}
                          onClick={(id) => navigate(`/venue/${id}`)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── Curated For You ── */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-secondary/15">
                      <Sparkles className="h-5 w-5 text-secondary animate-pulse-glow" />
                    </div>
                    Curated for You
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 ml-10">
                    AI-powered picks based on your preferences
                  </p>
                </div>
                <button
                  onClick={() => navigate("/home/see-all/curated")}
                  className="text-xs text-secondary font-semibold flex items-center gap-0.5 hover:gap-1.5 transition-all"
                >
                  See all <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                {curatedPlaces.map((place, i) => (
                  <div
                    key={place.id}
                    className="animate-slide-in-right"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <PlaceCard
                      place={place}
                      variant="horizontal"
                      onToggleSave={toggleSave}
                      onClick={(id) => navigate(`/venue/${id}`)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* ── Trending Now ── */}
            {trendingPlaces.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-orange-100">
                        <Flame className="h-5 w-5 text-orange-500" />
                      </div>
                      Trending Now
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 ml-10">
                      Most popular this week in Cairo
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/home/see-all/trending")}
                    className="text-xs text-secondary font-semibold flex items-center gap-0.5 hover:gap-1.5 transition-all"
                  >
                    See all <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                  {trendingPlaces.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      variant="horizontal"
                      onToggleSave={toggleSave}
                      onClick={(id) => navigate(`/venue/${id}`)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Similar Places Studio ── */}
            <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-sky-50/70 via-white to-amber-50/50 p-5 sm:p-6 shadow-sm">
              <div className="absolute -top-14 -right-14 h-44 w-44 rounded-full bg-sky-200/30 blur-3xl" />
              <div className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />

              <div className="relative z-10 space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
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
                    <span className="rounded-full border border-sky-200 bg-white/90 px-3 py-1 text-xs font-semibold text-sky-700">
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
                      className="h-12 rounded-2xl border-sky-200 bg-white/90 focus-visible:ring-sky-300"
                    />

                    {showSimilarSuggestions && (
                      <div className="absolute z-20 mt-2 w-full rounded-2xl border border-border/70 bg-white shadow-xl p-2 max-h-72 overflow-y-auto">
                        {similarSearchResults.length > 0 ? (
                          similarSearchResults.map((place) => {
                            const isActive = selectedSimilarSeedId === place.id;
                            return (
                              <button
                                key={`suggestion-${place.id}`}
                                onMouseDown={() => {
                                  setSimilarSearchInput(place.name);
                                  selectPlaceForSimilar(place.id);
                                }}
                                className={`w-full text-left rounded-xl px-3 py-2.5 transition-colors ${
                                  isActive
                                    ? "bg-sky-100 text-sky-800"
                                    : "hover:bg-muted"
                                }`}
                              >
                                <p className="text-sm font-semibold text-foreground">
                                  {place.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
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
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {similarSeedOptions.slice(0, 6).map((place) => {
                      const isActive = selectedSimilarSeedId === place.id;
                      return (
                        <button
                          key={`quick-seed-${place.id}`}
                          onClick={() => {
                            setSimilarSearchInput(place.name);
                            selectPlaceForSimilar(place.id);
                          }}
                          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                            isActive
                              ? "bg-sky-600 text-white shadow-md"
                              : "bg-white border border-border/70 text-foreground hover:border-sky-300 hover:bg-sky-50"
                          }`}
                        >
                          {place.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isSimilarLoading ? (
                  <div className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={`similar-skeleton-${i}`}
                        className="w-[280px] h-[240px] flex-shrink-0 rounded-2xl bg-muted animate-pulse"
                      />
                    ))}
                  </div>
                ) : similarError ? (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4">
                    <p className="text-sm font-semibold text-destructive">
                      Could not load similar places
                    </p>
                    <p className="text-xs text-destructive/80 mt-1">
                      {similarError}
                    </p>
                  </div>
                ) : similarPlaces.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-white/70 px-4 py-8 text-center">
                    <p className="font-semibold text-foreground">
                      Choose a place to get similar recommendations
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We will recommend venues with a matching vibe and style.
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide">
                    {similarPlaces.map((place, i) => (
                      <div
                        key={`similar-${place.id}`}
                        className="animate-slide-in-right"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <PlaceCard
                          place={place}
                          variant="horizontal"
                          onToggleSave={toggleSave}
                          onClick={(id) => navigate(`/venue/${id}`)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="hidden lg:flex flex-col gap-6 w-[280px] flex-shrink-0 sticky top-6">
            {/* Mood Selector Card */}
            <div className="bg-white rounded-3xl border border-border/50 shadow-sm p-5 space-y-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="text-xl">✨</span>
                What's your mood?
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {moodOptions.map((mood) => {
                  const isActive = selectedMood === mood.id;
                  const MoodIcon = MOOD_ICON_MAP[mood.icon] ?? Sparkles;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => setSelectedMood(isActive ? null : mood.id)}
                      className={`flex flex-col items-center gap-1 px-3 py-3 rounded-2xl text-center transition-all duration-200 border ${
                        isActive
                          ? "bg-secondary/15 border-secondary/40 shadow-md glow-gold-sm scale-105"
                          : "bg-background border-border/50 hover:border-secondary/30 hover:shadow-md"
                      }`}
                    >
                      <MoodIcon className="h-5 w-5 text-secondary" />
                      <span className="text-[11px] font-semibold text-foreground leading-tight">
                        {mood.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        {mood.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trending Tags Card */}
            <div className="bg-white rounded-3xl border border-border/50 shadow-sm p-5 space-y-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Trending in Cairo
              </h2>
              <div className="flex gap-2 flex-wrap">
                {trendingTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setSearch(tag.label)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-background border border-border/50 text-foreground hover:border-secondary/40 hover:bg-secondary/5 transition-all duration-200 hover:shadow-sm flex items-center gap-1"
                  >
                    <span className="text-muted-foreground">#</span>
                    {tag.label}
                    <span className="text-[10px] text-muted-foreground">
                      {tag.searchCount >= 1000
                        ? `${(tag.searchCount / 1000).toFixed(1)}k`
                        : tag.searchCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
