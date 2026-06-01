import { AlertCircle, Heart, RefreshCw } from "lucide-react";
import PlaceCard from "@/features/home/components/PlaceCard";
import LocationPermissionBanner from "@/features/home/components/LocationPermissionBanner";
import { useFavoritesPage } from "@/features/favorites/hooks/useFavoritesPage";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FavoritesPage = () => {
  const {
    t,
    userLocation,
    viewPhase,
    loadError,
    actionError,
    savedPlaces,
    savePendingMap,
    listRefreshInFlight,
    countLabel,
    liveStatusMessage,
    spinRefreshIcon,
    runListRefresh,
    unsavePlace,
    openVenueDetail,
    routeToHomeFeed,
    clearActionError,
  } = useFavoritesPage();

  if (viewPhase === "initial-loading") {
    return (
      <PageLoading
        text={t("favorites.loading.title")}
        subText={t("favorites.loading.subtitle")}
      />
    );
  }

  if (viewPhase === "fatal-error") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-2xl px-4 py-10">
          <Alert variant="destructive" className="border-destructive/30">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("favorites.error.load")}</AlertTitle>
            <AlertDescription className="break-words">{loadError}</AlertDescription>
          </Alert>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => runListRefresh()}
              disabled={listRefreshInFlight}
              className="min-h-11 w-full rounded-xl px-4 sm:w-auto"
            >
              <RefreshCw
                className={cn("h-4 w-4", spinRefreshIcon && "animate-spin")}
              />
              {t("common.retry")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={routeToHomeFeed}
              className="min-h-11 w-full rounded-xl px-4 sm:w-auto"
            >
              {t("home.seeAll.backHome")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" aria-busy={listRefreshInFlight}>
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {liveStatusMessage}
        </p>

        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 pb-4">
          <div className="space-y-1">
            <h1 className="text-role-heading text-foreground">
              {t("favorites.title")}
            </h1>
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
            onClick={() => runListRefresh()}
            disabled={listRefreshInFlight}
            className="min-h-11 w-full rounded-xl px-4 sm:w-auto"
          >
            <RefreshCw
              className={cn("h-4 w-4", spinRefreshIcon && "animate-spin")}
            />
            {t("favorites.action.refreshList")}
          </Button>
        </header>

        {loadError && savedPlaces.length > 0 && (
          <Alert variant="destructive" className="mt-4 border-destructive/30">
            <AlertTitle>{t("favorites.error.refresh")}</AlertTitle>
            <AlertDescription className="mt-2 space-y-2 text-role-secondary">
              <p className="break-words">{loadError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => runListRefresh()}
                disabled={listRefreshInFlight}
                className="min-h-10"
              >
                {t("common.retry")}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {actionError && (
          <Alert variant="destructive" className="mt-4 border-destructive/30">
            <AlertTitle>{t("favorites.error.update")}</AlertTitle>
            <AlertDescription className="mt-2 space-y-2 text-role-secondary">
              <p className="break-words">{actionError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearActionError}
                className="min-h-10"
              >
                {t("common.dismiss")}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          <LocationPermissionBanner
            userLocation={userLocation}
            onEnableLocation={userLocation.requestLocation}
          />
        </div>

        {savedPlaces.length === 0 ? (
          <section className="py-16 text-center">
            <Heart className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-role-subheading text-foreground">
              {t("favorites.empty.title")}
            </p>
            <p className="mx-auto mt-2 max-w-md text-role-secondary text-muted-foreground">
              {t("favorites.empty.description")}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={routeToHomeFeed}
              className="mt-5 min-h-11 w-full rounded-xl px-6 sm:w-auto"
            >
              {t("favorites.empty.explore")}
            </Button>
          </section>
        ) : (
          <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {savedPlaces.map((place, index) => (
              <PlaceCard
                key={`${place.id}-${index}`}
                place={place}
                userLocation={userLocation}
                onToggleSave={unsavePlace}
                isSavePending={Boolean(savePendingMap[place.id])}
                onClick={openVenueDetail}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
