import { Star } from "lucide-react";
import type { Review } from "../types";

/** A single user review card */
export const ReviewCard = ({ review }: { review: Review }) => (
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
