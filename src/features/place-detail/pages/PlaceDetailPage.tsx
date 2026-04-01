import { Suspense, lazy, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  ExternalLink,
  Heart,
  MessageSquare,
  ThumbsUp,
  Globe,
  Flag,
  Phone,
  Clock,
  Wifi,
  Toilet,
  ParkingSquare,
  UtensilsCrossed,
  CalendarCheck,
  Users,
  Accessibility,
  Images,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/components/i18n";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { usePlaceDetail } from "@/features/place-detail/hooks/usePlaceDetail";
import { getReviewIdentity } from "@/features/place-detail/utils/reviewIdentity";
import { PRICE_LEVEL_META } from "@/features/place-detail/utils/priceLevel";
import { getDefaultVenueImageDataUrl } from "@/features/place-detail/utils/defaultImages";
import { formatCountLabel } from "@/features/place-detail/utils/formatters";
import { ReviewSkeleton } from "@/features/place-detail/components/ReviewSkeleton";
import "@/features/place-detail/placeDetailTypography.css";

const ReviewCardLazy = lazy(() =>
  import("@/features/place-detail/components/ReviewCard").then((module) => ({
    default: module.ReviewCard,
  })),
);

const SocialReviewCardLazy = lazy(() =>
  import("@/features/place-detail/components/SocialReviewCard").then(
    (module) => ({
      default: module.SocialReviewCard,
    }),
  ),
);

const ReviewSummarySectionLazy = lazy(() =>
  import("@/features/place-detail/components/ReviewSummarySection").then(
    (module) => ({
      default: module.ReviewSummarySection,
    }),
  ),
);

const AddReviewFormLazy = lazy(() =>
  import("@/features/place-detail/components/AddReviewForm").then((module) => ({
    default: module.AddReviewForm,
  })),
);

const PlaceDetailPage = () => {
  const { t, formatNumber } = useI18n();
  const { id } = useParams();

  const {
    place,
    loading,
    error,
    isFavorite,
    savingFavorite,
    isLiked,
    savingLike,
    notification,
    currentUserId,
    canOpenInMaps,
    reviews,
    reviewsPagination,
    loadingMoreReviews,
    socialReviews,
    reviewSummary,
    myReview,
    myReviewLoading,
    reviewsLoading,
    socialReviewsLoading,
    socialReviewsLoaded,
    summaryLoading,
    reviewsError,
    socialReviewsError,
    summaryError,
    submittingReview,
    deletingReview,
    reportingReview,
    reviewSubmitted,
    reviewActionError,
    toggleFavorite,
    toggleLike,
    isReviewReported,
    openInMaps,
    goBack,
    handleSubmitReview,
    handleDeleteMyReview,
    handleReportReview,
    loadMoreReviews,
    refreshPlaceData,
    retryReviewsLoad,
    retrySocialReviewsLoad,
    retrySummaryLoad,
    ensureSocialReviewsLoaded,
  } = usePlaceDetail(id);

  const [activeReviewTab, setActiveReviewTab] = useState<"website" | "social">(
    "website",
  );

  useEffect(() => {
    if (activeReviewTab !== "social") return;
    void ensureSocialReviewsLoaded();
  }, [activeReviewTab, ensureSocialReviewsLoaded]);

  useEffect(() => {
    if (socialReviewsLoaded) return;

    const timer = window.setTimeout(() => {
      void ensureSocialReviewsLoaded();
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [ensureSocialReviewsLoaded, socialReviewsLoaded]);

  const socialCountCompact = socialReviewsLoaded
    ? formatNumber(socialReviews.length)
    : "...";
  const socialCountVerbose = socialReviewsLoaded
    ? t("placeDetail.reviews.countLabel", {
        count: formatNumber(socialReviews.length),
      })
    : t("common.loading");

  const onDeleteMyReview = async () => {
    await handleDeleteMyReview();
  };

  const onLikeClick = async () => toggleLike();
  const onFavoriteClick = async () => toggleFavorite();

  if (loading) {
    return (
      <LoadingSpinner
        size="md"
        text={t("placeDetail.loading")}
        fullScreen={true}
      />
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <Alert variant="destructive" className="border-destructive/30">
            <AlertTitle>{t("placeDetail.error.openTitle")}</AlertTitle>
            <AlertDescription className="break-words">
              {error || t("placeDetail.error.notFound")}
            </AlertDescription>
          </Alert>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full"
            onClick={() => void refreshPlaceData()}
          >
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  const notificationToneClass =
    notification.type === "like"
      ? "border-primary/30 bg-primary text-primary-foreground"
      : notification.type === "report"
        ? "border-destructive/30 bg-destructive text-destructive-foreground"
        : "border-secondary/30 bg-secondary text-secondary-foreground";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 pb-[calc(6.25rem+env(safe-area-inset-bottom))] sm:pb-10">
      {notification.show && (
        <div
          className="fixed top-6 left-1/2 z-50 -translate-x-1/2 px-4"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <Card
            className={cn(
              "animate-in fade-in slide-in-from-top-2 duration-500 max-w-[min(92vw,32rem)] px-4 py-3 rounded-2xl border shadow-xl",
              notificationToneClass,
            )}
          >
            <div className="flex items-center gap-3">
              {notification.type === "like" ? (
                <ThumbsUp className="h-5 w-5 fill-current" />
              ) : notification.type === "report" ? (
                <Flag className="h-5 w-5 fill-current" />
              ) : (
                <Heart className="h-5 w-5 fill-current" />
              )}
              <span className="pd-type-label font-semibold break-words">
                {notification.type === "like"
                  ? notification.action === "added"
                    ? t("placeDetail.notice.placeLiked")
                    : t("placeDetail.notice.likeRemoved")
                  : notification.type === "report"
                    ? t("placeDetail.notice.reportSubmitted")
                    : notification.action === "added"
                      ? t("placeDetail.notice.addedToFavorites")
                      : t("placeDetail.notice.removedFromFavorites")}
              </span>
            </div>
          </Card>
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden rounded-3xl border-border/60 shadow-xl">
          <div className="relative h-[clamp(15rem,48vw,24rem)]">
            <img
              src={place.image}
              alt={place.name}
              className="h-full w-full object-cover"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={(event) => {
                event.currentTarget.src = getDefaultVenueImageDataUrl(
                  place.name,
                );
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/35 to-black/10" />

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t("placeDetail.action.goBack")}
              onClick={goBack}
              className="absolute left-4 top-4 h-11 w-11 rounded-full border-border/60 bg-card/90 text-foreground backdrop-blur-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="absolute right-4 top-4 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onLikeClick}
                disabled={savingLike}
                aria-label={
                  isLiked
                    ? t("placeDetail.action.unlike")
                    : t("placeDetail.action.like")
                }
                aria-pressed={isLiked}
                className="h-11 w-11 rounded-full border-border/60 bg-card/90 backdrop-blur-sm"
                title={
                  isLiked
                    ? t("placeDetail.action.unlike")
                    : t("placeDetail.action.like")
                }
              >
                <ThumbsUp
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isLiked ? "text-primary fill-primary" : "text-foreground",
                  )}
                />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onFavoriteClick}
                disabled={savingFavorite}
                aria-label={
                  isFavorite
                    ? t("home.place.removeFavorite")
                    : t("home.place.addFavorite")
                }
                aria-pressed={isFavorite}
                className="h-11 w-11 rounded-full border-border/60 bg-card/90 backdrop-blur-sm"
                title={
                  isFavorite
                    ? t("home.place.removeFavorite")
                    : t("home.place.addFavorite")
                }
              >
                <Heart
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isFavorite
                      ? "text-secondary fill-secondary"
                      : "text-foreground",
                  )}
                />
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6 space-y-5">
          <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm sm:p-5">
            <div className="space-y-4">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
                <h1
                  className="text-role-heading text-foreground break-words min-w-0"
                  dir="auto"
                >
                  {place.name}
                </h1>
                <Badge
                  variant="outline"
                  className="gap-1 border-secondary/40 text-secondary shrink-0 pd-type-number"
                >
                  <Star className="h-3 w-3 fill-secondary text-secondary" />
                  {place.rating}
                </Badge>
              </div>

              <div className="flex items-center gap-2 pd-type-label text-muted-foreground min-w-0">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="break-words" dir="auto">
                  {place.address}
                </span>
              </div>

              {(place.district || place.type || place.category) && (
                <div className="flex items-center gap-2 flex-wrap pd-type-micro text-muted-foreground">
                  {place.category && (
                    <Badge
                      variant="outline"
                      className="font-semibold border-border/80"
                    >
                      {place.category}
                    </Badge>
                  )}
                  {place.type && (
                    <Badge
                      variant="outline"
                      className="font-semibold border-border/80"
                    >
                      {place.type}
                    </Badge>
                  )}
                  {place.district && <span>{place.district}</span>}
                </div>
              )}

              <div className="flex items-center gap-3 flex-wrap text-role-secondary text-muted-foreground">
                {place.priceLevel && (
                  <span className="inline-flex items-center gap-1 font-semibold text-secondary">
                    <span>{PRICE_LEVEL_META[place.priceLevel].label}</span>
                    <span className="pd-type-micro text-secondary/90">
                      {PRICE_LEVEL_META[place.priceLevel].symbol}
                    </span>
                    {place.priceRange && (
                      <span className="text-muted-foreground font-normal ml-1">
                        · {place.priceRange}
                      </span>
                    )}
                  </span>
                )}
                {place.hours && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {place.hours}
                  </span>
                )}
                {place.isOpen !== undefined && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-semibold",
                      place.isOpen
                        ? "border-secondary/40 bg-secondary/10 text-secondary"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {place.isOpen
                      ? t("placeDetail.status.openNow")
                      : t("home.place.closed")}
                  </Badge>
                )}
              </div>

              {(place.atmosphereTags ?? []).length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {place.atmosphereTags!.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="pd-type-micro border-border/80 bg-muted/50 text-muted-foreground"
                      dir="auto"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {(place.socialBadges ?? []).length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {place.socialBadges!.map((item) => (
                    <Badge
                      key={item}
                      variant="outline"
                      className="gap-1 border-primary/30 bg-primary/10 text-primary"
                    >
                      <Users className="h-3 w-3" />
                      {item}
                    </Badge>
                  ))}
                  {place.accessibilityScore !== undefined &&
                    place.accessibilityScore >= 0.7 && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-secondary/30 bg-secondary/10 text-secondary"
                      >
                        <Accessibility className="h-3 w-3" />
                        {t("placeDetail.badge.accessible")}
                      </Badge>
                    )}
                </div>
              )}
            </div>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm space-y-2 sm:p-5 lg:col-span-2">
              <h2 className="pd-type-kicker text-foreground">
                {t("placeDetail.about")}
              </h2>
              <p className="pd-type-body pd-measure text-muted-foreground break-words">
                {place.description}
              </p>
            </Card>

            {(place.phone || place.website || place.bookingUrl) && (
              <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm space-y-3 sm:p-5">
                <h2 className="pd-type-kicker text-foreground">
                  {t("placeDetail.contact")}
                </h2>
                <div className="flex flex-col gap-2.5">
                  {place.phone && (
                    <a
                      href={`tel:${place.phone}`}
                      className="inline-flex min-h-11 items-center gap-2 pd-type-label pd-focus-ring text-muted-foreground hover:text-foreground transition-colors break-all"
                    >
                      <Phone className="h-4 w-4 text-secondary shrink-0" />
                      {place.phone}
                    </a>
                  )}
                  {place.website && (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 pd-type-label pd-focus-ring text-secondary hover:underline break-all"
                    >
                      <Globe className="h-4 w-4 shrink-0" />
                      {t("placeDetail.contact.visitWebsite")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {place.bookingUrl && (
                    <a
                      href={place.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 pd-type-label pd-focus-ring text-secondary hover:underline"
                    >
                      <CalendarCheck className="h-4 w-4 shrink-0" />
                      {t("placeDetail.contact.bookTable")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </Card>
            )}

            {(place.menuUrl || (place.menuImagesCount ?? 0) > 0) && (
              <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm flex flex-col gap-3 sm:p-5">
                <div className="flex items-center gap-3 min-w-0">
                  <UtensilsCrossed className="h-5 w-5 text-secondary shrink-0" />
                  <div>
                    <p className="pd-type-label text-foreground">
                      {t("placeDetail.menu")}
                    </p>
                    {(place.menuImagesCount ?? 0) > 0 && (
                      <p className="pd-type-micro pd-type-number text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                        <Images className="h-3 w-3" />
                        {formatCountLabel(
                          place.menuImagesCount ?? 0,
                          t("placeDetail.menuPhotoSingular"),
                          t("placeDetail.menuPhotoPlural"),
                        )}{" "}
                        {t("placeDetail.available")}
                      </p>
                    )}
                  </div>
                </div>
                {place.menuUrl && (
                  <Button
                    asChild
                    variant="secondary"
                    className="min-h-11 w-full sm:w-auto sm:self-start"
                  >
                    <a
                      href={place.menuUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("placeDetail.menu.view")}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </Card>
            )}

            {(place.hasWifi ||
              place.hasToilet ||
              place.seatingType ||
              place.parkingAvailable) && (
              <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm space-y-3 sm:p-5 lg:col-span-2">
                <h2 className="pd-type-kicker text-foreground">
                  {t("placeDetail.facilities")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {place.hasWifi && (
                    <Badge
                      variant="outline"
                      className="gap-1.5 border-primary/30 bg-primary/10 text-primary"
                    >
                      <Wifi className="h-3.5 w-3.5" />
                      {t("placeDetail.facilities.wifi")}
                    </Badge>
                  )}
                  {place.hasToilet && (
                    <Badge
                      variant="outline"
                      className="gap-1.5 border-secondary/30 bg-secondary/10 text-secondary"
                    >
                      <Toilet className="h-3.5 w-3.5" />
                      {t("placeDetail.facilities.restrooms")}
                    </Badge>
                  )}
                  {place.parkingAvailable && (
                    <Badge
                      variant="outline"
                      className="gap-1.5 border-border text-foreground"
                    >
                      <ParkingSquare className="h-3.5 w-3.5" />
                      {t("placeDetail.facilities.parking")}
                    </Badge>
                  )}
                  {(place.seatingType ?? []).map((seat) => (
                    <Badge
                      key={seat}
                      variant="outline"
                      className="border-border bg-muted/60 text-muted-foreground capitalize"
                    >
                      {`${seat} ${t("placeDetail.facilities.seatingSuffix")}`}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {summaryError && !summaryLoading && (
            <Alert variant="destructive" className="border-destructive/30">
              <AlertTitle>{t("placeDetail.summary.error")}</AlertTitle>
              <AlertDescription className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <span className="break-words">{summaryError}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void retrySummaryLoad()}
                >
                  {t("common.retry")}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Suspense
            fallback={
              <Card className="rounded-2xl border-border/70 bg-card/95 p-5 space-y-3 animate-pulse">
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </Card>
            }
          >
            <ReviewSummarySectionLazy
              summary={reviewSummary}
              loading={summaryLoading}
            />
          </Suspense>

          <Card className="rounded-2xl border-border/70 bg-card/95 p-5 shadow-sm space-y-4">
            <h2 className="pd-type-kicker text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-secondary" />
              {t("placeDetail.reviews.title")}
            </h2>

            <Tabs
              value={activeReviewTab}
              onValueChange={(value) =>
                setActiveReviewTab(value as "website" | "social")
              }
              className="w-full"
            >
              <TabsList className="w-full bg-muted/60 grid grid-cols-2 h-auto p-1">
                <TabsTrigger
                  value="website"
                  className="min-h-11 gap-1 px-2 pd-type-micro sm:gap-1.5 sm:px-3"
                >
                  <Star className="h-3.5 w-3.5" />
                  <span className="sm:hidden whitespace-nowrap pd-type-number">
                    {t("placeDetail.reviews.usersShort", {
                      count: formatNumber(reviews.length),
                    })}
                  </span>
                  <span className="hidden sm:inline whitespace-nowrap pd-type-number">
                    {t("placeDetail.reviews.usersLong", {
                      count: formatNumber(reviews.length),
                    })}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="social"
                  className="min-h-11 gap-1 px-2 pd-type-micro sm:gap-1.5 sm:px-3"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span className="sm:hidden whitespace-nowrap pd-type-number">
                    {t("placeDetail.reviews.socialShort", {
                      count: socialCountCompact,
                    })}
                  </span>
                  <span className="hidden sm:inline whitespace-nowrap pd-type-number">
                    {t("placeDetail.reviews.socialLong", {
                      count: socialCountVerbose,
                    })}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="website" className="space-y-4 mt-4">
                {myReviewLoading ? (
                  <p className="pd-type-micro text-muted-foreground">
                    {t("placeDetail.reviews.loadingYourReview")}
                  </p>
                ) : myReview ? (
                  <Alert className="border-secondary/30 bg-secondary/10 text-secondary">
                    <AlertDescription className="pd-type-label">
                      {t("placeDetail.reviews.alreadyReviewed")}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <Suspense
                  fallback={
                    <Card className="rounded-2xl border-border/70 bg-card/95 p-5 space-y-3 animate-pulse">
                      <div className="h-5 bg-muted rounded w-1/3" />
                      <div className="h-11 bg-muted rounded" />
                      <div className="h-20 bg-muted rounded" />
                    </Card>
                  }
                >
                  <AddReviewFormLazy
                    key={`${myReview?.reviewId ?? "create"}-${myReview?.createdAt ?? "none"}-${myReview ? "edit" : "create"}`}
                    onSubmit={handleSubmitReview}
                    submitting={submittingReview}
                    submitted={reviewSubmitted}
                    mode={myReview ? "edit" : "create"}
                    initialRating={myReview?.rating ?? 0}
                    initialComment={myReview?.comment ?? ""}
                    onDelete={myReview ? onDeleteMyReview : undefined}
                    deleting={deletingReview || reportingReview}
                    errorMessage={reviewActionError}
                  />
                </Suspense>

                {reviewsLoading ? (
                  <ReviewSkeleton />
                ) : reviewsError ? (
                  <Alert
                    variant="destructive"
                    className="border-destructive/30"
                  >
                    <AlertTitle>
                      {t("placeDetail.reviews.userError")}
                    </AlertTitle>
                    <AlertDescription className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <span className="break-words">{reviewsError}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void retryReviewsLoad()}
                      >
                        {t("common.retry")}
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="pd-type-body text-muted-foreground">
                      {t("placeDetail.reviews.empty")}
                    </p>
                  </div>
                ) : (
                  <div
                    className="space-y-3"
                    style={{ contentVisibility: "auto" }}
                  >
                    <Suspense fallback={<ReviewSkeleton />}>
                      {reviews.map((review) => (
                        <ReviewCardLazy
                          key={getReviewIdentity(review)}
                          review={review}
                          alreadyReported={isReviewReported(
                            review.reviewId ?? getReviewIdentity(review),
                          )}
                          onReport={
                            currentUserId && review.userId === currentUserId
                              ? undefined
                              : handleReportReview
                          }
                        />
                      ))}
                    </Suspense>

                    {reviewsPagination.hasNextPage && (
                      <Button
                        variant="outline"
                        onClick={loadMoreReviews}
                        disabled={loadingMoreReviews}
                        className="w-full min-h-11"
                      >
                        {loadingMoreReviews
                          ? t("placeDetail.reviews.loadingMore")
                          : t("placeDetail.reviews.loadMore", {
                              shown: formatNumber(reviews.length),
                              total: formatNumber(reviewsPagination.totalCount),
                            })}
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="social" className="space-y-4 mt-4">
                <Alert className="border-border/70 bg-muted/40">
                  <AlertDescription className="pd-type-label text-muted-foreground flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    <span>{t("placeDetail.reviews.socialDescription")}</span>
                  </AlertDescription>
                </Alert>

                {socialReviewsLoading ? (
                  <ReviewSkeleton />
                ) : socialReviewsError ? (
                  <Alert
                    variant="destructive"
                    className="border-destructive/30"
                  >
                    <AlertTitle>
                      {t("placeDetail.reviews.socialError")}
                    </AlertTitle>
                    <AlertDescription className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <span className="break-words">{socialReviewsError}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void retrySocialReviewsLoad()}
                      >
                        {t("common.retry")}
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : socialReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Globe className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="pd-type-body text-muted-foreground">
                      {t("placeDetail.reviews.socialEmpty")}
                    </p>
                  </div>
                ) : (
                  <div
                    className="space-y-3"
                    style={{ contentVisibility: "auto" }}
                  >
                    <Suspense fallback={<ReviewSkeleton />}>
                      {socialReviews.map((review) => (
                        <SocialReviewCardLazy key={review.id} review={review} />
                      ))}
                    </Suspense>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          <Button
            className="hidden sm:inline-flex min-h-12 font-semibold gap-2 sm:w-auto sm:min-w-[260px]"
            onClick={openInMaps}
            disabled={!canOpenInMaps}
          >
            <ExternalLink className="h-4 w-4" />
            {t("placeDetail.action.openMaps")}
          </Button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:hidden">
        <div className="mx-auto w-full max-w-6xl px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <Button
            className="w-full min-h-12 font-semibold gap-2"
            onClick={openInMaps}
            disabled={!canOpenInMaps}
          >
            <ExternalLink className="h-4 w-4" />
            {t("placeDetail.action.openMaps")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailPage;
