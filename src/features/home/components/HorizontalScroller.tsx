import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useI18n } from "@/components/i18n";
import { cn } from "@/lib/utils";
import {
  getHorizontalScrollState,
  scrollHorizontally,
  scrollToHorizontalStart,
} from "@/utils/horizontalScroll";

interface HorizontalScrollerProps {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
  scrollKey?: string | number;
  showArrows?: boolean;
}

const HorizontalScroller = ({
  children,
  ariaLabel,
  className,
  scrollKey,
  showArrows = true,
}: HorizontalScrollerProps) => {
  const { t, direction } = useI18n();
  const isRtl = direction === "rtl";
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollButtons = useCallback(() => {
    if (!showArrows) return;
    const element = scrollRef.current;
    if (!element) return;
    const { canScrollBack, canScrollForward } =
      getHorizontalScrollState(element);
    setCanScrollPrevious(canScrollBack);
    setCanScrollNext(canScrollForward);
  }, [showArrows]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    scrollToHorizontalStart(element);
    if (showArrows) requestAnimationFrame(updateScrollButtons);
  }, [scrollKey, updateScrollButtons, isRtl, showArrows]);

  useEffect(() => {
    if (!showArrows) return;
    const element = scrollRef.current;
    if (!element) return;
    element.addEventListener("scroll", updateScrollButtons, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollButtons);
    resizeObserver.observe(element);
    return () => {
      element.removeEventListener("scroll", updateScrollButtons);
      resizeObserver.disconnect();
    };
  }, [updateScrollButtons, showArrows]);

  useEffect(() => {
    updateScrollButtons();
  }, [children, updateScrollButtons]);

  const scrollByStep = (step: "previous" | "next") => {
    const element = scrollRef.current;
    if (!element) return;
    const amount = Math.max(Math.round(element.clientWidth * 0.8), 280);
    scrollHorizontally(
      element,
      step === "previous" ? "back" : "forward",
      amount,
      shouldReduceMotion ? "auto" : "smooth",
    );
  };

  const PreviousIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const trackClassName = cn(
    "flex gap-3 overflow-x-auto pb-4 pt-1 horizontal-scroller-scrollbar sm:gap-4 md:pb-5",
    showArrows
      ? "min-w-0 flex-1 snap-x snap-mandatory scroll-px-2"
      : "-mx-2 snap-x snap-mandatory px-2",
    className,
  );

  const arrowButtonClassName =
    "hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary text-primary-foreground shadow-md transition-opacity hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none md:inline-flex";

  if (!showArrows) {
    return (
      <div dir={direction}>
        <div
          ref={scrollRef}
          dir={direction}
          className={trackClassName}
          aria-label={ariaLabel}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className="-mx-4 flex items-center gap-1 px-4 md:gap-2"
      dir={direction}
    >
      <button
        type="button"
        onClick={() => scrollByStep("previous")}
        aria-label={t("home.scroller.scrollPrevious", { label: ariaLabel })}
        aria-hidden={!canScrollPrevious}
        disabled={!canScrollPrevious}
        tabIndex={canScrollPrevious ? 0 : -1}
        className={cn(arrowButtonClassName, !canScrollPrevious && "invisible")}
      >
        <PreviousIcon className="h-4 w-4" aria-hidden />
      </button>

      <div
        ref={scrollRef}
        dir={direction}
        className={trackClassName}
        aria-label={ariaLabel}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scrollByStep("next")}
        aria-label={t("home.scroller.scrollNext", { label: ariaLabel })}
        aria-hidden={!canScrollNext}
        disabled={!canScrollNext}
        tabIndex={canScrollNext ? 0 : -1}
        className={cn(arrowButtonClassName, !canScrollNext && "invisible")}
      >
        <NextIcon className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
};

export default HorizontalScroller;
