/**
 * ReportReviewDialog
 *
 * Modal dialog for reporting a user review. Ensures one-report-per-review
 * per user and collects a required reason + optional description.
 */

import { useState } from "react";
import { Flag, CheckCircle2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const REPORT_REASONS = [
  "Spam",
  "Harassment",
  "Inaccurate Information",
  "Inappropriate Content",
  "Hate Speech",
  "Copyright Violation",
  "Other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export interface ReportPayload {
  reviewId: string;
  reason: ReportReason;
  description: string;
}

interface ReportReviewDialogProps {
  reviewId: string;
  reviewAuthor: string;
  alreadyReported: boolean;
  onReport: (payload: ReportPayload) => Promise<void> | void;
}

export function ReportReviewDialog({
  reviewId,
  reviewAuthor,
  alreadyReported,
  onReport,
}: ReportReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    try {
      setSubmitting(true);
      await onReport({ reviewId, reason: reason as ReportReason, description });
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setReason("");
        setDescription("");
      }, 1800);
    } catch (err) {
      console.error("Report submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Already reported — show static disabled icon
  if (alreadyReported) {
    return (
      <button
        disabled
        className="p-1.5 rounded-full text-destructive/60 cursor-not-allowed"
        title="You already reported this review"
      >
        <Flag className="h-3.5 w-3.5 fill-destructive/40" />
      </button>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Report this review"
        >
          <Flag className="h-3.5 w-3.5" />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-destructive" />
            Report Review
          </AlertDialogTitle>
          <AlertDialogDescription>
            Report a review by{" "}
            <span className="font-medium text-foreground">{reviewAuthor}</span>{" "}
            that violates community guidelines.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-emerald-600">
              Report submitted — thank you!
            </p>
            <p className="text-xs text-muted-foreground">
              Our moderators will review this shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Reason selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Reason <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs text-left border transition-all",
                      reason === r
                        ? "bg-destructive/10 border-destructive/40 text-destructive font-semibold"
                        : "bg-muted/40 border-border text-muted-foreground hover:border-destructive/20 hover:bg-destructive/5",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Additional details{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in more detail..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-[10px] text-muted-foreground text-right">
                {description.length}/500
              </p>
            </div>
          </div>
        )}

        {!submitted && (
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
            >
              {submitting ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Flag className="h-3.5 w-3.5" />
                  Submit Report
                </>
              )}
            </Button>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
