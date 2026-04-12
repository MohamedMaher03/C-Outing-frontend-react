import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import arrowLogo from "@/assets/images/arrow-loading.png";
import pyramidLogo from "@/assets/images/pyramid-loading-2.png";
import { useI18n } from "@/components/i18n";

interface LoadingSpinnerProps {
  /** Size of the spinner: sm (32px), md (64px), lg (96px), xl (128px) */
  size?: "sm" | "md" | "lg" | "xl";
  /** Optional text to display below the spinner */
  text?: string;
  /** Optional sub-text below the main text */
  subText?: string;
  /** Whether to show as a full-screen overlay */
  fullScreen?: boolean;
  /** Additional className */
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
};

const glowSizeMap = {
  sm: "w-12 h-12",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-40 h-40",
};

/**
 * LoadingSpinner — Spinning compass logo used across the entire project.
 *
 * Supports multiple sizes, optional text, and full-screen overlay mode.
 */
export default function LoadingSpinner({
  size = "md",
  text,
  subText,
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const { t } = useI18n();

  const spinner = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className,
      )}
    >
      {/* Compass container */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing glow ring */}
        <div
          className={cn(
            "absolute rounded-full bg-secondary/20 animate-compass-pulse",
            glowSizeMap[size],
          )}
        />

        {/* Stacked logo: pyramid (static) + arrow (spinning) */}
        <div className={cn("relative", sizeMap[size])}>
          {/* Static pyramid */}
          <img
            src={pyramidLogo}
            alt=""
            className="absolute inset-0 w-full h-full object-contain drop-shadow-md"
            draggable={false}
          />
          {/* Spinning arrow */}
          <img
            src={arrowLogo}
            alt={t("common.loading")}
            className="absolute inset-0 w-full h-full object-contain animate-compass-spin drop-shadow-md"
            draggable={false}
          />
        </div>
      </div>

      {/* Optional text */}
      {(text || subText) && (
        <div className="text-center">
          {text && (
            <p className="text-foreground font-semibold text-sm">{text}</p>
          )}
          {subText && (
            <p className="text-muted-foreground text-xs mt-1">{subText}</p>
          )}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return createPortal(
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        {spinner}
      </div>,
      document.body,
    );
  }

  return spinner;
}

/**
 * PageLoading — Full-page centered loading state (non-overlay).
 * Great for route-level loading states.
 */
export function PageLoading({
  text,
  subText,
}: {
  text?: string;
  subText?: string;
}) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen overflow-hidden flex items-center justify-center bg-background">
      <LoadingSpinner
        size="lg"
        text={text ?? t("common.loading")}
        subText={subText}
      />
    </div>
  );
}

/**
 * InlineLoading — Small inline spinner for buttons / cards.
 */
export function InlineLoading({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { t } = useI18n();

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-9 h-9",
  };

  return (
    <img
      src={arrowLogo}
      alt={t("common.loading")}
      className={cn(
        `animate-compass-spin shrink-0 ${sizeClasses[size]}`,
        className,
      )}
      draggable={false}
    />
  );
}
