import { useNavigate } from "react-router-dom";
import {
  Search,
  TrendingUp,
  Sparkles,
  MapPin,
  Clock,
  ChevronRight,
  Flame,
  Navigation,
  Star,
  UtensilsCrossed,
  Moon,
  Palette,
  Trees,
  ShoppingBag,
  Heart,
  Compass,
  Laptop,
  type LucideIcon,
  Binoculars,
  Mountain,
  Coffee,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import PlaceCard from "@/features/home/components/PlaceCard";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useHome, type FilterType } from "@/features/home/hooks/useHome";
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
    selectedCategory,
    setSelectedCategory,
    filteredPlaces,
    curatedPlaces,
    topRatedPlaces,
    trendingPlaces,
    toggleSave,
    isLoading,
    error,
    categories,
    moodOptions,
    trendingTags,
    popularDistricts,
  } = useHome();

  const filterOptions = [
    { id: "all" as FilterType, label: "All", icon: Sparkles },
    { id: "top-rated" as FilterType, label: "Top Rated", icon: TrendingUp },
    { id: "near-me" as FilterType, label: "Near Me", icon: Navigation },
    { id: "open-now" as FilterType, label: "Open Now", icon: Clock },
  ];

  const categoryIconMap: Record<string, LucideIcon> = {
    UtensilsCrossed,
    Moon,
    Palette,
    Trees,
    ShoppingBag,
    Heart,
    Compass,
    Laptop,
  };

  const moodIconMap: Record<string, LucideIcon> = {
    Coffee,
    Mountain,
    Heart,
    Users,
    Binoculars,
    UtensilsCrossed,
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <Sparkles className="h-16 w-16 text-secondary animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-secondary/20 animate-ping" />
          </div>
          <div>
            <p className="text-foreground font-semibold">Discovering Cairo</p>
            <p className="text-muted-foreground text-sm mt-1">
              Finding the best places for you...
            </p>
          </div>
        </div>
      </div>
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
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-[20s] hover:scale-110"
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
            {filterOptions.map((filter) => {
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
            {/* ── Category Quick Access ── */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">
                  Browse Categories
                </h2>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-secondary font-semibold hover:underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const CatIcon = categoryIconMap[cat.icon] ?? Compass;

                  return (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setSelectedCategory(isActive ? null : cat.id)
                      }
                      className={`group flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 border ${
                        isActive
                          ? "bg-foreground border-foreground shadow-lg scale-105"
                          : "bg-background border-border/60 hover:border-foreground/40 hover:shadow-md hover:scale-105"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-200 ${
                          isActive
                            ? "bg-white/15"
                            : "bg-muted group-hover:bg-foreground/8"
                        }`}
                      >
                        <CatIcon
                          className={`h-5 w-5 transition-colors duration-200 ${
                            isActive ? "text-white" : "text-foreground"
                          }`}
                          strokeWidth={1.75}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-semibold whitespace-nowrap leading-tight transition-colors duration-200 ${
                          isActive ? "text-white" : "text-foreground"
                        }`}
                      >
                        {cat.label}
                      </span>
                      <span
                        className={`text-[9px] transition-colors duration-200 ${
                          isActive ? "text-white/60" : "text-muted-foreground"
                        }`}
                      >
                        {cat.count} spots
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

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
                <button className="text-xs text-secondary font-semibold flex items-center gap-0.5 hover:gap-1.5 transition-all">
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

            {/* ── Popular Districts ── */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-secondary" />
                    Popular Districts
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5 ml-7">
                    Explore Cairo's hottest neighborhoods
                  </p>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                {popularDistricts.map((district) => (
                  <button
                    key={district.id}
                    onClick={() => setSearch(district.name)}
                    className="relative flex-shrink-0 w-[140px] h-[100px] rounded-2xl overflow-hidden group/district"
                  >
                    <img
                      src={district.image}
                      alt={district.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/district:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-sm font-bold leading-tight">
                        {district.name}
                      </p>
                      <p className="text-white/70 text-[10px]">
                        {district.placeCount} places
                      </p>
                    </div>
                  </button>
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
                  <button className="text-xs text-secondary font-semibold flex items-center gap-0.5 hover:gap-1.5 transition-all">
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

            {/* ── Top Rated Grid ── */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-secondary/15">
                      <Star className="h-5 w-5 text-secondary fill-secondary" />
                    </div>
                    Top Rated in Cairo
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 ml-10">
                    {filteredPlaces.length} venues match your criteria
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {topRatedPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    variant="grid"
                    onToggleSave={toggleSave}
                    onClick={(id) => navigate(`/venue/${id}`)}
                  />
                ))}
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
                  const MoodIcon = moodIconMap[mood.icon] ?? Sparkles;
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
