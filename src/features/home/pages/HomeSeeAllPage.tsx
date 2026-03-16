import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import PlaceCard from "@/features/home/components/PlaceCard";
import LocationPermissionBanner from "@/features/home/components/LocationPermissionBanner";
import { useHomeSeeAll } from "@/features/home/hooks/useHomeSeeAll";
import type { HomeRecommendationCollection } from "@/features/home/types";

const COLLECTION_META: Record<
  HomeRecommendationCollection,
  {
    title: string;
    subtitle: string;
    icon: typeof Sparkles;
    colorClass: string;
  }
> = {
  curated: {
    title: "Curated for You",
    subtitle:
      "Personalized recommendations based on your profile and behavior.",
    icon: Sparkles,
    colorClass: "text-secondary",
  },
  trending: {
    title: "Trending Now",
    subtitle: "The most popular places right now across Cairo.",
    icon: Flame,
    colorClass: "text-orange-500",
  },
};

const COUNT_OPTIONS = [10, 20, 30];

const HomeSeeAllPage = () => {
  const navigate = useNavigate();
  const { collection } = useParams<{ collection: string }>();
  const {
    safeCollection,
    places,
    isLoading,
    error,
    count,
    setCount,
    userLocation,
    requestUserLocation,
  } = useHomeSeeAll({ collection });

  if (!safeCollection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl border border-border/60 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-destructive">
            Invalid list type
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            The requested recommendation list is not available.
          </p>
          <Button className="mt-4" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const meta = COLLECTION_META[safeCollection];
  const Icon = meta.icon;

  if (isLoading) {
    return (
      <PageLoading
        text={`Loading ${meta.title}`}
        subText="Fetching recommendations ..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to home
            </button>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2 text-foreground">
              <Icon className={`h-7 w-7 ${meta.colorClass}`} />
              {meta.title}
            </h1>
            <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-white p-1.5 shadow-sm">
            {COUNT_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setCount(option)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  count === option
                    ? "bg-foreground text-white"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {option} places
              </button>
            ))}
          </div>
        </div>

        <LocationPermissionBanner
          userLocation={userLocation}
          onEnableLocation={requestUserLocation}
        />

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4">
            <p className="text-sm font-semibold text-destructive">
              Failed to load places
            </p>
            <p className="text-xs text-destructive/80 mt-1">{error}</p>
          </div>
        ) : places.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-white/70 px-4 py-10 text-center">
            <p className="font-semibold text-foreground">No places found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try another list size or come back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                variant="grid"
                userLocation={userLocation}
                onClick={(id) => navigate(`/venue/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeSeeAllPage;
