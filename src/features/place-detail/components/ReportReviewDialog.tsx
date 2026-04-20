import { useEffect, useId, useRef, useState } from "react";
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
import { useI18n } from "@/components/i18n";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  REPORT_REASONS,
  type ReportPayload,
  type ReportReason,
} from "../types";
import { getErrorMessage } from "@/utils/apiError";
import { formatInteger } from "../utils/formatters";

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
  const { t } = useI18n();
  const reasonGroupLabelId = useId();
  const descriptionFieldId = useId();

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const reasonLabelMap: Record<ReportReason, string> = {
    "Spam Content": t("placeDetail.report.reason.spam"),
    Harassment: t("placeDetail.report.reason.harassment"),
    "Inaccurate Information": t("placeDetail.report.reason.inaccurate"),
    "Inappropriate Content": t("placeDetail.report.reason.inappropriate"),
    "Hate Speech": t("placeDetail.report.reason.hateSpeech"),
    "Copyright Violation": t("placeDetail.report.reason.copyright"),
    Other: t("placeDetail.report.reason.other"),
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setOpen(nextOpen);
    if (!nextOpen) {
      setReason("");
      setDescription("");
      setSubmitted(false);
      setSubmitError(null);
    }
  };

  const handleSubmit = async () => {
    if (!reason) return;

    try {
      setSubmitting(true);
      setSubmitError(null);
      await onReport({ reviewId, reason: reason as ReportReason, description });
      setSubmitted(true);
      closeTimeoutRef.current = window.setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setReason("");
        setDescription("");
      }, 1800);
    } catch (error: unknown) {
      setSubmitError(
        getErrorMessage(error, t("placeDetail.report.error.submit")),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadyReported) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled
        aria-label={t("placeDetail.report.alreadyReported")}
        className="h-11 w-11 rounded-full text-muted-foreground"
        title={t("placeDetail.report.alreadyReported")}
      >
        <Flag className="h-3.5 w-3.5" />
      </Button>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("placeDetail.report.triggerAria", {
            author: reviewAuthor,
          })}
          className="h-11 w-11 rounded-full text-muted-foreground hover:text-destructive"
          title={t("placeDetail.report.triggerTitle")}
        >
          <Flag className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-role-subheading flex items-center gap-2">
            <Flag className="h-4 w-4 text-destructive" />
            {t("placeDetail.report.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="pd-type-label text-muted-foreground">
            {t("placeDetail.report.description", {
              author: reviewAuthor,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-accent mx-auto" />
            <p className="pd-type-label font-semibold text-accent">
              {t("placeDetail.report.submittedTitle")}
            </p>
            <p className="pd-type-micro text-muted-foreground">
              {t("placeDetail.report.submittedDescription")}
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div
              className="space-y-2"
              role="radiogroup"
              aria-labelledby={reasonGroupLabelId}
            >
              <Label id={reasonGroupLabelId} className="pd-type-label">
                {t("placeDetail.report.reasonLabel")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={reason === r}
                    onClick={() => setReason(r)}
                    className={cn(
                      "min-h-11 px-3 py-2 rounded-lg pd-type-micro text-left border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      reason === r
                        ? "bg-accent/10 border-accent/40 text-accent font-semibold"
                        : "bg-muted/40 border-border text-muted-foreground hover:border-accent/35 hover:bg-accent/5",
                    )}
                  >
                    <span className="break-words">{reasonLabelMap[r]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={descriptionFieldId} className="pd-type-label">
                {t("placeDetail.report.additionalDetails")}{" "}
                <span className="text-muted-foreground font-normal">
                  ({t("placeDetail.report.optional")})
                </span>
              </Label>
              <textarea
                id={descriptionFieldId}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("placeDetail.report.placeholder")}
                dir="auto"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pd-type-body text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                rows={3}
                maxLength={500}
              />
              <p
                className="pd-type-micro pd-type-number text-muted-foreground text-right"
                dir="ltr"
              >
                {formatInteger(description.length)}/{formatInteger(500)}
              </p>
            </div>

            {submitError && (
              <p
                role="alert"
                className="pd-type-micro text-destructive break-words"
              >
                {submitError}
              </p>
            )}
          </div>
        )}

        {!submitted && (
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {t("placeDetail.report.cancel")}
            </AlertDialogCancel>
            <Button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
            >
              {submitting ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t("placeDetail.report.submitting")}
                </>
              ) : (
                <>
                  <Flag className="h-3.5 w-3.5" />
                  {t("placeDetail.report.submit")}
                </>
              )}
            </Button>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
