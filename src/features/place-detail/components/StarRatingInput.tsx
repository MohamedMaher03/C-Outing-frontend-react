import { useState, type KeyboardEvent } from "react";
import { Star } from "lucide-react";

interface StarRatingInputProps {
  rating: number;
  onRate: (r: number) => void;
  ariaLabelledBy?: string;
  hasError?: boolean;
  disabled?: boolean;
}

/** Interactive star rating input for the review form */
export const StarRatingInput = ({
  rating,
  onRate,
  ariaLabelledBy,
  hasError = false,
  disabled = false,
}: StarRatingInputProps) => {
  const [hovered, setHovered] = useState(0);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    star: number,
  ) => {
    if (disabled) return;

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onRate(Math.min(5, star + 1));
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onRate(Math.max(1, star - 1));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      onRate(1);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      onRate(5);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={ariaLabelledBy}
      aria-invalid={hasError}
      className="flex items-center gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-label={`Rate ${star} out of 5`}
          aria-checked={rating === star}
          tabIndex={
            rating === 0 ? (star === 1 ? 0 : -1) : rating === star ? 0 : -1
          }
          disabled={disabled}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onKeyDown={(event) => handleKeyDown(event, star)}
          className="h-11 w-11 inline-flex items-center justify-center rounded-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              star <= (hovered || rating)
                ? "text-accent fill-accent"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
      {rating > 0 && (
        <span
          className="ml-2 pd-type-label pd-type-number text-muted-foreground"
          dir="ltr"
        >
          {rating}/5
        </span>
      )}
    </div>
  );
};
