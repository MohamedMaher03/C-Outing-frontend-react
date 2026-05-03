import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import {
  Search,
  MapPin,
  Star,
  CheckCircle,
  Eye,
  Flag,
  Plus,
  X,
  Link2,
  Navigation,
  CircleAlert,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useModeratePlaces } from "@/features/moderator/hooks/useModeratePlaces";
import { isGoogleMapsVenueUrl } from "@/features/admin/utils/placeForm";
import {
  moderatorPlaceStatusConfig,
  moderatorPlaceRowStateClass,
  moderatorToastClasses,
} from "@/features/moderator/constants/statusConfigs";
import { MODERATOR_PLACE_STATUS_FILTER_OPTIONS } from "@/features/moderator/constants/filterOptions";
import {
  ModeratorEmptyState,
  ModeratorErrorBanner,
  ModeratorFilterChips,
  ModeratorPageHeader,
  ModeratorPageLayout,
  ModeratorSection,
} from "@/features/moderator/components";
import { formatCount } from "@/features/moderator/utils/formatters";
import { useI18n } from "@/components/i18n";

const PLACE_PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f4efe5'/%3E%3Crect x='14' y='18' width='68' height='60' rx='10' fill='%23e5d8bf'/%3E%3Ccircle cx='38' cy='42' r='9' fill='%23967f59'/%3E%3Cpath d='M24 67c4-8 12-12 20-12s16 4 20 12' stroke='%23806a49' stroke-width='6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";

const EMPTY_FORM = {
  venueUrl: "",
};

const MODERATOR_PLACE_ROW_STYLE: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "116px",
  contain: "layout paint style",
};

const ModeratePlacesPage = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const { t, locale } = useI18n();

  const {
    places,
    loading,
    error,
    queueErrorState,
    pendingPlaceIdSet,
    search,
    statusFilter,
    filteredPlaces: filtered,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    pendingCount,
    flaggedCount,
    showAddForm,
    form,
    formErrors,
    submittingForm,
    toasts,
    setSearch,
    setStatusFilter,
    goToPreviousPage,
    goToNextPage,
    setShowAddForm,
    setForm,
    retry,
    handleApprove,
    handleFlag,
    handleAddPlace,
  } = useModeratePlaces();

  const statusFilterOptions = useMemo(
    () =>
      MODERATOR_PLACE_STATUS_FILTER_OPTIONS.map((option) => ({
        ...option,
        label:
          option.value === "all"
            ? t("admin.filter.all")
            : t(`admin.status.${option.value}`),
      })),
    [t],
  );

  useEffect(() => {
    let timerId: number | null = null;

    if (showAddForm) {
      timerId = window.setTimeout(
        () =>
          formRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        50,
      );
    }

    return () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
  }, [showAddForm]);

  const placeSummary = useMemo(
    () => ({ pending: pendingCount, flagged: flaggedCount }),
    [pendingCount, flaggedCount],
  );

  const normalizedVenueUrl = form.venueUrl.trim();
  const hasTypedVenueUrl = normalizedVenueUrl.length > 0;
  const hasValidVenueUrl = isGoogleMapsVenueUrl(normalizedVenueUrl);

  if (loading) {
    return (
      <LoadingSpinner
        size="md"
        text={t("moderator.places.loading")}
        fullScreen
      />
    );
  }

  if (queueErrorState?.kind === "forbidden") {
    return (
      <ModeratorPageLayout>
        <ModeratorPageHeader
          title={t("moderator.places.header.title")}
          description={t("moderator.places.header.description", {
            pending: formatCount(placeSummary.pending, locale),
            flagged: formatCount(placeSummary.flagged, locale),
          })}
          icon={MapPin}
        />

        <ModeratorSection contentClassName="gap-0">
          <ModeratorEmptyState
            icon={Flag}
            title={t("moderator.places.error.forbiddenTitle")}
            description={t("moderator.places.error.forbiddenMessage")}
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  {t("moderator.places.actions.goBack")}
                </Button>
                <Button
                  onClick={() => {
                    void retry();
                  }}
                >
                  {t("common.retry")}
                </Button>
              </div>
            }
          />
        </ModeratorSection>
      </ModeratorPageLayout>
    );
  }

  const queueErrorTitle =
    queueErrorState?.kind === "load-failure"
      ? t("moderator.places.error.loadFailureTitle")
      : t("moderator.places.error.updateTitle");

  return (
    <ModeratorPageLayout>
      <div
        className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none sm:left-auto sm:right-4"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "max-w-xs rounded-xl px-4 py-3 text-role-secondary font-medium pointer-events-auto transition-all motion-reduce:transition-none",
              moderatorToastClasses[toast.variant],
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <ModeratorErrorBanner
        title={queueErrorTitle}
        message={error}
        onRetry={() => {
          void retry();
        }}
      />

      <ModeratorPageHeader
        title={t("moderator.places.header.title")}
        description={t("moderator.places.header.description", {
          pending: formatCount(placeSummary.pending, locale),
          flagged: formatCount(placeSummary.flagged, locale),
        })}
        icon={MapPin}
        actions={
          <Button
            onClick={() => setShowAddForm((value) => !value)}
            className="gap-2 flex-shrink-0 w-full sm:w-auto"
            variant={showAddForm ? "outline" : "default"}
            aria-expanded={showAddForm}
            aria-controls="moderator-add-place-form"
          >
            {showAddForm ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {showAddForm
              ? t("admin.places.actions.cancel")
              : t("admin.places.actions.addPlace")}
          </Button>
        }
      />

      {showAddForm ? (
        <ModeratorSection
          tone="surface"
          className="py-0"
          contentClassName="gap-6"
        >
          <div
            id="moderator-add-place-form"
            ref={formRef}
            className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
          >
            <div className="rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/15 via-card to-background p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-role-body font-semibold text-foreground">
                <Navigation className="h-4 w-4 text-secondary" />
                {t(
                  "moderator.places.form.scrapeTitle",
                  undefined,
                  "Submit Place via Google Maps",
                )}
              </h2>
              <p className="mt-2 text-role-secondary text-muted-foreground">
                {t(
                  "moderator.places.form.scrapeDescription",
                  undefined,
                  "Paste a Google Maps place URL to start auto-scraping and moderation review.",
                )}
              </p>

              <div className="mt-4 space-y-3 rounded-xl border border-border/70 bg-card/80 p-4">
                <p className="text-role-secondary font-semibold text-foreground">
                  {t(
                    "moderator.places.form.scrapeRulesTitle",
                    undefined,
                    "Submission Rules",
                  )}
                </p>
                <div className="space-y-2 text-role-caption text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 text-secondary" />
                    {t(
                      "moderator.places.form.scrapeRuleGoogleOnly",
                      undefined,
                      "Only Google Maps URLs are accepted.",
                    )}
                  </p>
                  <p className="flex items-start gap-2">
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 text-secondary" />
                    {t(
                      "moderator.places.form.scrapeRuleExamples",
                      undefined,
                      "Use maps.app.goo.gl, goo.gl/maps, or google.com/maps links.",
                    )}
                  </p>
                  <p className="flex items-start gap-2">
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 text-secondary" />
                    {t(
                      "moderator.places.form.scrapeRuleRejected",
                      undefined,
                      "Non-Google links are rejected automatically.",
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <Label
                htmlFor="moderator-venue-url"
                className="text-role-secondary font-semibold"
              >
                {t(
                  "moderator.places.form.venueUrlLabel",
                  undefined,
                  "Google Maps place URL",
                )}
              </Label>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <Input
                  id="moderator-venue-url"
                  placeholder="https://maps.app.goo.gl/..."
                  value={form.venueUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      venueUrl: event.target.value,
                    }))
                  }
                  className={cn(
                    "min-h-11",
                    formErrors.venueUrl && "border-destructive",
                  )}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="url"
                />

                {hasValidVenueUrl ? (
                  <a
                    href={normalizedVenueUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-4 text-role-secondary font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Link2 className="h-4 w-4" />
                    {t("moderator.places.form.openUrl", undefined, "Open")}
                  </a>
                ) : null}
              </div>

              {formErrors.venueUrl ? (
                <p className="mt-1 text-role-caption text-destructive">
                  {formErrors.venueUrl}
                </p>
              ) : null}

              <p
                className={cn(
                  "mt-2 text-role-caption",
                  !hasTypedVenueUrl
                    ? "text-muted-foreground"
                    : hasValidVenueUrl
                      ? "text-primary"
                      : "text-destructive",
                )}
              >
                {!hasTypedVenueUrl
                  ? t(
                      "moderator.places.form.urlHintDefault",
                      undefined,
                      "Paste a Google Maps link to continue.",
                    )
                  : hasValidVenueUrl
                    ? t(
                        "moderator.places.form.urlHintValid",
                        undefined,
                        "Valid link. Ready to start scraping.",
                      )
                    : t(
                        "moderator.places.form.urlHintInvalid",
                        undefined,
                        "Invalid URL. Use a Google Maps place link.",
                      )}
              </p>

              <p className="mt-3 text-role-caption text-muted-foreground">
                {t(
                  "moderator.places.form.urlExampleLabel",
                  undefined,
                  "Example:",
                )}{" "}
                <span className="font-medium text-foreground">
                  https://www.google.com/maps/place/...
                </span>
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  className="min-h-11"
                  onClick={() => {
                    setShowAddForm(false);
                    setForm(EMPTY_FORM);
                  }}
                >
                  {t("admin.places.actions.cancel")}
                </Button>
                <Button
                  onClick={handleAddPlace}
                  disabled={submittingForm || !hasValidVenueUrl}
                  className="gap-2 min-h-11"
                >
                  {submittingForm ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("moderator.places.actions.submitting")}
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4" />
                      {t(
                        "moderator.places.actions.startScrape",
                        undefined,
                        "Start Scraping",
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </ModeratorSection>
      ) : null}

      <ModeratorSection
        tone="muted"
        title={t("moderator.places.filters.title")}
        description={t("moderator.places.filters.description")}
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("moderator.places.filters.searchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10"
            />
          </div>
          <div className="lg:min-w-[16rem]">
            <ModeratorFilterChips
              label={t("admin.filter.status")}
              options={statusFilterOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>
      </ModeratorSection>

      <ModeratorSection
        title={t("moderator.places.queue.title")}
        description={t("moderator.places.queue.description", {
          count: formatCount(filtered.length, locale),
        })}
        contentClassName="gap-4"
      >
        {filtered.length === 0 ? (
          <ModeratorEmptyState
            icon={MapPin}
            title={t("moderator.places.empty.title")}
            description={
              search.trim().length > 0
                ? t("moderator.places.empty.withSearch")
                : t("moderator.places.empty.default")
            }
          />
        ) : (
          filtered.map((place) => {
            const config = moderatorPlaceStatusConfig[place.status];
            const StatusIcon = config.icon;
            const isPending = pendingPlaceIdSet.has(place.id);

            return (
              <div
                key={place.id}
                className={cn(
                  "space-y-4 rounded-xl border bg-card p-4 transition-all motion-reduce:transition-none hover:shadow-sm",
                  moderatorPlaceRowStateClass[place.status],
                )}
                aria-busy={isPending}
                style={MODERATOR_PLACE_ROW_STYLE}
              >
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                  <img
                    src={place.image || PLACE_PLACEHOLDER_IMAGE}
                    alt={place.name}
                    className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).src =
                        PLACE_PLACEHOLDER_IMAGE;
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-role-secondary font-semibold text-foreground break-words">
                        {place.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-role-caption px-1.5 py-0",
                          config.class,
                        )}
                      >
                        <StatusIcon className="h-2.5 w-2.5 mr-0.5" />{" "}
                        {t(`admin.status.${place.status}`)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-role-caption text-muted-foreground flex-wrap">
                      <span className="break-words">{place.category}</span>
                      <span>·</span>
                      <span className="break-words">{place.district}</span>

                      {place.rating > 0 ? (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-secondary fill-secondary" />
                            {place.rating}
                          </span>
                        </>
                      ) : null}

                      <span>·</span>
                      <span>
                        {t("moderator.places.meta.reviews", {
                          count: formatCount(place.reviewCount, locale),
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 border-t border-border/60 pt-3 sm:justify-end sm:flex-nowrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/venue/${place.id}`)}
                    className="text-role-secondary gap-1 min-h-11 sm:h-8"
                  >
                    <Eye className="h-3.5 w-3.5" />{" "}
                    {t("admin.places.actions.view")}
                  </Button>

                  {place.status === "pending" || place.status === "flagged" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApprove(place.id)}
                      disabled={isPending}
                      className="text-role-secondary gap-1 min-h-11 sm:h-8 text-primary hover:text-primary hover:bg-primary/10"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}
                      {t("admin.places.actions.approve")}
                    </Button>
                  ) : null}

                  {place.status === "active" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFlag(place.id)}
                      disabled={isPending}
                      className="text-role-secondary gap-1 min-h-11 sm:h-8 text-foreground hover:text-foreground hover:bg-secondary/20"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Flag className="h-3.5 w-3.5" />
                      )}
                      {t("moderator.places.actions.flag")}
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
        {totalPages > 1 && (
          <div className="mt-2 flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-role-caption text-muted-foreground">
              {t("moderator.places.pagination.summary", {
                page: formatCount(pageIndex, locale),
                totalPages: formatCount(totalPages, locale),
                totalCount: formatCount(totalCount, locale),
                pageSize: formatCount(pageSize, locale),
              })}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={!hasPreviousPage || loading}
              >
                {t("moderator.places.pagination.previous")}
              </Button>

              <span className="inline-flex items-center rounded-lg border px-3">
                {t("moderator.places.pagination.page", {
                  page: formatCount(pageIndex, locale),
                  totalPages: formatCount(totalPages, locale),
                })}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={!hasNextPage || loading}
              >
                {t("moderator.places.pagination.next")}
              </Button>
            </div>
          </div>
        )}
      </ModeratorSection>

      <ModeratorSection tone="muted" contentClassName="gap-0">
        <p className="text-role-secondary text-foreground break-words">
          <span className="font-medium">
            {t("moderator.places.note.label")}
          </span>{" "}
          {t("moderator.places.note.body")}
        </p>
      </ModeratorSection>
    </ModeratorPageLayout>
  );
};

export default ModeratePlacesPage;
