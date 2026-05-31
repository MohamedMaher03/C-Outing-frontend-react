import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Heart,
  Map,
  ThumbsUp,
  Sparkles,
  Star,
  Wand2,
  X,
} from "lucide-react";
import { TOUR_STEPS, type TourStep } from "./tourSteps";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

/** Extra space around the highlighted element inside the spotlight cutout */
const SPOTLIGHT_PAD = 10;
/** Height of the fixed bottom panel (px) */
const PANEL_HEIGHT = 220;
/** When scrolling the target into view, keep this much space from the top so the
 *  beacon + arrow are visible above the panel. */
const SCROLL_TOP_MARGIN = 80;
/** Delay before the arrow/beacon appear so the scroll can settle first */
const MEASURE_SETTLE_MS = 420;

// ─────────────────────────────────────────────
// Icon maps
// ─────────────────────────────────────────────

const ACCENT_ICON_MAP = {
  sparkles: Sparkles,
  heart: Heart,
  star: Star,
  map: Map,
  compass: Compass,
  wand: Wand2,
} as const;

const BADGE_ICON_MAP = {
  like: ThumbsUp,
  heart: Heart,
  star: Star,
} as const;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function findTourTarget(id: string): HTMLElement | null {
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-tour="${id}"]`),
  );
  return (
    candidates.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }) ?? null
  );
}

interface TargetRect {
  /** Viewport-relative values */
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

export interface GuidedTourProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
  onJumpTo?: (step: number) => void;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export const GuidedTour = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onFinish,
  onJumpTo,
}: GuidedTourProps) => {
  const { isArabic, t } = useI18n();

  const step = TOUR_STEPS[currentStep] as TourStep | undefined;
  const isLast = currentStep === totalSteps - 1;
  const isFirst = currentStep === 0;
  const isCenter = !step?.target; // steps with target=null show a centred modal

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [vpWidth, setVpWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 375,
  );
  const [vpHeight, setVpHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 812,
  );

  const observerRef = useRef<ResizeObserver | null>(null);

  const getLocalizedLabel = useCallback(
    (value: { en: string; ar: string }) => (isArabic ? value.ar : value.en),
    [isArabic],
  );

  // ── Measure the target element's position in the viewport ──────────
  const measureTarget = useCallback(() => {
    if (!step?.target || isCenter) {
      setTargetRect(null);
      return;
    }
    const el = findTourTarget(step.target);
    if (!el) {
      setTargetRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setTargetRect({ x: r.left, y: r.top, width: r.width, height: r.height });
  }, [step, isCenter]);

  // ── Scroll + measure whenever the step changes ─────────────────────
  useEffect(() => {
    // Clear stale highlight asynchronously to avoid synchronous setState in effect.
    Promise.resolve().then(() =>
      setTargetRect((prev) => (prev === null ? prev : null)),
    );

    if (!step?.target || isCenter) return;

    const el = findTourTarget(step.target);

    if (el) {
      const r = el.getBoundingClientRect();
      const isLargeScreen = window.innerWidth >= 1024;
      let scrollTarget = window.scrollY + r.top - SCROLL_TOP_MARGIN;

      if (currentStep === 1) {
        // Step 2: "scroll down so rectangle and what inside it be clear (to show full moods)"
        scrollTarget = window.scrollY + r.top - 100;
      } else if (currentStep === 4) {
        scrollTarget = 420;
      } else {
        // Center vertically in visible viewport
        const visibleHeight = isLargeScreen
          ? window.innerHeight
          : window.innerHeight - PANEL_HEIGHT;
        scrollTarget = window.scrollY + r.top - (visibleHeight - r.height) / 2;
      }

      window.scrollTo({ top: Math.max(0, scrollTarget), behavior: "smooth" });
    }

    // First quick measure (if no scroll was needed) — defer to avoid sync setState in effect
    Promise.resolve().then(measureTarget);
    // Second measure after scroll animation settles
    const tid = window.setTimeout(measureTarget, MEASURE_SETTLE_MS);

    const onResize = () => {
      setVpWidth(window.innerWidth);
      setVpHeight(window.innerHeight);
      measureTarget();
    };
    const onScroll = () => measureTarget();

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    if (el) {
      observerRef.current?.disconnect();
      observerRef.current = new ResizeObserver(measureTarget);
      observerRef.current.observe(el);
    }

    return () => {
      window.clearTimeout(tid);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      observerRef.current?.disconnect();
    };
  }, [step, isCenter, currentStep, measureTarget]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (isLast) onFinish();
        else onNext();
      }
      if (e.key === "ArrowLeft" && !isFirst) onPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isLast, isFirst, onNext, onPrev, onSkip, onFinish]);

  const AccentIcon = step?.accentIcon
    ? ACCENT_ICON_MAP[step.accentIcon]
    : Sparkles;

  const isLargeScreen = vpWidth >= 1024;

  // ── Derived spotlight geometry ──────────────────────────────────────
  const spot = targetRect
    ? {
        x: targetRect.x - SPOTLIGHT_PAD,
        y: targetRect.y - SPOTLIGHT_PAD,
        w: targetRect.width + SPOTLIGHT_PAD * 2,
        h: targetRect.height + SPOTLIGHT_PAD * 2,
        cx: targetRect.x + targetRect.width / 2,
        cy: targetRect.y + targetRect.height + SPOTLIGHT_PAD,
      }
    : null;

  // Arrow: from the bottom-center of the spotlight to the top of the panel
  const panelTop = vpHeight - PANEL_HEIGHT;
  const arrowGap = 8; // px gap between spotlight bottom and arrow start
  const arrowFromY = spot ? spot.cy + arrowGap : 0;
  const arrowToY = panelTop - arrowGap;
  const showArrow =
    spot !== null &&
    !isLargeScreen &&
    currentStep !== 5 &&
    arrowToY - arrowFromY > 24;

  // Beacon: top-right corner of highlighted element (reverse to top-left for Arabic)
  const beaconX = targetRect
    ? isArabic
      ? targetRect.x + 4
      : targetRect.x + targetRect.width - 4
    : 0;
  const beaconY = targetRect ? targetRect.y + 4 : 0;

  const stepTitle = step ? getLocalizedLabel(step.title) : "";
  const stepBody = step ? getLocalizedLabel(step.body) : "";

  // ── Floating card positioning calculations on large screens ────────
  let cardLeft = 0;
  let cardTop = 0;
  const cardWidth = 380;
  const cardHeight = 220; // estimate

  if (spot) {
    const shouldBeOnRight = isArabic
      ? !(currentStep === 0 || currentStep === 2 || currentStep === 3)
      : currentStep === 0 || currentStep === 2 || currentStep === 3;

    if (shouldBeOnRight) {
      // Position to the right of the spotlight (or left if reversed in Arabic)
      cardLeft = spot.x + spot.w + 24;
      cardTop = spot.y + spot.h / 2 - cardHeight / 2;
      // Clamp right boundary
      if (cardLeft + cardWidth > vpWidth - 24) {
        cardLeft = vpWidth - cardWidth - 24;
      }
    } else {
      // Position to the left of the spotlight (or right if reversed in Arabic)
      cardLeft = spot.x - cardWidth - 24;
      cardTop = spot.y + spot.h / 2 - cardHeight / 2;
      // Clamp left boundary
      if (cardLeft < 24) {
        cardLeft = 24;
      }
    }
    // Clamp top/bottom
    cardTop = Math.max(24, Math.min(cardTop, vpHeight - cardHeight - 24));
  }

  const pointerDirection =
    isLargeScreen && spot
      ? cardLeft > spot.x + spot.w / 2
        ? "left"
        : "right"
      : null;

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: 9990 }}
      role="dialog"
      aria-modal="true"
      aria-label={t("tour.ariaLabel", {
        current: currentStep + 1,
        total: totalSteps,
      })}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* ── Click-blocker (prevents interaction with page behind overlay) ── */}
      <div className="absolute inset-0" style={{ zIndex: 0 }} />

      {/* ════════════════════════════════════════════════════════════════
          SPOTLIGHT OVERLAY  (SVG-based cutout so the target stays crisp)
         ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isCenter ? (
          /* Solid backdrop for steps without a target */
          <motion.div
            key="center-bg"
            className="absolute inset-0 pointer-events-none bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        ) : (
          <motion.svg
            key={`overlay-${currentStep}`}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 1, width: "100%", height: "100%" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <defs>
              <mask id={`spot-mask-${currentStep}`}>
                {/* White = show overlay; black = transparent (reveal target) */}
                <rect width="100%" height="100%" fill="white" />
                {spot && (
                  <motion.rect
                    rx={14}
                    fill="black"
                    initial={{
                      x: spot.x,
                      y: spot.y,
                      width: spot.w,
                      height: spot.h,
                      opacity: 0,
                    }}
                    animate={{
                      x: spot.x,
                      y: spot.y,
                      width: spot.w,
                      height: spot.h,
                      opacity: 1,
                    }}
                    transition={{ type: "spring", damping: 26, stiffness: 180 }}
                  />
                )}
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(4, 4, 16, 0.74)"
              mask={`url(#spot-mask-${currentStep})`}
            />
            {/* Accent ring around the spotlight */}
            {spot && (
              <motion.rect
                rx={14}
                fill="none"
                stroke="hsl(var(--primary) / 0.65)"
                strokeWidth={2}
                initial={{
                  x: spot.x,
                  y: spot.y,
                  width: spot.w,
                  height: spot.h,
                  opacity: 0,
                }}
                animate={{
                  x: spot.x,
                  y: spot.y,
                  width: spot.w,
                  height: spot.h,
                  opacity: 1,
                }}
                transition={{ type: "spring", damping: 26, stiffness: 180 }}
              />
            )}
          </motion.svg>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════
          BEACON — pulsing dot at top-right corner of the target
         ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {targetRect && (
          <motion.div
            key={`beacon-${currentStep}`}
            className="absolute pointer-events-none"
            style={{
              zIndex: 20,
              left: beaconX,
              top: beaconY,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          >
            {/* Outer pulsing ring */}
            <motion.span
              className="absolute rounded-full border-2 border-primary"
              style={{ width: 22, height: 22, top: -11, left: -11 }}
              animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
              transition={{ duration: 1.8, ease: "easeOut", repeat: Infinity }}
            />
            <motion.span
              className="absolute rounded-full border-2 border-primary"
              style={{ width: 22, height: 22, top: -11, left: -11 }}
              animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
              transition={{
                duration: 1.8,
                ease: "easeOut",
                repeat: Infinity,
                delay: 0.6,
              }}
            />
            {/* Inner dot */}
            <motion.span
              className="absolute rounded-full bg-primary"
              style={{ width: 9, height: 9, top: -4.5, left: -4.5 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1.8,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════
          DASHED ARROW — visual connector from target to panel
         ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showArrow && spot && (
          <motion.svg
            key={`arrow-${currentStep}`}
            className="absolute pointer-events-none overflow-visible"
            style={{
              zIndex: 22,
              left: spot.cx - 1,
              top: arrowFromY,
              width: 2,
              height: arrowToY - arrowFromY,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <defs>
              <marker
                id="arrow-tip"
                markerWidth="6"
                markerHeight="6"
                refX="3"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill="hsl(var(--primary) / 0.75)" />
              </marker>
            </defs>
            <line
              x1="1"
              y1="0"
              x2="1"
              y2={arrowToY - arrowFromY - 8}
              stroke="hsl(var(--primary) / 0.65)"
              strokeWidth="1.5"
              strokeDasharray="5 4"
              markerEnd="url(#arrow-tip)"
            />
          </motion.svg>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════
          CENTER MODAL  (for steps with no target element)
         ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isCenter && (
          <motion.div
            key={`modal-${currentStep}`}
            className="absolute inset-0 flex items-center justify-center px-5 pointer-events-auto"
            style={{ zIndex: 30 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-3xl border border-border/40 bg-card shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: -8 }}
              transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
            >
              <PanelContent
                step={step}
                currentStep={currentStep}
                totalSteps={totalSteps}
                isLast={isLast}
                isFirst={isFirst}
                isArabic={isArabic}
                AccentIcon={AccentIcon}
                stepTitle={stepTitle}
                stepBody={stepBody}
                t={t}
                getLocalizedLabel={getLocalizedLabel}
                onNext={onNext}
                onPrev={onPrev}
                onSkip={onSkip}
                onFinish={onFinish}
                onJumpTo={onJumpTo}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP FLOATING CARD (for spotlight steps on large screens)
         ════════════════════════════════════════════════════════════════ */}
      {!isCenter && isLargeScreen && spot && (
        <motion.div
          key={`desktop-card-${currentStep}`}
          className="absolute rounded-3xl border border-border/40 bg-card shadow-2xl overflow-hidden pointer-events-auto"
          style={{
            zIndex: 30,
            width: cardWidth,
            left: cardLeft,
            top: cardTop,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
        >
          {/* Subtle pointing arrow */}
          {pointerDirection === "left" && (
            <div
              className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-3 h-3 bg-card border-l border-b border-border/40 rotate-45 pointer-events-none"
              style={{ zIndex: 1 }}
            />
          )}
          {pointerDirection === "right" && (
            <div
              className="absolute top-1/2 -right-[6px] -translate-y-1/2 w-3 h-3 bg-card border-r border-t border-border/40 rotate-45 pointer-events-none"
              style={{ zIndex: 1 }}
            />
          )}

          <PanelContent
            step={step}
            currentStep={currentStep}
            totalSteps={totalSteps}
            isLast={isLast}
            isFirst={isFirst}
            isArabic={isArabic}
            AccentIcon={AccentIcon}
            stepTitle={stepTitle}
            stepBody={stepBody}
            t={t}
            getLocalizedLabel={getLocalizedLabel}
            onNext={onNext}
            onPrev={onPrev}
            onSkip={onSkip}
            onFinish={onFinish}
            onJumpTo={onJumpTo}
          />
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MOBILE TOP FLOATING CARD (specifically for Step 6 on mobile)
         ════════════════════════════════════════════════════════════════ */}
      {!isCenter && !isLargeScreen && currentStep === 5 && (
        <motion.div
          key="mobile-top-card"
          className="absolute top-4 left-4 right-4 mx-auto max-w-sm rounded-3xl border border-border/40 bg-card/95 shadow-2xl overflow-hidden pointer-events-auto backdrop-blur-md"
          style={{ zIndex: 30 }}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.25, 1, 0.5, 1] }}
        >
          <PanelContent
            step={step}
            currentStep={currentStep}
            totalSteps={totalSteps}
            isLast={isLast}
            isFirst={isFirst}
            isArabic={isArabic}
            AccentIcon={AccentIcon}
            stepTitle={stepTitle}
            stepBody={stepBody}
            t={t}
            getLocalizedLabel={getLocalizedLabel}
            onNext={onNext}
            onPrev={onPrev}
            onSkip={onSkip}
            onFinish={onFinish}
            onJumpTo={onJumpTo}
          />
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          BOTTOM PANEL (standard for spotlight steps on mobile, except Step 6)
         ════════════════════════════════════════════════════════════════ */}
      {!isCenter && !isLargeScreen && currentStep !== 5 && (
        <motion.div
          key="bottom-panel"
          className="absolute bottom-0 left-0 right-0 pointer-events-auto bg-card border-t border-border/50 shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
          style={{ zIndex: 30, height: PANEL_HEIGHT }}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.25, 1, 0.5, 1] }}
        >
          <PanelContent
            step={step}
            currentStep={currentStep}
            totalSteps={totalSteps}
            isLast={isLast}
            isFirst={isFirst}
            isArabic={isArabic}
            AccentIcon={AccentIcon}
            stepTitle={stepTitle}
            stepBody={stepBody}
            t={t}
            getLocalizedLabel={getLocalizedLabel}
            onNext={onNext}
            onPrev={onPrev}
            onSkip={onSkip}
            onFinish={onFinish}
            onJumpTo={onJumpTo}
          />
        </motion.div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// PanelContent  (shared between bottom panel & center modal)
// ─────────────────────────────────────────────

interface PanelContentProps {
  step: TourStep | undefined;
  currentStep: number;
  totalSteps: number;
  isLast: boolean;
  isFirst: boolean;
  isArabic: boolean;
  AccentIcon: React.ComponentType<{ className?: string }>;
  stepTitle: string;
  stepBody: string;
  t: (
    key: string,
    values?: Record<string, string | number>,
    fallback?: string,
  ) => string;
  getLocalizedLabel: (value: { en: string; ar: string }) => string;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onFinish: () => void;
  onJumpTo?: (step: number) => void;
}

function PanelContent({
  step,
  currentStep,
  totalSteps,
  isLast,
  isFirst,
  isArabic,
  AccentIcon,
  stepTitle,
  stepBody,
  t,
  getLocalizedLabel,
  onNext,
  onPrev,
  onSkip,
  onFinish,
  onJumpTo,
}: PanelContentProps) {
  const nextLabel = t("tour.next");
  const doneLabel = t("tour.done");
  const skipLabel = t("tour.skip");

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="relative h-[3px] w-full overflow-hidden bg-muted/30 flex-shrink-0">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary rounded-r-full"
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
        />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2.5 px-5 pt-4 pb-2 flex-1 min-h-0">
        {/* Top row: icon + counter + skip */}
        <div
          className={cn(
            "flex items-center justify-between",
            isArabic && "flex-row-reverse",
          )}
        >
          <div className="flex items-center gap-2.5">
            <motion.div
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10"
              animate={{ rotate: [0, -5, 5, -3, 3, 0], scale: [1, 1.07, 1] }}
              transition={{
                duration: 2.2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <AccentIcon className="h-4 w-4 text-primary" />
            </motion.div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t("tour.stepCounter", {
                current: currentStep + 1,
                total: totalSteps,
              })}
            </span>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="flex items-center gap-1 rounded-full border border-border/50 bg-background/60 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label={skipLabel}
          >
            <X className="h-3 w-3" aria-hidden="true" />
            {skipLabel}
          </button>
        </div>

        {/* Title */}
        <AnimatePresence mode="wait">
          <motion.h3
            key={`title-${currentStep}`}
            className="text-sm font-semibold leading-snug text-foreground"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          >
            {stepTitle}
          </motion.h3>
        </AnimatePresence>

        {/* Body text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`body-${currentStep}`}
            className="text-xs leading-relaxed text-muted-foreground line-clamp-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{
              duration: 0.22,
              ease: [0.25, 1, 0.5, 1],
              delay: 0.04,
            }}
          >
            {stepBody}
          </motion.p>
        </AnimatePresence>

        {/* Badges (optional) */}
        {step?.badges && step.badges.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-1.5 pt-0.5",
              isArabic && "flex-row-reverse",
            )}
          >
            {step.badges.map((badge, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-foreground"
                initial={{ opacity: 0, scale: 0.88, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.24,
                  ease: [0.25, 1, 0.5, 1],
                  delay: 0.1 + i * 0.08,
                }}
              >
                {(() => {
                  const BadgeIcon = BADGE_ICON_MAP[badge.icon];

                  return (
                    <BadgeIcon
                      className="h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  );
                })()}
                {getLocalizedLabel(badge.label)}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={cn(
          "flex items-center justify-between gap-3 px-5 pb-4 flex-shrink-0",
          isArabic && "flex-row-reverse",
        )}
      >
        {/* Step dots — tappable */}
        <div
          className={cn(
            "flex items-center gap-1.5",
            isArabic && "flex-row-reverse",
          )}
        >
          {Array.from({ length: totalSteps }).map((_, i) => (
            <motion.button
              key={i}
              type="button"
              className="h-[5px] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
              animate={{
                width: i === currentStep ? 16 : 5,
                backgroundColor:
                  i === currentStep
                    ? "hsl(var(--primary))"
                    : i < currentStep
                      ? "hsl(var(--primary) / 0.4)"
                      : "hsl(var(--border))",
              }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              onClick={() => onJumpTo?.(i)}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div
          className={cn(
            "flex items-center gap-2",
            isArabic && "flex-row-reverse",
          )}
        >
          {/* Back button */}
          <motion.button
            type="button"
            onClick={onPrev}
            disabled={isFirst}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 bg-background text-muted-foreground transition-colors hover:text-foreground hover:border-border disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={t("tour.prev")}
          >
            {isArabic ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </motion.button>

          {/* Next / Done button */}
          <motion.button
            type="button"
            onClick={isLast ? onFinish : onNext}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-xl bg-primary px-4 text-[12px] font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isArabic && "flex-row-reverse",
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            {isLast ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {doneLabel}
              </>
            ) : isArabic ? (
              <>
                {nextLabel}
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </>
            ) : (
              <>
                {nextLabel}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
