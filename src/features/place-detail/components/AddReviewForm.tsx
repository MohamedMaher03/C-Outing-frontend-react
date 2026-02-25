import { useState } from "react";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRatingInput } from "./StarRatingInput";

interface AddReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  submitting: boolean;
  submitted: boolean;
}

/** Review form for submitting user reviews */
export const AddReviewForm = ({
  onSubmit,
  submitting,
  submitted,
}: AddReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = async () => {
    if (submitting) return; // guard against async double-fire before re-render
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
