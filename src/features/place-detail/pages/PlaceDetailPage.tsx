import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  ExternalLink,
  Heart,
  DollarSign,
  MessageSquare,
  ThumbsUp,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePlaceDetail } from "@/features/place-detail/hooks/usePlaceDetail";
import { ReviewCard } from "@/features/place-detail/components/ReviewCard";
import { SocialReviewCard } from "@/features/place-detail/components/SocialReviewCard";
import { ReviewSummarySection } from "@/features/place-detail/components/ReviewSummarySection";
import { AddReviewForm } from "@/features/place-detail/components/AddReviewForm";
import { ReviewSkeleton } from "@/features/place-detail/components/ReviewSkeleton";

// ============ Main Page ============

const PlaceDetailPage = () => {
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [savingLike, setSavingLike] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "like" | "favorite" | null;
    action: "added" | "removed";
  }>({ show: false, type: null, action: "added" });

  const {
    place,
    loading,
    error,
    isFavorite,
    savingFavorite,
    reviews,
    socialReviews,
    reviewSummary,
    reviewsLoading,
    socialReviewsLoading,
    summaryLoading,
    submittingReview,
    reviewSubmitted,
    toggleFavorite,
    openInMaps,
    goBack,
    handleSubmitReview,
  } = usePlaceDetail(id);

  const showNotification = (
    type: "like" | "favorite",
    action: "added" | "removed",
  ) => {
    setNotification({ show: true, type, action });
    setTimeout(() => {
      setNotification({ show: false, type: null, action: "added" });
    }, 2500);
  };

  const handleLikeClick = async () => {
    try {
      setSavingLike(true);
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      showNotification("like", newLikedState ? "added" : "removed");
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err) {
      console.error("Error toggling like:", err);
      setIsLiked(!isLiked);
    } finally {
      setSavingLike(false);
    }
  };

  const handleFavoriteClick = async () => {
    try {
      await toggleFavorite();
      showNotification("favorite", !isFavorite ? "added" : "removed");
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="md" text="Loading place details..." />
      </div>
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
            onClick={handleLikeClick}
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
            onClick={handleFavoriteClick}
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
        {place.matchScore && (
          <div className="absolute bottom-4 right-4 bg-secondary/90 backdrop-blur-sm text-secondary-foreground px-3 py-1.5 rounded-full text-xs font-bold">
            {place.matchScore}% Match
          </div>
        )}

        {/* Notification Toast */}
        {notification.show && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div
              className={`animate-in fade-in slide-in-from-top-2 duration-500 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl backdrop-blur-md border ${
                notification.type === "like"
                  ? "bg-blue-500/90 text-white border-blue-400/50"
                  : "bg-secondary/90 text-secondary-foreground border-secondary/50"
              }`}
            >
              {notification.type === "like" ? (
                <ThumbsUp className="h-5 w-5 fill-current" />
              ) : (
                <Heart className="h-5 w-5 fill-current" />
              )}
              <span className="font-semibold text-sm whitespace-nowrap">
                {notification.type === "like"
                  ? notification.action === "added"
                    ? "You liked this place! 👍"
                    : "You unliked this place 👎"
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {place.district} · {place.distance}
            </span>
            <span className="flex items-center gap-0.5 ml-2">
              {Array.from({ length: place.priceLevel }).map((_, i) => (
                <DollarSign key={i} className="h-3 w-3 text-secondary" />
              ))}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
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

        {/* Why We Recommend */}
        <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 space-y-1">
          <h2 className="text-sm font-semibold text-secondary flex items-center gap-1.5">
            ✦ Why We Recommend This
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {place.whyRecommend}
          </p>
        </div>

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
              <AddReviewForm
                onSubmit={handleSubmitReview}
                submitting={submittingReview}
                submitted={reviewSubmitted}
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
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Social Media Reviews */}
            <TabsContent value="social" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Reviews collected from social media platforms including
                  Instagram, Twitter, Facebook, TikTok, and Google.
                </span>
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
