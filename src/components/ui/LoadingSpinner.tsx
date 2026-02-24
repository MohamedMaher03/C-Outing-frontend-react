import { cn } from "@/lib/utils";
import compassLogo from "@/assets/images/logo6.png";

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
 * Uses logo6.png (compass) with a smooth CSS rotation animation.
 * Supports multiple sizes, optional text, and full-screen overlay mode.
 */
export default function LoadingSpinner({
  size = "md",
  text,
  subText,
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
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

        {/* Spinning compass image — full logo rotates */}
        <img
          src={compassLogo}
          alt="Loading..."
          className={cn("animate-compass-spin drop-shadow-md", sizeMap[size])}
          draggable={false}
        />
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
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * PageLoading — Full-page centered loading state (non-overlay).
 * Great for route-level loading states.
 */
export function PageLoading({
  text = "Loading...",
  subText,
}: {
  text?: string;
  subText?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner size="lg" text={text} subText={subText} />
    </div>
  );
}

/**
 * InlineLoading — Small inline spinner for buttons / cards.
 */
export function InlineLoading({ className }: { className?: string }) {
  return (
    <img
      src={compassLogo}
      alt="Loading..."
      className={cn("animate-compass-spin w-4 h-4 shrink-0", className)}
      draggable={false}
    />
  );
}
