/**
 * Public Profile Page
 *
 * Read-only view for another user's profile and recent review activity.
 * Hardened for long text, retriable failures, and partial-data rendering.
 */

import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
  ShieldAlert,
  Star,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { usePublicProfile } from "../hooks/usePublicProfile";

const toDisplayDate = (
  value: string | Date,
  formatter: Intl.DateTimeFormat,
  fallback: string,
): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }
  return formatter.format(parsed);
};

function StarRow({ rating }: { rating: number }) {
  const { t } = useI18n();
  const safeRating = Math.min(5, Math.max(0, Math.round(rating)));
  const ratingLabel = t("users.publicProfile.ratingLabel", {
    rating: safeRating,
  });

  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={ratingLabel}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={`h-3.5 w-3.5 ${
            index < safeRating
              ? "text-secondary fill-secondary"
              : "text-muted-foreground/25"
          }`}
        />
      ))}
      <span className="sr-only">{ratingLabel}</span>
    </div>
  );
}

function StatPill({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex min-w-0 flex-col items-center gap-0.5", className)}
    >
      <span className="text-base font-semibold text-primary-foreground text-numeric-tabular sm:text-lg">
        {value}
      </span>
      <span className="text-role-caption text-primary-foreground/68">
        {label}
      </span>
    </div>
  );
}

const PublicProfilePage = () => {
  const { t, locale, formatNumber } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    profile,
    reviews,
    loading,
    isReloading,
    error,
    reviewsWarning,
    isOwnProfile,
    reload,
    clearReviewsWarning,
  } = usePublicProfile(id ?? "");

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale),
    [locale],
  );
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [locale],
  );

  if (loading) {
    return (
      <PageLoading
        text={t("users.publicProfile.loading")}
        subText={t("users.publicProfile.loadingSubtitle")}
      />
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-4">
        <div className="w-full space-y-4">
          <Alert variant="destructive" className="border-destructive/40">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("users.publicProfile.errorTitle")}</AlertTitle>
            <AlertDescription className="break-words">
              {error ?? t("users.publicProfile.errorDescription")}
            </AlertDescription>
          </Alert>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => void reload()}
              disabled={isReloading}
              className="min-h-11 w-full touch-manipulation sm:w-auto"
            >
              {isReloading
                ? t("users.publicProfile.retrying")
                : t("common.retry")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isReloading}
              className="min-h-11 w-full touch-manipulation sm:w-auto"
            >
              {t("users.publicProfile.goBack")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const joinedYear = profile.joinedDate
    ? new Date(profile.joinedDate).getFullYear()
    : null;
  const isBanned = Boolean(profile.isBanned);
  const hasAgeBadge = typeof profile.age === "number" && profile.age >= 0;
  const showMetaBadges = hasAgeBadge || isBanned;
  const reviewCount = numberFormatter.format(Math.max(0, profile.reviewCount));
  const recentCount = numberFormatter.format(reviews.length);
  const interactionCount = numberFormatter.format(
    Math.max(0, profile.totalInteractions ?? 0),
  );

  return (
    <main
      className="mx-auto w-full max-w-6xl pb-10 lg:pb-14"
      aria-busy={isReloading}
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {isReloading
          ? t("users.publicProfile.live.refreshing")
          : reviewsWarning
            ? t("users.publicProfile.live.partial")
            : t("users.publicProfile.live.upToDate")}
      </p>

      <div className="px-4 pt-4 md:pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(-1)}
          className="min-h-11 touch-manipulation gap-2 px-3 text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground motion-reduce:transition-none"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("auth.back")}
        </Button>
      </div>

      <div className="mt-3 grid gap-7 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:px-4">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="relative mx-4 overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-br from-[hsl(var(--primary)/0.94)] to-[hsl(var(--navy-light)/0.9)] p-4 text-primary-foreground shadow-sm sm:p-6 lg:mx-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--secondary)/0.12),_transparent_62%)]" />

            <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border border-primary-foreground/18 bg-primary-foreground/8">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={`${profile.name} avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-primary-foreground">
                    {profile.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <h1 className="text-role-subheading break-words text-primary-foreground">
                  {profile.name}
                </h1>

                {showMetaBadges && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-role-caption sm:justify-start">
                    {hasAgeBadge && (
                      <span className="inline-flex items-center rounded-full bg-primary-foreground/12 px-2.5 py-1 font-medium">
                        {t("users.publicProfile.ageBadge", {
                          age: profile.age ?? 0,
                        })}
                      </span>
                    )}

                    {isBanned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/18 px-2.5 py-1 font-medium text-primary-foreground/92">
                        <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                        {t("users.publicProfile.restricted")}
                      </span>
                    )}
                  </div>
                )}

                {joinedYear && (
                  <div className="flex items-center justify-center gap-1 text-role-caption text-primary-foreground/74 sm:justify-start">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {t("users.publicProfile.memberSince", {
                        year: joinedYear,
                      })}
                    </span>
                  </div>
                )}

                {profile.email && (
                  <div className="flex items-center justify-center gap-1 text-role-caption text-primary-foreground/74 sm:justify-start">
                    <Mail
                      className="h-3.5 w-3.5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="break-all">{profile.email}</span>
                  </div>
                )}

                {profile.bio && (
                  <p className="text-role-secondary max-w-prose break-words text-primary-foreground/78">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-3 border-t border-primary-foreground/18 pt-4 sm:grid-cols-3">
              <StatPill
                value={reviewCount}
                label={t("users.publicProfile.stats.reviews")}
              />
              <StatPill
                value={recentCount}
                label={t("users.publicProfile.stats.recent")}
              />
              <StatPill
                value={interactionCount}
                label={t("users.publicProfile.stats.interactions")}
                className="col-span-2 sm:col-span-1"
              />
            </div>
          </section>

          <div className="space-y-4 px-4 lg:px-0">
            {isOwnProfile ? (
              <Button
                asChild
                variant="outline"
                className="min-h-11 w-full touch-manipulation gap-2 border-secondary/45 text-foreground transition-colors duration-200 ease-out hover:bg-secondary/12 motion-reduce:transition-none"
              >
                <Link to="/profile">
                  <User className="h-4 w-4" aria-hidden="true" />
                  {t("users.publicProfile.viewOwnProfile")}
                </Link>
              </Button>
            ) : (
              <section className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {t("users.publicProfile.snapshotTitle")}
                    </p>
                    <p className="text-role-secondary text-muted-foreground">
                      {t("users.publicProfile.snapshotDescription")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void reload()}
                    disabled={isReloading}
                    className="min-h-11 w-full touch-manipulation gap-1.5 transition-colors duration-200 ease-out motion-reduce:transition-none sm:w-auto"
                  >
                    <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                    {isReloading
                      ? t("users.publicProfile.refreshing")
                      : t("users.publicProfile.refresh")}
                  </Button>
                </div>
              </section>
            )}

            {reviewsWarning && (
              <Alert className="border-border/80">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("users.publicProfile.partialData")}</AlertTitle>
                <AlertDescription className="space-y-2 text-role-secondary">
                  <p className="break-words">{reviewsWarning}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void reload()}
                      disabled={isReloading}
                      className="min-h-11 w-full touch-manipulation sm:w-auto"
                    >
                      {isReloading
                        ? t("users.publicProfile.retrying")
                        : t("common.retry")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearReviewsWarning}
                      className="min-h-11 w-full touch-manipulation sm:w-auto"
                    >
                      {t("common.dismiss")}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </aside>

        <section className="space-y-3 px-4 lg:px-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-role-secondary font-medium tracking-[0.05em] text-foreground/88">
              {t("users.publicProfile.recentReviews")}
            </h2>
            <span className="text-role-secondary text-muted-foreground text-numeric-tabular">
              {t("users.publicProfile.shownCount", { count: recentCount })}
            </span>
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center sm:p-8">
              <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-role-secondary text-muted-foreground">
                {t("users.publicProfile.emptyReviews")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 [content-visibility:auto] [contain-intrinsic-size:980px]">
              {reviews.map((review) => (
                <Link
                  key={review.reviewId}
                  to={`/venue/${encodeURIComponent(review.placeId)}`}
                  aria-label={t("users.publicProfile.openReview", {
                    place: review.placeName,
                  })}
                  className="block rounded-xl border border-border/90 bg-card p-4 transition-[border-color,background-color] duration-200 ease-out hover:border-secondary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-secondary/80" />
                      <span className="truncate text-role-secondary font-semibold text-foreground">
                        {review.placeName}
                      </span>
                    </div>
                    <StarRow rating={review.rating} />
                  </div>

                  <p
                    className="text-role-secondary mt-2 break-words text-muted-foreground line-clamp-3"
                    dir="auto"
                  >
                    {review.comment}
                  </p>

                  {typeof review.sentimentScore === "number" && (
                    <div className="text-role-caption mt-2 inline-flex rounded-full bg-secondary/12 px-2.5 py-1 text-secondary/85">
                      {t("users.publicProfile.sentimentScore", {
                        score: formatNumber(
                          Number(review.sentimentScore.toFixed(1)),
                        ),
                      })}
                    </div>
                  )}

                  <p className="text-role-caption mt-2 text-muted-foreground/70">
                    {toDisplayDate(
                      review.date,
                      dateFormatter,
                      t("users.publicProfile.dateUnavailable"),
                    )}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default PublicProfilePage;
