import { memo } from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import type { ReportPayload, Review } from "../types";
import { getDefaultAvatarDataUrl } from "../utils/defaultImages";
import { formatShortDate } from "../utils/formatters";
import { ReportReviewDialog } from "./ReportReviewDialog";

interface ReviewCardProps {
  review: Review;
  alreadyReported?: boolean;
  onReport?: (payload: ReportPayload) => Promise<void> | void;
}

/** A single user review card */
const ReviewCardComponent = ({
  review,
  alreadyReported = false,
  onReport,
}: ReviewCardProps) => {
  const avatarSrc =
    review.userAvatar ?? getDefaultAvatarDataUrl(review.userName);

  return (
    <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/users/${review.userId}`}
            className="h-9 w-9 rounded-full overflow-hidden bg-secondary/15 flex items-center justify-center text-sm font-semibold text-secondary hover:bg-secondary/20 transition-colors flex-shrink-0 pd-focus-ring"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={avatarSrc}
              alt={review.userName}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.src = getDefaultAvatarDataUrl(
                  review.userName,
                );
              }}
            />
          </Link>
          <div className="min-w-0">
            <Link
              to={`/users/${review.userId}`}
              className="pd-type-label pd-focus-ring text-foreground hover:text-secondary transition-colors break-words line-clamp-1"
              onClick={(e) => e.stopPropagation()}
              dir="auto"
            >
              {review.userName}
            </Link>
            <p className="pd-type-micro pd-type-number text-muted-foreground">
              {formatShortDate(review.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Star rating */}
          <div className="flex items-center gap-0.5">
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

          {/* Report button — only rendered when handler is provided */}
          {onReport && review.reviewId && (
            <ReportReviewDialog
              reviewId={review.reviewId}
              reviewAuthor={review.userName}
              alreadyReported={alreadyReported}
              onReport={onReport}
            />
          )}
        </div>
      </div>
      <p
        className="pd-type-body pd-measure text-muted-foreground break-words whitespace-pre-wrap"
        dir="auto"
      >
        {review.comment}
      </p>
    </Card>
  );
};

export const ReviewCard = memo(ReviewCardComponent);
ReviewCard.displayName = "ReviewCard";
