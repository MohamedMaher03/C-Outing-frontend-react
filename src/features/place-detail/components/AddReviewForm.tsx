import { useId, useState } from "react";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { formatInteger } from "../utils/formatters";
import { StarRatingInput } from "./StarRatingInput";

interface AddReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  submitting: boolean;
  submitted: boolean;
  mode?: "create" | "edit";
  initialRating?: number;
  initialComment?: string;
  onCancelEdit?: () => void;
  onDelete?: () => Promise<void>;
  deleting?: boolean;
  errorMessage?: string | null;
}

/** Review form for submitting user reviews */
export const AddReviewForm = ({
  onSubmit,
  submitting,
  submitted,
  mode = "create",
  initialRating = 0,
  initialComment = "",
  onCancelEdit,
  onDelete,
  deleting = false,
  errorMessage,
}: AddReviewFormProps) => {
  const ratingLabelId = useId();
  const reviewFieldId = useId();
  const reviewCounterId = useId();
  const reviewErrorId = useId();

  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [formError, setFormError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const effectiveError = formError || errorMessage || "";

  const handleSubmit = async () => {
    if (submitting) return; // guard against async double-fire before re-render
    setFormError("");
    if (rating === 0) {
      setFormError("Please select a rating");
      return;
    }
    if (comment.trim().length < 10) {
      setFormError("Review must be at least 10 characters");
      return;
    }
    if (comment.trim().length > 2000) {
      setFormError("Review must be 2000 characters or less");
      return;
    }
    try {
      await onSubmit(rating, comment.trim());
      if (mode === "create") {
        setRating(0);
        setComment("");
      }
    } catch {
      setFormError("Failed to submit review. Please try again.");
    }
  };

  return (
    <Card className="rounded-2xl border-border/70 bg-card/95 p-5 space-y-4 shadow-sm">
      <h3 className="text-role-subheading text-foreground flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-secondary" />
        {mode === "edit" ? "Edit Your Review" : "Write a Review"}
      </h3>

      {submitted && (
        <Alert
          role="status"
          aria-live="polite"
          className="border-secondary/30 bg-secondary/10 text-secondary"
        >
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="pd-type-label break-words">
            Your review has been submitted successfully.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-1">
        <label
          id={ratingLabelId}
          className="pd-type-kicker text-muted-foreground"
        >
          Your Rating
        </label>
        <StarRatingInput
          rating={rating}
          onRate={setRating}
          ariaLabelledBy={ratingLabelId}
          hasError={rating === 0 && !!formError}
          disabled={submitting || deleting}
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor={reviewFieldId}
          className="pd-type-kicker text-muted-foreground"
        >
          Your Review
        </label>
        <textarea
          id={reviewFieldId}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience about this place..."
          rows={3}
          maxLength={2000}
          dir="auto"
          aria-invalid={!!effectiveError}
          aria-describedby={`${reviewCounterId}${effectiveError ? ` ${reviewErrorId}` : ""}`}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 pd-type-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
        />
        <p
          id={reviewCounterId}
          className="pd-type-micro pd-type-number text-muted-foreground text-right"
          dir="ltr"
        >
          {formatInteger(comment.trim().length)}/{formatInteger(2000)}
        </p>
      </div>

      {effectiveError && (
        <p
          id={reviewErrorId}
          role="alert"
          className="pd-type-micro text-destructive break-words"
        >
          {effectiveError}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          onClick={handleSubmit}
          type="button"
          variant="secondary"
          disabled={submitting || deleting || rating === 0}
          className="flex-1 h-11 w-full sm:w-auto gap-2 font-semibold"
        >
          {submitting ? (
            <>
              <div className="h-4 w-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
              {mode === "edit" ? "Saving..." : "Submitting..."}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {mode === "edit" ? "Save Changes" : "Submit Review"}
            </>
          )}
        </Button>

        {mode === "edit" && onDelete && (
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={submitting || deleting}
                className="h-11 w-full sm:w-auto gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Delete Your Review?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Your rating and comment will be
                  permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>
                  Keep Review
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async (event) => {
                    event.preventDefault();
                    try {
                      await onDelete();
                      setDeleteDialogOpen(false);
                    } catch {
                      // The hook already exposes a user-facing error message.
                    }
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {mode === "edit" && onCancelEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelEdit}
            disabled={submitting || deleting}
            className="h-11 w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
};
