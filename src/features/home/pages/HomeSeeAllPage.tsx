import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import PlaceCard from "@/features/home/components/PlaceCard";
import LocationPermissionBanner from "@/features/home/components/LocationPermissionBanner";
import { useHomeSeeAllPage } from "@/features/home/hooks/useHomeSeeAllPage";

const HomeSeeAllPage = () => {
  const {
    t,
    formatNumber,
    navigateHome,
    openVenueDetail,
    isSavePendingFor,
    countSteps,
    collectionHeader,
    safeCollection,
    places,
    isLoading,
    error,
    saveError,
    clearSaveError,
    count,
    setCount,
    toggleSave,
    retryFetch,
    userLocation,
    requestUserLocation,
  } = useHomeSeeAllPage();

  if (!safeCollection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl border border-border/60 bg-card p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-destructive">
            {t("home.seeAll.invalidType.title")}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t("home.seeAll.invalidType.description")}
          </p>
          <Button type="button" className="mt-4" onClick={navigateHome}>
            {t("home.seeAll.backHome")}
          </Button>
        </div>
      </div>
    );
  }

  const header = collectionHeader!;
  const HeaderIcon = header.icon;

  if (isLoading) {
    return (
      <PageLoading
        text={t("home.seeAll.loading", { title: header.title })}
        subText={t("home.seeAll.loadingSubtitle")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={navigateHome}
              className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("home.seeAll.backHome")}
            </button>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2 text-foreground">
              <HeaderIcon className={`h-7 w-7 ${header.colorClass}`} />
              {header.title}
            </h1>
            <p className="text-sm text-muted-foreground">{header.subtitle}</p>
          </div>

          <div
            className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card p-1.5 shadow-sm"
            role="group"
            aria-label={t("home.seeAll.countGroup")}
          >
            {countSteps.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => setCount(option)}
                aria-pressed={count === option}
                className={`min-h-11 rounded-xl px-3 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 ${
                  count === option
                    ? "bg-foreground text-background"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {t("home.seeAll.countOption", {
                  count: formatNumber(option),
                })}
              </button>
            ))}
          </div>
        </div>

        <LocationPermissionBanner
          userLocation={userLocation}
          onEnableLocation={requestUserLocation}
        />

        {saveError && (
          <div
            className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-destructive">{saveError}</p>
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
        )}

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4">
            <p className="text-sm font-semibold text-destructive">
              {t("home.seeAll.errorTitle")}
            </p>
            <p className="text-xs text-destructive/80 mt-1">{error}</p>
            <Button
              type="button"
              onClick={retryFetch}
              variant="outline"
              size="sm"
              className="mt-3 h-9 rounded-full border-destructive/30 px-3 text-xs font-semibold text-destructive hover:bg-destructive/5 hover:text-destructive"
            >
              {t("common.retry")}
            </Button>
          </div>
        ) : places.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card/60 px-4 py-10 text-center">
            <p className="font-semibold text-foreground">
              {t("home.seeAll.emptyTitle")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("home.seeAll.emptyDescription")}
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
                onToggleSave={toggleSave}
                isSavePending={isSavePendingFor(place.id)}
                onClick={openVenueDetail}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeSeeAllPage;
