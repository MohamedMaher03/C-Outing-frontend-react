import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingInputProps {
  rating: number;
  onRate: (r: number) => void;
}

/** Interactive star rating input for the review form */
export const StarRatingInput = ({ rating, onRate }: StarRatingInputProps) => {
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
