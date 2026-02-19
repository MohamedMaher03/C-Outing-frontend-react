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
  Send,
  ThumbsUp,
  Sparkles,
  TrendingUp,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import { usePlaceDetail } from "../hooks/usePlaceDetail";
import type {
  Review,
  SocialMediaReview,
  ReviewSummary,
} from "../services/api/placeDetailService";

// ============ Sub-Components ============

/** Star rating input for the review form */
const StarRatingInput = ({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (r: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              star <= (hovered || rating)
                ? "text-secondary fill-secondary"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm text-muted-foreground font-medium">
          {rating}/5
        </span>
      )}
    </div>
  );
};

/** A single user review card */
const ReviewCard = ({ review }: { review: Review }) => (
  <div className="border border-border rounded-xl p-4 space-y-2 bg-card">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
          {review.userName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {review.userName}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(review.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < review.rating
                ? "text-secondary fill-secondary"
                : "text-muted-foreground/20"
            }`}
          />
        ))}
      </div>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">
      {review.comment}
    </p>
  </div>
);

/** Platform icon for social reviews */
const PlatformIcon = ({ platform }: { platform: string }) => {
  const iconClass = "h-4 w-4";
  switch (platform) {
    case "instagram":
      return <Instagram className={`${iconClass} text-pink-500`} />;
    case "twitter":
      return <Twitter className={`${iconClass} text-sky-500`} />;
    case "facebook":
      return <Facebook className={`${iconClass} text-blue-600`} />;
    case "tiktok":
      return (
        <svg
          className={`${iconClass} text-foreground`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.63a8.28 8.28 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.04z" />
        </svg>
      );
    case "google":
      return <Globe className={`${iconClass} text-emerald-500`} />;
    default:
      return <Globe className={iconClass} />;
  }
};

/** Sentiment badge */
const SentimentBadge = ({
  sentiment,
}: {
  sentiment: "positive" | "neutral" | "negative";
}) => {
  const config = {
    positive:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    neutral:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    negative: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${config[sentiment]}`}
    >
      {sentiment}
    </span>
  );
};

/** A single social media review card */
const SocialReviewCard = ({ review }: { review: SocialMediaReview }) => (
  <div className="border border-border rounded-xl p-4 space-y-2 bg-card">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <PlatformIcon platform={review.platform} />
        <span className="text-sm font-semibold text-foreground">
          {review.author}
        </span>
        <SentimentBadge sentiment={review.sentiment} />
      </div>
      <span className="text-xs text-muted-foreground">
        {new Date(review.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">
      {review.content}
    </p>
    {review.likes !== undefined && (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <ThumbsUp className="h-3 w-3" />
        <span>{review.likes.toLocaleString()}</span>
      </div>
    )}
  </div>
);

/** NLP-generated Review Summary section */
const ReviewSummarySection = ({
  summary,
  loading,
}: {
  summary: ReviewSummary | null;
  loading: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-5 space-y-3 animate-pulse">
        <div className="h-5 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
      </div>
    );
  }

  if (!summary) return null;

  const sentimentColor = {
    positive: "text-emerald-600 dark:text-emerald-400",
    neutral: "text-amber-600 dark:text-amber-400",
    negative: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-secondary flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" />
          AI Review Summary
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium ${sentimentColor[summary.overallSentiment]}`}
          >
            {summary.overallSentiment.charAt(0).toUpperCase() +
              summary.overallSentiment.slice(1)}
          </span>
          <Badge className="bg-secondary/10 text-secondary border-secondary/30 gap-0.5 text-xs">
            <Star className="h-3 w-3 fill-secondary" />
            {summary.averageRating}
          </Badge>
          <span className="text-xs text-muted-foreground">
            ({summary.totalReviews} reviews)
          </span>
        </div>
      </div>

      {/* Summary text */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {summary.summary}
      </p>

      {/* Highlights */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Key Highlights
        </p>
        <div className="flex flex-wrap gap-2">
          {summary.highlights.map((highlight, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-medium"
            >
              <CheckCircle2 className="h-3 w-3" />
              {highlight}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable topics */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs font-medium text-secondary hover:text-secondary/80 transition-colors"
      >
        <TrendingUp className="h-3.5 w-3.5" />
        {expanded ? "Hide" : "Show"} Common Topics
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {expanded && (
        <div className="space-y-2 pt-1">
          {summary.commonTopics.map((topic, i) => {
            const barWidth = Math.max(
              (topic.count /
                Math.max(...summary.commonTopics.map((t) => t.count))) *
                100,
              8,
            );
            const barColor = {
              positive: "bg-emerald-500/70",
              neutral: "bg-amber-500/70",
              negative: "bg-red-500/70",
            };
            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">
                    {topic.topic}
                  </span>
                  <span className="text-muted-foreground">
                    {topic.count} mentions
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor[topic.sentiment]}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/** Review form */
const AddReviewForm = ({
  onSubmit,
  submitting,
  submitted,
}: {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  submitting: boolean;
  submitted: boolean;
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = async () => {
    setFormError("");
    if (rating === 0) {
      setFormError("Please select a rating");
      return;
    }
    if (comment.trim().length < 3) {
      setFormError("Please write at least a few words");
      return;
    }
    try {
      await onSubmit(rating, comment.trim());
      setRating(0);
      setComment("");
    } catch {
      setFormError("Failed to submit review. Please try again.");
    }
  };

  return (
    <div className="border border-border rounded-xl p-5 space-y-4 bg-card">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-secondary" />
        Write a Review
      </h3>

      {submitted && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4" />
          Your review has been submitted successfully!
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Your Rating
        </label>
        <StarRatingInput rating={rating} onRate={setRating} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Your Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience about this place..."
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
        />
      </div>

      {formError && <p className="text-xs text-destructive">{formError}</p>}

      <Button
        onClick={handleSubmit}
        disabled={submitting || rating === 0}
        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold h-10 gap-2 disabled:opacity-50"
      >
        {submitting ? (
          <>
            <div className="h-4 w-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit Review
          </>
        )}
      </Button>
    </div>
  );
};

/** Loading skeleton for review cards */
const ReviewSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="border border-border rounded-xl p-4 space-y-3 animate-pulse"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
        </div>
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-4/5" />
      </div>
    ))}
  </div>
);

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
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-secondary/30 border-t-secondary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">
            Loading place details...
          </p>
        </div>
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
