import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Heart, RefreshCw } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import PlaceCard from "@/features/home/components/PlaceCard";
import LocationPermissionBanner from "@/features/home/components/LocationPermissionBanner";
import { useFavorites } from "@/features/favorites/hooks/useFavorites";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useUserLocation } from "@/features/home/hooks/useUserLocation";
import type { HomePlace } from "@/features/home/types";
import { cn } from "@/lib/utils";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [isRefreshPending, setIsRefreshPending] = useState(false);
  const {
    favorites,
    loading,
    error,
    totalCount,
    savePendingMap,
    actionError,
    toggleSave,
    refreshFavorites,
    clearActionError,
  } = useFavorites();
  const userLocation = useUserLocation();
  const requestUserLocation = userLocation.requestLocation;
  const formattedTotalCount = useMemo(
    () => new Intl.NumberFormat().format(Math.max(0, totalCount)),
    [totalCount],
  );
  const countLabel = `${formattedTotalCount} saved place${totalCount === 1 ? "" : "s"}`;
  const pendingSaveCount = useMemo(
    () => Object.keys(savePendingMap).length,
    [savePendingMap],
  );

  const favoritePlaces = useMemo<HomePlace[]>(
    () => favorites.map((favorite) => ({ ...favorite.venue, isSaved: true })),
    [favorites],
  );

  const handleToggleSave = useCallback(async (id: string) => {
    try {
      await toggleSave(id);
    } catch {
      // Error is already logged in hook
    }
  }, [toggleSave]);

  const handleOpenVenue = useCallback(
    (id: string) => {
      navigate(`/venue/${id}`);
    },
    [navigate],
  );

  const handleNavigateHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleRetryLoad = useCallback(
    async ({
      showLoader = false,
      showPageError = true,
    }: {
      showLoader?: boolean;
      showPageError?: boolean;
    } = {}) => {
      setIsRefreshPending(true);

      try {
        await refreshFavorites({ showLoader, showPageError });
      } catch {
        // Error is already handled in hook state
      } finally {
        setIsRefreshPending(false);
      }
    },
    [refreshFavorites],
  );

  if (loading && favorites.length === 0) {
    return (
      <PageLoading
        text="Loading your saved places"
        subText="Getting your latest Cairo saves..."
      />
    );
  }

  if (error && favorites.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-2xl px-4 py-10">
          <Alert variant="destructive" className="border-destructive/30">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>We could not load saved places</AlertTitle>
            <AlertDescription className="break-words">{error}</AlertDescription>
          </Alert>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                handleRetryLoad({ showLoader: false, showPageError: true })
              }
              disabled={isRefreshPending}
              className="min-h-11 w-full rounded-xl px-4 sm:w-auto"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  isRefreshPending && !shouldReduceMotion && "animate-spin",
                )}
              />
              Try again
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleNavigateHome}
              className="min-h-11 w-full rounded-xl px-4 sm:w-auto"
            >
              Back to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" aria-busy={isRefreshPending}>
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {isRefreshPending
            ? "Refreshing saved places."
            : pendingSaveCount > 0
              ? `Updating ${pendingSaveCount} saved place${pendingSaveCount === 1 ? "" : "s"}.`
              : "Saved places up to date."}
        </p>

        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 pb-4">
          <div className="space-y-1">
            <h1 className="text-role-heading text-foreground">Saved Places</h1>
            <p
              className="text-role-secondary text-muted-foreground text-numeric-tabular"
              aria-live="polite"
              aria-atomic="true"
            >
              {countLabel}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              handleRetryLoad({
                showLoader: false,
                showPageError: true,
              })
            }
            disabled={isRefreshPending}
            className="min-h-11 w-full rounded-xl px-4 sm:w-auto"
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                isRefreshPending && !shouldReduceMotion && "animate-spin",
              )}
            />
            Refresh list
          </Button>
        </header>

        {error && favorites.length > 0 && (
          <Alert variant="destructive" className="mt-4 border-destructive/30">
            <AlertTitle>Could not refresh saved places</AlertTitle>
            <AlertDescription className="mt-2 space-y-2 text-role-secondary">
              <p className="break-words">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleRetryLoad({
                    showLoader: false,
                    showPageError: true,
                  })
                }
                disabled={isRefreshPending}
                className="min-h-10"
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {actionError && (
          <Alert variant="destructive" className="mt-4 border-destructive/30">
            <AlertTitle>Could not update saved places</AlertTitle>
            <AlertDescription className="mt-2 space-y-2 text-role-secondary">
              <p className="break-words">{actionError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearActionError}
                className="min-h-10"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          <LocationPermissionBanner
            userLocation={userLocation}
            onEnableLocation={requestUserLocation}
          />
        </div>

        {favorites.length === 0 ? (
          <section className="py-16 text-center">
            <Heart className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-role-subheading text-foreground">
              No saved places yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-role-secondary text-muted-foreground">
              Save places with the heart button and find them here.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleNavigateHome}
              className="mt-5 min-h-11 w-full rounded-xl px-6 sm:w-auto"
            >
              Explore places
            </Button>
          </section>
        ) : (
          <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {favoritePlaces.map((place, index) => (
              <PlaceCard
                key={`${place.id}-${index}`}
                place={place}
                userLocation={userLocation}
                onToggleSave={handleToggleSave}
                isSavePending={Boolean(savePendingMap[place.id])}
                onClick={handleOpenVenue}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
