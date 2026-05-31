import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useI18n } from "@/components/i18n";
import { cn } from "@/lib/utils";
import type { PreferenceValidationIssue } from "../utils/onboardingPreferences";
import { formatPreferenceValidationIssues } from "../utils/preferenceValidationI18n";

type PreferenceValidationAlertProps = {
  variant: "success" | "error";
  successMessage?: string;
  validationIssues?: PreferenceValidationIssue[];
  errorMessage?: string | null;
  className?: string;
};

export const PreferenceValidationAlert = ({
  variant,
  successMessage,
  validationIssues = [],
  errorMessage,
  className,
}: PreferenceValidationAlertProps) => {
  const { t } = useI18n();

  if (variant === "success" && successMessage) {
    return (
      <Alert
        className={cn(
          "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <AlertTitle className="text-emerald-800 dark:text-emerald-300">
          {t("preferences.save.successTitle")}
        </AlertTitle>
        <AlertDescription className="text-emerald-700 dark:text-emerald-400/90">
          {successMessage}
        </AlertDescription>
      </Alert>
    );
  }

  const validationMessages =
    validationIssues.length > 0
      ? formatPreferenceValidationIssues(validationIssues, t)
      : [];
  const hasValidation = validationMessages.length > 0;
  const hasApiError = Boolean(errorMessage?.trim());

  if (!hasValidation && !hasApiError) {
    return null;
  }

  return (
    <Alert
      variant="destructive"
      className={className}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{t("preferences.save.failedTitle")}</AlertTitle>
      <AlertDescription className="space-y-2">
        {hasValidation ? (
          <div>
            <p>{t("preferences.validation.fixBeforeSave")}</p>
            <ul className="mt-2 list-disc space-y-1 ps-5">
              {validationMessages.map((message) => (
                <li key={message} className="break-words" dir="auto">
                  {message}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {hasApiError ? (
          <p className="break-words" dir="auto">
            {errorMessage}
          </p>
        ) : null}
      </AlertDescription>
    </Alert>
  );
};
