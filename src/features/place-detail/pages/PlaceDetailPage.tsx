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
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePlaceDetail } from "@/features/place-detail/hooks/usePlaceDetail";
import { getReviewIdentity } from "@/features/place-detail/utils/reviewIdentity";
import { PRICE_SYMBOL } from "@/features/place-detail/utils/priceLevel";
import { getDefaultVenueImageDataUrl } from "@/features/place-detail/utils/defaultImages";
import { ReviewCard } from "@/features/place-detail/components/ReviewCard";
import { SocialReviewCard } from "@/features/place-detail/components/SocialReviewCard";
import { ReviewSummarySection } from "@/features/place-detail/components/ReviewSummarySection";
import { AddReviewForm } from "@/features/place-detail/components/AddReviewForm";
import { ReviewSkeleton } from "@/features/place-detail/components/ReviewSkeleton";

// ============ Main Page ============

const PlaceDetailPage = () => {
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
    reviews,
    reviewsPagination,
    loadingMoreReviews,
    socialReviews,
    reviewSummary,
    myReview,
    myReviewLoading,
    reviewsLoading,
    socialReviewsLoading,
    summaryLoading,
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
  } = usePlaceDetail(id);

  const onDeleteMyReview = async () => {
    await handleDeleteMyReview();
  };

  const onLikeClick = async () => toggleLike();
  const onFavoriteClick = async () => toggleFavorite();

  const currentUserId = (() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const candidate =
        (typeof parsed.userId === "string" && parsed.userId.trim()) ||
        (typeof parsed.id === "string" && parsed.id.trim()) ||
        null;

      return candidate && candidate.length > 0 ? candidate : null;
    } catch {
      return null;
    }
  })();

  if (loading) {
    return (
      <LoadingSpinner
        size="md"
        text="Loading place details..."
        fullScreen={true}
      />
    );
  }

  if (error || !place) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground">{error || "Place not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Hero */}
      <div className="relative h-64 sm:h-80">
        <img
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover"
          onError={(event) => {
            event.currentTarget.src = getDefaultVenueImageDataUrl(place.name);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <button
          onClick={goBack}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {/* Like Button */}
          <button
            onClick={onLikeClick}
            disabled={savingLike}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all hover:scale-110 disabled:opacity-50"
            title="Like this place"
          >
            <ThumbsUp
              className={`h-5 w-5 transition-colors ${
                isLiked ? "text-blue-500 fill-blue-500" : "text-foreground"
              }`}
            />
          </button>
          {/* Favorite Button */}
          <button
            onClick={onFavoriteClick}
            disabled={savingFavorite}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all hover:scale-110 disabled:opacity-50"
            title="Add to favorites"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isFavorite ? "text-secondary fill-secondary" : "text-foreground"
              }`}
            />
          </button>
        </div>

        {/* Match score overlay */}
        {/* {place.matchScore && (
          <div className="absolute bottom-4 right-4 bg-secondary/90 backdrop-blur-sm text-secondary-foreground px-3 py-1.5 rounded-full text-xs font-bold">
            {place.matchScore}% Match
          </div>
        )} */}

        {/* Notification Toast */}
        {notification.show && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div
              className={`animate-in fade-in slide-in-from-top-2 duration-500 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl backdrop-blur-md border ${
                notification.type === "like"
                  ? "bg-blue-500/90 text-white border-blue-400/50"
                  : notification.type === "report"
                    ? "bg-amber-500/90 text-white border-amber-400/50"
                    : "bg-secondary/90 text-secondary-foreground border-secondary/50"
              }`}
            >
              {notification.type === "like" ? (
                <ThumbsUp className="h-5 w-5 fill-current" />
              ) : notification.type === "report" ? (
                <Flag className="h-5 w-5 fill-current" />
              ) : (
                <Heart className="h-5 w-5 fill-current" />
              )}
              <span className="font-semibold text-sm whitespace-nowrap">
                {notification.type === "like"
                  ? notification.action === "added"
                    ? "You liked this place! 👍"
                    : "You unliked this place 👎"
                  : notification.type === "report"
                    ? "Report submitted — thank you! 🚩"
                    : notification.action === "added"
                      ? "Added to favorites! ❤️"
                      : "Removed from favorites 💔"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Title & Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">{place.name}</h1>
            <Badge className="bg-secondary/10 text-secondary border-secondary/30 gap-1 shrink-0">
              <Star className="h-3 w-3 fill-secondary text-secondary" />
              {place.rating}
            </Badge>
          </div>

          {/* Address row */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{place.address}</span>
          </div>

          {(place.district || place.type || place.category) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              {place.category && (
                <span className="px-2 py-0.5 rounded-full bg-muted font-medium">
                  {place.category}
                </span>
              )}
              {place.type && (
                <span className="px-2 py-0.5 rounded-full bg-muted font-medium">
                  {place.type}
                </span>
              )}
              {place.district && <span>{place.district}</span>}
            </div>
          )}

          {/* Price + hours */}
          <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
            {place.priceLevel && (
              <span className="font-semibold text-secondary">
                {PRICE_SYMBOL[place.priceLevel]}
                {place.priceRange && (
                  <span className="text-muted-foreground font-normal ml-1">
                    · {place.priceRange}
                  </span>
                )}
              </span>
            )}
            {place.hours && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {place.hours}
              </span>
            )}
            {place.isOpen !== undefined && (
              <span
                className={
                  place.isOpen
                    ? "text-emerald-600 font-semibold"
                    : "text-muted-foreground"
                }
              >
                {place.isOpen ? "Open Now" : "Closed"}
              </span>
            )}
          </div>

          {/* Atmosphere tags */}
          {(place.atmosphereTags ?? []).length > 0 && (
            <div className="flex gap-2 flex-wrap pt-1">
              {place.atmosphereTags!.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Social badges */}
          {(place.socialBadges ?? []).length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {place.socialBadges!.map((badge) => (
                <span
                  key={badge}
                  className="text-xs px-2.5 py-1 rounded-full bg-primary/8 text-primary border border-primary/20 font-medium flex items-center gap-1"
                >
                  <Users className="h-3 w-3" />
                  {badge}
                </span>
              ))}
              {place.accessibilityScore !== undefined &&
                place.accessibilityScore >= 0.7 && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-medium flex items-center gap-1">
                    <Accessibility className="h-3 w-3" />
                    Accessible
                  </span>
                )}
            </div>
          )}
        </div>

        {/* About */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            About
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {place.description}
          </p>
        </div>

        {/* Contact & Links */}
        {(place.phone || place.website || place.bookingUrl) && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Contact
            </h2>
            <div className="flex flex-col gap-2">
              {place.phone && (
                <a
                  href={`tel:${place.phone}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-4 w-4 text-secondary flex-shrink-0" />
                  {place.phone}
                </a>
              )}
              {place.website && (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-secondary hover:underline"
                >
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  Visit Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {place.bookingUrl && (
                <a
                  href={place.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-secondary hover:underline"
                >
                  <CalendarCheck className="h-4 w-4 flex-shrink-0" />
                  Book a Table
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Menu */}
        {(place.menuUrl || (place.menuImagesCount ?? 0) > 0) && (
          <div className="bg-muted/40 border border-border/50 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="h-5 w-5 text-secondary flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Menu</p>
                {(place.menuImagesCount ?? 0) > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Images className="h-3 w-3" />
                    {place.menuImagesCount} menu photo
                    {place.menuImagesCount! > 1 ? "s" : ""} available
                  </p>
                )}
              </div>
            </div>
            {place.menuUrl && (
              <a
                href={place.menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-primary text-xs font-semibold rounded-lg hover:bg-secondary/90 transition-colors flex-shrink-0"
              >
                View Menu
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {/* Facilities */}
        {(place.hasWifi ||
          place.hasToilet ||
          place.seatingType ||
          place.parkingAvailable) && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Facilities
            </h2>
            <div className="flex flex-wrap gap-2">
              {place.hasWifi && (
                <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  <Wifi className="h-3.5 w-3.5" />
                  Free Wi-Fi
                </span>
              )}
              {place.hasToilet && (
                <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
                  <Toilet className="h-3.5 w-3.5" />
                  Restrooms
                </span>
              )}
              {place.parkingAvailable && (
                <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                  <ParkingSquare className="h-3.5 w-3.5" />
                  Parking
                </span>
              )}
              {(place.seatingType ?? []).map((s) => (
                <span
                  key={s}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border font-medium capitalize"
                >
                  {s} seating
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Review Summary */}
        <ReviewSummarySection
          summary={reviewSummary}
          loading={summaryLoading}
        />

        {/* Reviews Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-secondary" />
            Reviews
          </h2>

          <Tabs defaultValue="website" className="w-full">
            <TabsList className="w-full bg-muted/60">
              <TabsTrigger
                value="website"
                className="flex-1 gap-1.5 text-xs sm:text-sm"
              >
                <Star className="h-3.5 w-3.5" />
                User Reviews ({reviews.length})
              </TabsTrigger>
              <TabsTrigger
                value="social"
                className="flex-1 gap-1.5 text-xs sm:text-sm"
              >
                <Globe className="h-3.5 w-3.5" />
                Social Media ({socialReviews.length})
              </TabsTrigger>
            </TabsList>

            {/* Website User Reviews */}
            <TabsContent value="website" className="space-y-4 mt-4">
              {/* Add Review Form */}
              {myReviewLoading ? (
                <div className="text-xs text-muted-foreground">
                  Loading your review...
                </div>
              ) : myReview ? (
                <div className="text-xs rounded-lg border border-secondary/30 bg-secondary/10 text-secondary px-3 py-2">
                  You already reviewed this place. Updating the form will edit
                  your existing review.
                </div>
              ) : null}

              <AddReviewForm
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

              {/* Reviews list */}
              {reviewsLoading ? (
                <ReviewSkeleton />
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No reviews yet. Be the first!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <ReviewCard
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

                  {reviewsPagination.hasNextPage && (
                    <Button
                      variant="outline"
                      onClick={loadMoreReviews}
                      disabled={loadingMoreReviews}
                      className="w-full"
                    >
                      {loadingMoreReviews
                        ? "Loading more..."
                        : `Load More Reviews (${reviews.length}/${reviewsPagination.totalCount})`}
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Social Media Reviews */}
            <TabsContent value="social" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span>Reviews collected from social media platforms.</span>
              </div>

              {socialReviewsLoading ? (
                <ReviewSkeleton />
              ) : socialReviews.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No social media reviews found for this place yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {socialReviews.map((review) => (
                    <SocialReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Open in Maps */}
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-navy-light font-semibold h-12 gap-2"
          onClick={openInMaps}
        >
          <ExternalLink className="h-4 w-4" /> Open in Google Maps
        </Button>
      </div>
    </div>
  );
};

export default PlaceDetailPage;
