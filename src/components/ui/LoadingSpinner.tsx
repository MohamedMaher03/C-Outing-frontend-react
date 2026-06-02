import { createPortal } from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import arrowLogo from "@/assets/images/arrow-loading.png";
import pyramidLogo from "@/assets/images/pyramid-loading-2.png";
import { useI18n } from "@/components/i18n";

const spinnerVariants = cva("flex flex-col items-center justify-center gap-4", {
  variants: {
    size: {
      sm: "",
      md: "",
      lg: "",
      xl: "",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type SpinnerScale = NonNullable<VariantProps<typeof spinnerVariants>["size"]>;

interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  text?: string;
  subText?: string;
  fullScreen?: boolean;
  className?: string;
  portalTarget?: Element | DocumentFragment | null;
}

const logoScaleMap: Record<SpinnerScale, string> = {
  sm: "w-8 h-8",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
};

const glowScaleMap: Record<SpinnerScale, string> = {
  sm: "w-12 h-12",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-40 h-40",
};

export default function LoadingSpinner({
  size = "md",
  text,
  subText,
  fullScreen = false,
  className,
  portalTarget,
}: LoadingSpinnerProps) {
  const { t } = useI18n();
  const resolvedScale = size ?? "md";

  const spinner = (
    <div
      className={cn(
        spinnerVariants({ size: resolvedScale }),
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "absolute rounded-full bg-secondary/20 animate-compass-pulse",
            glowScaleMap[resolvedScale],
          )}
        />
        <div className={cn("relative", logoScaleMap[resolvedScale])}>
          <img
            src={pyramidLogo}
            alt=""
            className="absolute inset-0 w-full h-full object-contain drop-shadow-md"
            draggable={false}
          />
          <img
            src={arrowLogo}
            alt={t("common.loading")}
            className="absolute inset-0 w-full h-full object-contain animate-compass-spin drop-shadow-md"
            draggable={false}
          />
        </div>
      </div>
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

  const portalHost =
    portalTarget ??
    (typeof document !== "undefined" ? document.body : null);

  if (fullScreen && portalHost) {
    return createPortal(
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        {spinner}
      </div>,
      portalHost,
    );
  }

  return spinner;
}

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

export function InlineLoading({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { t } = useI18n();

  const sizeClasses: Record<"sm" | "md" | "lg", string> = {
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
