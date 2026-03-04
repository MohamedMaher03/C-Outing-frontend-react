import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Review } from "../types";
import { ReportReviewDialog, type ReportPayload } from "./ReportReviewDialog";

interface ReviewCardProps {
  review: Review;
  alreadyReported?: boolean;
  onReport?: (payload: ReportPayload) => Promise<void> | void;
}

/** A single user review card */
export const ReviewCard = ({
  review,
  alreadyReported = false,
  onReport,
}: ReviewCardProps) => (
  <div className="border border-border rounded-xl p-4 space-y-2 bg-card">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link
          to={`/users/${review.userId}`}
          className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary hover:bg-primary/20 transition-colors flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {review.userName.charAt(0)}
        </Link>
        <div>
          <Link
            to={`/users/${review.userId}`}
            className="text-sm font-semibold text-foreground hover:text-secondary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {review.userName}
          </Link>
          <p className="text-xs text-muted-foreground">
            {new Date(review.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
        {onReport && (
          <ReportReviewDialog
            reviewId={review.id}
            reviewAuthor={review.userName}
            alreadyReported={alreadyReported}
            onReport={onReport}
          />
        )}
      </div>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">
      {review.comment}
    </p>
  </div>
);
