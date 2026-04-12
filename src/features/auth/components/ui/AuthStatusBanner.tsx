import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n";

type AuthStatusBannerProps = {
  message: string;
  variant?: "error" | "success";
  onDismiss?: () => void;
  className?: string;
};

export const AuthStatusBanner = ({
  message,
  variant = "error",
  onDismiss,
  className,
}: AuthStatusBannerProps) => {
  const { t } = useI18n();
  const isError = variant === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "flex min-w-0 items-start gap-3 rounded-md border px-4 py-3 text-sm",
        isError
          ? "border-red-300/80 bg-red-50/95 text-red-800 dark:border-red-500/50 dark:bg-red-900/45 dark:text-red-100"
          : "border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-300",
        className,
      )}
    >
      {isError ? (
        <svg
          className="mt-0.5 h-4 w-4 shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      )}

      <span className="min-w-0 flex-1 break-words" dir="auto">
        {message}
      </span>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t("common.dismiss")}
          className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
