import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  TrendingUp,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";
import { Input } from "../components/ui/input";
import PlaceCard from "../components/PlaceCard";
import { useAuth } from "../context/AuthContext";
import { useHome, type FilterType } from "../hooks/useHome";
import cairoBg from "../assets/images/cairo-bg.jpg";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Use custom hook for all business logic
  const {
    search,
    setSearch,
    selectedFilter,
    setSelectedFilter,
    filteredPlaces,
    curatedPlaces,
    topRatedPlaces,
    toggleSave,
    isLoading,
    error,
  } = useHome();

  const filterOptions = [
    { id: "all" as FilterType, label: "All", icon: Sparkles },
    { id: "top-rated" as FilterType, label: "Top Rated", icon: TrendingUp },
    { id: "near-me" as FilterType, label: "Near Me", icon: MapPin },
    { id: "open-now" as FilterType, label: "Open Now", icon: Clock },
  ];

  // Get personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const userName = user?.name?.split(" ")[0] || "Explorer";

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-gold animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading places...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load places</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Hero Section with Cairo Background Image */}
      <div className="relative overflow-hidden h-[320px]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${cairoBg})` }}
        />

        {/* Dark Navy Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy/85 via-navy/75 to-navy/70" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 pb-6 h-full flex flex-col justify-center">
          {/* Personalized Greeting */}
          <div className="space-y-1 mb-6">
            <h1 className="text-3xl font-bold text-white">
              <span className="text-gold">Discover Cairo</span> {getGreeting()},{" "}
              <span className="text-white">{userName}</span>
              <span className="text-gold ml-1">✦</span>
            </h1>
            <p className="text-white/90 text-sm">
              Where are we heading in Cairo today?
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gold" />
            <Input
              placeholder="Search places, districts, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-14 h-14 rounded-2xl border-2 border-white/20 bg-white/95 backdrop-blur-sm focus:border-gold focus:ring-gold/20 transition-colors text-base shadow-lg placeholder:text-muted-foreground"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-gold text-navy hover:bg-gold/90 transition-colors shadow-md hover:shadow-lg">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mt-4 scrollbar-hide -mx-4 px-4">
            {filterOptions.map((filter) => {
              const Icon = filter.icon;
              const isActive = selectedFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-gold text-navy shadow-lg shadow-gold/25 scale-105"
                      : "bg-white/90 text-navy hover:bg-white border border-white/30 hover:border-gold/50 hover:shadow-md backdrop-blur-sm"
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

      {/* Content Sections */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Curated Row with AI Picks */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold" />
                Curated for You
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                AI-powered recommendations based on your preferences
              </p>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
            {curatedPlaces.map((place) => (
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

        {/* Top Rated Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gold" />
                Top Rated in Cairo
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filteredPlaces.length} venues match your criteria
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
    </div>
  );
};

export default HomePage;
