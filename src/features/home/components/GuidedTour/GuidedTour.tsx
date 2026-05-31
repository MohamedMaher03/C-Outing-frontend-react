import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  type CSSProperties,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCheck,
  Sparkles,
  Heart,
  Star,
  Map,
  Compass,
  Wand2,
  Bookmark,
} from "lucide-react";
import { TOUR_STEPS, type TourStep } from "./tourSteps";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n";

const SPOTLIGHT_PADDING = 12;
const TOOLTIP_WIDTH = 340;
const TOOLTIP_OFFSET = 16;

interface SpotRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GuidedTourProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

const ACCENT_ICON_MAP = {
  sparkles: Sparkles,
  heart: Heart,
  star: Star,
  map: Map,
  compass: Compass,
  wand: Wand2,
} as const;

const BADGE_ICON_MAP = {
  heart: Heart,
  bookmark: Bookmark,
  star: Star,
} as const;

function findTourTarget(stepId: string): HTMLElement | null {
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-tour="${stepId}"]`),
  );
  return (
    candidates.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }) ?? null
  );
}

function computeTooltipStyle(
  rect: SpotRect | null,
  placement: TourStep["placement"],
  vw: number,
  vh: number,
  isMobile: boolean,
): CSSProperties {
  if (placement === "center") {
    return {};
  }

  if (!rect) {
    return {
      position: "fixed",
      bottom: "1.25rem",
      left: "1rem",
      right: "1rem",
      width: "auto",
      maxWidth: "none",
    };
  }

  if (isMobile) {
    const targetIsNearBottom = rect && rect.y > vh * 0.65;
    return targetIsNearBottom
      ? {
          position: "fixed",
          bottom: "6rem",
          left: "1rem",
          right: "1rem",
          width: "auto",
          maxWidth: "none",
        }
      : {
          position: "fixed",
          bottom: "1.25rem",
          left: "1rem",
          right: "1rem",
          width: "auto",
          maxWidth: "none",
        };
  }

  const spotLeft = rect.x - SPOTLIGHT_PADDING;
  const spotTop = rect.y - SPOTLIGHT_PADDING;
  const spotRight = rect.x + rect.width + SPOTLIGHT_PADDING;
  const spotBottom = rect.y + rect.height + SPOTLIGHT_PADDING;
  const cx = (spotLeft + spotRight) / 2;

  const clampLeft = (raw: number) =>
    Math.min(Math.max(raw, 8), vw - TOOLTIP_WIDTH - 8);

  const base: CSSProperties = {
    position: "fixed",
    width: `${TOOLTIP_WIDTH}px`,
    maxWidth: `calc(100vw - 2rem)`,
  };

  switch (placement) {
    case "bottom":
      return {
        ...base,
        top: `${spotBottom + TOOLTIP_OFFSET}px`,
        left: `${clampLeft(cx - TOOLTIP_WIDTH / 2)}px`,
      };
    case "top":
      return {
        ...base,
        bottom: `${vh - spotTop + TOOLTIP_OFFSET}px`,
        left: `${clampLeft(cx - TOOLTIP_WIDTH / 2)}px`,
      };
    case "left":
      return {
        ...base,
        width: `${Math.min(TOOLTIP_WIDTH, spotLeft - TOOLTIP_OFFSET - 8)}px`,
        top: `${Math.min(Math.max(rect.y - 40, 8), vh - 260)}px`,
        right: `${vw - spotLeft + TOOLTIP_OFFSET}px`,
      };
    case "right":
      return {
        ...base,
        top: `${Math.min(Math.max(rect.y - 40, 8), vh - 260)}px`,
        left: `${spotRight + TOOLTIP_OFFSET}px`,
      };
  }
}

interface TourCardProps {
  step: (typeof TOUR_STEPS)[number] | undefined;
  currentStep: number;
  totalSteps: number;
  isCenter: boolean;
  isArabic: boolean;
  isLast: boolean;
  stepTitle: string;
  stepBody: string;
  stepCounterLabel: string;
  skipLabel: string;
  nextLabel: string;
  doneLabel: string;
  getLocalizedLabel: (value: { en: string; ar: string }) => string;
  AccentIcon: React.ComponentType<{ className?: string }>;
  onSkip: () => void;
  onNext: () => void;
  onFinish: () => void;
}

const TourCard = ({
  step,
  isCenter,
  isArabic,
  isLast,
  stepTitle,
  stepBody,
  stepCounterLabel,
  skipLabel,
  nextLabel,
  doneLabel,
  getLocalizedLabel,
  AccentIcon,
  onSkip,
  onNext,
  onFinish,
}: TourCardProps) => (
  <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl">
    <div className="relative h-[3px] w-full overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-secondary via-primary to-secondary/60"
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 2.4,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-secondary via-primary to-secondary/60" />
    </div>

    <div className={cn("space-y-4 p-5 sm:p-6", isCenter && "sm:p-7")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 ring-1 ring-primary/20"
            animate={{ rotate: [0, -4, 4, -3, 3, 0], scale: [1, 1.06, 1] }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <AccentIcon className="h-[18px] w-[18px] text-primary" />
          </motion.div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {stepCounterLabel}
          </span>
        </div>
        <motion.span
          className="text-2xl leading-none select-none"
          aria-hidden="true"
          animate={{ rotate: [0, 8, -6, 5, 0] }}
          transition={{
            duration: 1.6,
            ease: "easeInOut",
            delay: 0.4,
            repeat: Infinity,
            repeatDelay: 4,
          }}
        >
          <AccentIcon className="h-6 w-6" />
        </motion.span>
      </div>

      <h3
        className={cn(
          "font-bold leading-snug text-foreground",
          isCenter ? "text-base sm:text-lg" : "text-sm sm:text-[15px]",
        )}
      >
        {stepTitle}
      </h3>

      <p
        className={cn(
          "leading-relaxed text-muted-foreground",
          isCenter ? "text-[13px] sm:text-sm" : "text-xs sm:text-[13px]",
        )}
      >
        {stepBody}
      </p>

      {step?.badges && step.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {step.badges.map((badge, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-foreground"
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.28,
                ease: [0.25, 1, 0.5, 1],
                delay: 0.12 + i * 0.1,
              }}
            >
              <span className="text-base leading-none" aria-hidden="true">
                {(() => {
                  const Icon = (BADGE_ICON_MAP as any)[badge.icon];
                  return Icon ? <Icon className="h-4 w-4" /> : badge.icon;
                })()}
              </span>
              {getLocalizedLabel(badge.label)}
            </motion.div>
          ))}
        </div>
      )}

      <div className="border-t border-border/40 pt-1" />

      <div
        className={cn(
          "flex items-center justify-between gap-3",
          isArabic && "flex-row-reverse",
        )}
      >
        <button
          type="button"
          onClick={onSkip}
          className="text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          {skipLabel}
        </button>

        <button
          type="button"
          onClick={isLast ? onFinish : onNext}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.97]",
            isArabic && "flex-row-reverse",
          )}
        >
          {isLast ? (
            <>
              <CheckCheck className="h-3.5 w-3.5" />
              {doneLabel}
            </>
          ) : isArabic ? (
            <>
              {nextLabel}
              <ChevronLeft className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              {nextLabel}
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

export const GuidedTour = ({
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  onFinish,
}: GuidedTourProps) => {
  const { isArabic, t } = useI18n();
  const step = TOUR_STEPS[currentStep];
  const isCenter = step?.placement === "center";

  const [spotRect, setSpotRect] = useState<SpotRect | null>(null);
  const [vw, setVw] = useState(window.innerWidth);
  const [vh, setVh] = useState(window.innerHeight);
  const observerRef = useRef<ResizeObserver | null>(null);
  const isMobile = vw < 768;
  const isLast = currentStep === totalSteps - 1;
  const getLocalizedLabel = useCallback(
    (value: { en: string; ar: string }) => (isArabic ? value.ar : value.en),
    [isArabic],
  );

  const measureTarget = useCallback(() => {
    if (!step || isCenter) {
      setSpotRect(null);
      return;
    }
    const el = findTourTarget(step.id);
    if (!el) {
      setSpotRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setSpotRect({ x: r.left, y: r.top, width: r.width, height: r.height });
  }, [step, isCenter]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setSpotRect(null);
      measureTarget();
      if (step && !isCenter && !isMobile) {
        const el = findTourTarget(step.id);
        el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        setTimeout(measureTarget, 420);
      }
    });

    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
      measureTarget();
    };
    const onScroll = () => measureTarget();

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    if (step && !isCenter) {
      const el = findTourTarget(step.id);
      if (el) {
        observerRef.current?.disconnect();
        observerRef.current = new ResizeObserver(measureTarget);
        observerRef.current.observe(el);
      }
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      observerRef.current?.disconnect();
    };
  }, [step, isMobile, measureTarget, isCenter]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (isLast) onFinish();
        else onNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isLast, onNext, onSkip, onFinish]);

  const tooltipStyle = computeTooltipStyle(
    spotRect,
    step?.placement ?? "bottom",
    vw,
    vh,
    isMobile,
  );

  const stepTitle = step ? getLocalizedLabel(step.title) : "";
  const stepBody = step ? getLocalizedLabel(step.body) : "";

  const AccentIcon = step?.accentIcon
    ? ACCENT_ICON_MAP[step.accentIcon]
    : Sparkles;

  const nextLabel = t("tour.next");
  const doneLabel = t("tour.done");
  const skipLabel = t("tour.skip");
  const stepCounterLabel = t("tour.stepCounter", {
    current: currentStep + 1,
    total: totalSteps,
  });
  const ariaLabel = t("tour.ariaLabel", {
    current: currentStep + 1,
    total: totalSteps,
  });

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: 9990 }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* ── Click-blocker ── */}
      <div className="absolute inset-0" style={{ zIndex: 0 }} />

      {/* ── Spotlight / Overlay ── */}
      <AnimatePresence>
        {isCenter ? (
          /* Solid backdrop for center-modal steps */
          <motion.div
            key="center-overlay"
            className="absolute inset-0 bg-black/65 pointer-events-none backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ zIndex: 1 }}
          />
        ) : spotRect ? (
          /* Cutout spotlight */
          <motion.div
            key={`spot-${currentStep}`}
            className="absolute pointer-events-none rounded-2xl"
            style={{
              boxShadow: "0 0 0 9999px rgba(4, 4, 16, 0.76)",
              outline: "2.5px solid hsl(var(--primary) / 0.7)",
              outlineOffset: "3px",
              zIndex: 1,
            }}
            initial={{
              opacity: 0,
              left: spotRect.x - SPOTLIGHT_PADDING,
              top: spotRect.y - SPOTLIGHT_PADDING,
              width: spotRect.width + SPOTLIGHT_PADDING * 2,
              height: spotRect.height + SPOTLIGHT_PADDING * 2,
            }}
            animate={{
              opacity: 1,
              left: spotRect.x - SPOTLIGHT_PADDING,
              top: spotRect.y - SPOTLIGHT_PADDING,
              width: spotRect.width + SPOTLIGHT_PADDING * 2,
              height: spotRect.height + SPOTLIGHT_PADDING * 2,
            }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
          />
        ) : (
          /* Fallback full-screen overlay */
          <motion.div
            key="fallback-overlay"
            className="absolute inset-0 bg-black/72 pointer-events-none backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 1 }}
          />
        )}
      </AnimatePresence>

      {/* ── Progress dots ── */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2"
        style={{ zIndex: 10 }}
      >
        {Array.from({ length: totalSteps }).map((_, i) => (
          <motion.div
            key={i}
            className="h-1.5 rounded-full"
            animate={{
              width: i === currentStep ? 24 : 6,
              backgroundColor:
                i === currentStep
                  ? "hsl(var(--primary))"
                  : i < currentStep
                    ? "hsl(var(--primary) / 0.5)"
                    : "rgba(255,255,255,0.28)",
            }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          />
        ))}
      </div>

      {/* ── Skip button ── */}
      <button
        type="button"
        onClick={onSkip}
        className={cn(
          "absolute top-3.5 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-[11px] font-medium text-white/75 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
          isArabic ? "left-4" : "right-4",
        )}
        style={{ zIndex: 10 }}
        aria-label={skipLabel}
      >
        <X className="h-3 w-3" />
        {skipLabel}
      </button>

      {/* ── Tooltip / Modal card ── */}
      <AnimatePresence mode="wait">
        {isCenter ? (
          <motion.div
            key={`tip-center-${currentStep}`}
            className="pointer-events-auto absolute inset-0 flex items-center justify-center px-4"
            style={{ zIndex: 10 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: -6 }}
              transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
              style={{
                width: `min(${TOOLTIP_WIDTH + 60}px, calc(100vw - 2rem))`,
              }}
            >
              <TourCard
                step={step}
                currentStep={currentStep}
                totalSteps={totalSteps}
                isCenter={isCenter}
                isArabic={isArabic}
                isLast={isLast}
                stepTitle={stepTitle}
                stepBody={stepBody}
                stepCounterLabel={stepCounterLabel}
                skipLabel={skipLabel}
                nextLabel={nextLabel}
                doneLabel={doneLabel}
                getLocalizedLabel={getLocalizedLabel}
                AccentIcon={AccentIcon}
                onSkip={onSkip}
                onNext={onNext}
                onFinish={onFinish}
              />
            </motion.div>
          </motion.div>
        ) : (
          /* ─ POSITIONED TOOLTIP: spotlight steps ─ */
          <motion.div
            key={`tip-${currentStep}`}
            style={{ ...tooltipStyle, zIndex: 10 }}
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.26, ease: [0.25, 1, 0.5, 1] }}
            className="pointer-events-auto"
          >
            <TourCard
              step={step}
              currentStep={currentStep}
              totalSteps={totalSteps}
              isCenter={isCenter}
              isArabic={isArabic}
              isLast={isLast}
              stepTitle={stepTitle}
              stepBody={stepBody}
              stepCounterLabel={stepCounterLabel}
              skipLabel={skipLabel}
              nextLabel={nextLabel}
              doneLabel={doneLabel}
              getLocalizedLabel={getLocalizedLabel}
              AccentIcon={AccentIcon}
              onSkip={onSkip}
              onNext={onNext}
              onFinish={onFinish}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
