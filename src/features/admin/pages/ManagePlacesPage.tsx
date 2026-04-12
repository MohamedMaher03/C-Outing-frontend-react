/**
 * Manage Places Page (Admin)
 *
 * Full CRUD on places: list, search, filter by status, change status, delete.
 * Add Place flow uses Google Maps URL scraping initiation.
 */

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import {
  Search,
  MapPin,
  Star,
  CheckCircle,
  Trash2,
  Eye,
  XCircle,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useManagePlaces } from "@/features/admin/hooks/useManagePlaces";
import {
  AdminEmptyState,
  AdminErrorBanner,
  AdminFilterChips,
  AdminPageLayout,
  AdminPageHeader,
  AdminSection,
} from "@/features/admin/components";
import { PLACE_STATUS_FILTER_OPTIONS } from "@/features/admin/constants/filterOptions";
import {
  adminToastClasses,
  placeStatusConfig,
} from "@/features/admin/constants/statusConfigs";
import {
  EMPTY_PLACE_FORM,
  isGoogleMapsVenueUrl,
} from "@/features/admin/utils/placeForm";
import { useI18n } from "@/components/i18n";

const ADMIN_LIST_ROW_STYLE: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "110px",
  contain: "layout paint style",
};

// ── Constants ─────────────────────────────────────────────────

// ── Component ─────────────────────────────────────────────────

const ManagePlacesPage = () => {
  const navigate = useNavigate();
  const { t, formatNumber } = useI18n();
  const formRef = useRef<HTMLDivElement>(null);

  const {
    places,
    loading,
    error,
    pendingPlaceIds,
    search,
    statusFilter,
    filteredPlaces: filtered,
    showAddForm,
    form,
    formErrors,
    submittingForm,
    scrapeStartedMessage,
    placeActionNotice,
    toasts,
    setSearch,
    setStatusFilter,
    setShowAddForm,
    setForm,
    dismissScrapeStartedMessage,
    dismissPlaceActionNotice,
    retry,
    handleStatusChange,
    handleDelete,
    handleAddPlace,
  } = useManagePlaces();

  const statusFilterOptions = useMemo(
    () =>
      PLACE_STATUS_FILTER_OPTIONS.map((option) => ({
        ...option,
        label:
          option.value === "all"
            ? t("admin.filter.all")
            : t(`admin.status.${option.value}`),
      })),
    [t],
  );

  const getStatusLabel = (status: string): string =>
    t(`admin.status.${status}`, undefined, status);

  // Scroll to form when opened (DOM-specific side effect stays in the component)
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
    () => ({
      flagged: places.filter((place) => place.status === "flagged").length,
    }),
    [places],
  );

  const normalizedVenueUrl = form.venueUrl.trim();
  const hasTypedVenueUrl = normalizedVenueUrl.length > 0;
  const hasValidVenueUrl = isGoogleMapsVenueUrl(normalizedVenueUrl);

  if (loading) {
    return (
      <LoadingSpinner size="md" text={t("admin.places.loading")} fullScreen />
    );
  }

  return (
    <AdminPageLayout>
      {/* Toast Notifications */}
      <div
        className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none sm:left-auto sm:right-4"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "max-w-xs rounded-xl px-4 py-3 text-role-secondary font-medium pointer-events-auto transition-all",
              adminToastClasses[t.variant],
            )}
          >
            {t.message}
          </div>
        ))}
      </div>

      <AdminErrorBanner
        title={t("admin.places.error.updateTitle")}
        message={error}
        onRetry={() => {
          void retry();
        }}
      />

      {/* Header */}
      <AdminPageHeader
        title={t("admin.places.header.title")}
        description={t("admin.places.header.description", {
          total: formatNumber(places.length),
          flagged: formatNumber(placeSummary.flagged),
        })}
        icon={MapPin}
        actions={
          <Button
            onClick={() => setShowAddForm((v) => !v)}
            className="gap-2 flex-shrink-0 w-full sm:w-auto"
            variant={showAddForm ? "outline" : "default"}
            aria-expanded={showAddForm}
            aria-controls="admin-add-place-form"
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

      {scrapeStartedMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {t(
                    "admin.places.notice.scrapeStartedTitle",
                    undefined,
                    "Scraping has started",
                  )}
                </p>
                <p className="text-role-caption break-words text-muted-foreground">
                  {scrapeStartedMessage}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={dismissScrapeStartedMessage}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/15 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={t(
                "admin.places.notice.dismissAria",
                undefined,
                "Dismiss scrape status message",
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {placeActionNotice ? (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "rounded-xl px-4 py-3",
            placeActionNotice.type === "deleted"
              ? "border border-destructive/30 bg-destructive/10"
              : "border border-amber-500/30 bg-amber-500/10",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2">
              {placeActionNotice.type === "deleted" ? (
                <Trash2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700 dark:text-amber-400" />
              )}

              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {placeActionNotice.type === "deleted"
                    ? t(
                        "admin.places.notice.deletedTitle",
                        undefined,
                        "Place deleted",
                      )
                    : t(
                        "admin.places.notice.removedTitle",
                        undefined,
                        "Place removed",
                      )}
                </p>
                <p className="text-role-caption break-words text-muted-foreground">
                  {placeActionNotice.message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={dismissPlaceActionNotice}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={t(
                "admin.places.notice.dismissActionAria",
                undefined,
                "Dismiss place update message",
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Add Place Form */}
      {showAddForm && (
        <AdminSection tone="surface" className="py-0" contentClassName="gap-6">
          <div
            id="admin-add-place-form"
            ref={formRef}
            className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
          >
            <div className="rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/15 via-card to-background p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-role-body font-semibold text-foreground">
                <Navigation className="h-4 w-4 text-secondary" />
                {t(
                  "admin.places.form.scrapeTitle",
                  undefined,
                  "Add Place via Google Maps",
                )}
              </h2>
              <p className="mt-2 text-role-secondary text-muted-foreground">
                {t(
                  "admin.places.form.scrapeDescription",
                  undefined,
                  "Paste a Google Maps venue URL and we will scrape details automatically. Manual place fields are no longer required.",
                )}
              </p>

              <div className="mt-4 space-y-3 rounded-xl border border-border/70 bg-card/80 p-4">
                <p className="text-role-secondary font-semibold text-foreground">
                  {t(
                    "admin.places.form.scrapeRulesTitle",
                    undefined,
                    "Submission Rules",
                  )}
                </p>
                <div className="space-y-2 text-role-caption text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 text-secondary" />
                    {t(
                      "admin.places.form.scrapeRuleGoogleOnly",
                      undefined,
                      "Only Google Maps links are accepted.",
                    )}
                  </p>
                  <p className="flex items-start gap-2">
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 text-secondary" />
                    {t(
                      "admin.places.form.scrapeRuleExamples",
                      undefined,
                      "Accepted formats: maps.app.goo.gl, goo.gl/maps, or google.com/maps/...",
                    )}
                  </p>
                  <p className="flex items-start gap-2">
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 text-secondary" />
                    {t(
                      "admin.places.form.scrapeRuleNoHome",
                      undefined,
                      "Do not use generic home pages or non-maps URLs.",
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <Label
                htmlFor="admin-venue-url"
                className="text-role-secondary font-semibold"
              >
                {t(
                  "admin.places.form.venueUrlLabel",
                  undefined,
                  "Google Maps place URL",
                )}
              </Label>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <Input
                  id="admin-venue-url"
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
                    {t("admin.places.form.openUrl", undefined, "Open")}
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
                      "admin.places.form.urlHintDefault",
                      undefined,
                      "Paste a Google Maps link to continue.",
                    )
                  : hasValidVenueUrl
                    ? t(
                        "admin.places.form.urlHintValid",
                        undefined,
                        "Looks valid. You can start scraping now.",
                      )
                    : t(
                        "admin.places.form.urlHintInvalid",
                        undefined,
                        "Invalid URL. Use a Google Maps place link.",
                      )}
              </p>

              <p className="mt-3 text-role-caption text-muted-foreground">
                {t("admin.places.form.urlExampleLabel", undefined, "Example:")}{" "}
                <span className="font-medium text-foreground">
                  https://www.google.com/maps/place/...
                </span>
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setForm(EMPTY_PLACE_FORM);
                  }}
                  className="w-full sm:w-auto"
                >
                  {t("admin.places.actions.cancel")}
                </Button>

                <Button
                  onClick={handleAddPlace}
                  disabled={submittingForm || !hasValidVenueUrl}
                  className="gap-2 w-full sm:w-auto"
                >
                  {submittingForm ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("admin.places.actions.saving")}
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4" />
                      {t(
                        "admin.places.actions.startScrape",
                        undefined,
                        "Start Scraping",
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </AdminSection>
      )}

      <AdminSection
        tone="muted"
        title={t("admin.places.filters.title")}
        description={t("admin.places.filters.description")}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("admin.places.filters.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="lg:w-auto">
            <AdminFilterChips
              label={t("admin.filter.status")}
              options={statusFilterOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>
      </AdminSection>

      <AdminSection
        title={t("admin.places.records.title")}
        description={t("admin.places.records.description", {
          count: formatNumber(filtered.length),
        })}
        contentClassName="gap-3"
      >
        {filtered.length === 0 ? (
          <AdminEmptyState
            icon={MapPin}
            title={t("admin.places.empty.title")}
            description={t("admin.places.empty.description")}
          />
        ) : (
          filtered.map((place) => {
            const config = placeStatusConfig[place.status];
            const StatusIcon = config.icon;
            const isPendingAction = pendingPlaceIds.includes(place.id);

            return (
              <div
                key={place.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-all motion-reduce:transition-none hover:border-secondary/30 hover:shadow-sm sm:flex-row sm:items-center"
                style={ADMIN_LIST_ROW_STYLE}
              >
                {/* Image */}
                <img
                  src={place.image}
                  alt={place.name}
                  className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                  loading="lazy"
                  decoding="async"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {place.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-1.5 py-0 text-role-caption",
                        config.class,
                      )}
                    >
                      <StatusIcon className="h-2.5 w-2.5 mr-0.5" />{" "}
                      {getStatusLabel(place.status)}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-role-caption text-muted-foreground">
                    <span>{place.category}</span>
                    <span>·</span>
                    <span>{place.district}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-secondary fill-secondary dark:text-primary dark:fill-primary" />{" "}
                      {place.rating}
                    </span>
                    <span>·</span>
                    <span>
                      {t("admin.places.records.reviewCount", {
                        count: formatNumber(place.reviewCount),
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0 w-full sm:w-auto justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/venue/${place.id}`)}
                    className="text-xs gap-1 min-h-11 sm:h-8"
                    disabled={isPendingAction}
                  >
                    <Eye className="h-3.5 w-3.5" />{" "}
                    {t("admin.places.actions.view")}
                  </Button>

                  {place.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        void handleStatusChange(place.id, "active")
                      }
                      className="min-h-11 gap-1 text-role-secondary text-primary hover:text-primary sm:h-8"
                      disabled={isPendingAction}
                    >
                      {isPendingAction ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}{" "}
                      {t("admin.places.actions.approve")}
                    </Button>
                  )}

                  {place.status === "flagged" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          void handleStatusChange(place.id, "active")
                        }
                        className="min-h-11 gap-1 text-role-secondary text-primary hover:text-primary sm:h-8"
                        disabled={isPendingAction}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {t("admin.places.actions.clear")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          void handleStatusChange(place.id, "removed")
                        }
                        className="min-h-11 gap-1 text-role-secondary text-destructive hover:text-destructive sm:h-8"
                        disabled={isPendingAction}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {t("admin.places.actions.remove")}
                      </Button>
                    </>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1 min-h-11 sm:h-8 text-destructive hover:text-destructive"
                        disabled={isPendingAction}
                        aria-label={t("admin.places.actions.deleteAria", {
                          name: place.name,
                        })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("admin.places.dialog.deleteTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("admin.places.dialog.deleteDescription", {
                            name: place.name,
                          })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t("admin.places.actions.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            void handleDelete(place.id, place.name)
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isPendingAction}
                        >
                          {t("admin.places.actions.delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })
        )}
      </AdminSection>
    </AdminPageLayout>
  );
};

export default ManagePlacesPage;
