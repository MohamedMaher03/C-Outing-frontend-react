import { memo } from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/components/i18n";
import type { ReportPayload, Review } from "../types";
import { getDefaultAvatarDataUrl } from "../utils/defaultImages";
import { ReportReviewDialog } from "./ReportReviewDialog";

interface ReviewCardProps {
  review: Review;
  alreadyReported?: boolean;
  onReport?: (payload: ReportPayload) => Promise<void> | void;
}

const ReviewCardComponent = ({
  review,
  alreadyReported = false,
  onReport,
}: ReviewCardProps) => {
  const { locale } = useI18n();
  const avatarSrc =
    review.userAvatar ?? getDefaultAvatarDataUrl(review.userName);

  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(review.createdAt));

  return (
    <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/users/${review.userId}`}
            className="h-9 w-9 rounded-full overflow-hidden bg-accent/15 flex items-center justify-center text-sm font-semibold text-accent hover:bg-accent/20 transition-colors flex-shrink-0 pd-focus-ring"
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
              className="pd-type-label pd-focus-ring text-foreground hover:text-accent transition-colors break-words line-clamp-1 font-semibold"
              onClick={(e) => e.stopPropagation()}
              dir="auto"
            >
              {review.userName}
            </Link>
            <p className="pd-type-micro pd-type-number text-muted-foreground/85">
              {formattedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < review.rating
                    ? "text-accent fill-accent"
                    : "text-muted-foreground/20"
                }`}
              />
            ))}
          </div>

          {onReport && review.id && (
            <ReportReviewDialog
              reviewId={review.id}
              reviewAuthor={review.userName}
              alreadyReported={alreadyReported}
              onReport={onReport}
            />
          )}
        </div>
      </div>
      <div className="mt-3 border-t border-border/60 pt-3">
        <p
          className="pd-type-body pd-measure text-foreground break-words whitespace-pre-wrap leading-7 rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5"
          dir="auto"
        >
          {review.comment}
        </p>
      </div>
    </Card>
  );
};

export const ReviewCard = memo(ReviewCardComponent);
ReviewCard.displayName = "ReviewCard";
