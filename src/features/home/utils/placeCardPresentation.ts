import { cn } from "@/lib/utils";
import type { DistanceDisplayState } from "@/features/home/utils/distance";
import { PRICE_LEVEL_META } from "@/utils/priceLevels";
import type { CanonicalPriceLevel } from "@/utils/priceLevels";

export const VENUE_TOP_RATED_THRESHOLD = 4.7;

type TranslateFn = (
  key: string,
  params?: Record<string, string | number>,
  fallback?: string,
) => string;

export interface VenueImageRetryState {
  sourceKey: string;
  index: number;
}

export const coerceFiniteMetric = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

export const resolveVenueOpenLabel = (
  isOpen: boolean | null | undefined,
  t: TranslateFn,
): string => {
  const openStatusKey =
    isOpen === true
      ? "home.place.open"
      : isOpen === false
        ? "home.place.closed"
        : "home.place.unknown";
  return t(openStatusKey);
};

const DISTANCE_STATUS_I18N: Record<
  Exclude<DistanceDisplayState["kind"], "distance">,
  string
> = {
  locating: "home.distance.locating",
  "permission-denied": "home.distance.permissionDenied",
  unsupported: "home.distance.unsupported",
  "position-unavailable": "home.distance.positionUnavailable",
  error: "home.distance.error",
  "place-coordinates-missing": "home.distance.unavailable",
};

const formatDistanceKmCaption = (
  distanceKm: number,
  t: TranslateFn,
  formatNumber: (value: number) => string,
): string => {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return t("home.distance.unavailable");
  }
  if (distanceKm < 1) {
    return t("home.distance.metersAway", {
      distance: formatNumber(Math.max(1, Math.round(distanceKm * 1000))),
    });
  }
  if (distanceKm < 10) {
    return t("home.distance.kmAway", {
      distance: formatNumber(Number(distanceKm.toFixed(1))),
    });
  }
  return t("home.distance.kmAway", {
    distance: formatNumber(Math.round(distanceKm)),
  });
};

export const resolveDistanceCaption = (
  distanceState: DistanceDisplayState,
  t: TranslateFn,
  formatNumber: (value: number) => string,
): string =>
  distanceState.kind === "distance"
    ? formatDistanceKmCaption(distanceState.valueKm, t, formatNumber)
    : t(DISTANCE_STATUS_I18N[distanceState.kind]);

const DISTANCE_CHIP_TONE: Record<DistanceDisplayState["kind"], string> = {
  distance: "border-emerald-200 bg-emerald-50 text-emerald-700",
  locating: "border-border bg-muted/70 text-muted-foreground",
  "permission-denied": "border-secondary/40 bg-secondary/10 text-foreground",
  unsupported: "border-border bg-muted/60 text-muted-foreground",
  "position-unavailable": "border-border bg-muted/60 text-muted-foreground",
  error: "border-border bg-muted/60 text-muted-foreground",
  "place-coordinates-missing": "border-border bg-muted/60 text-muted-foreground",
};

export const resolveDistanceChipClass = (
  distanceState: DistanceDisplayState,
): string =>
  cn(
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
    DISTANCE_CHIP_TONE[distanceState.kind],
  );

export const qualifyAsTopRatedVenue = (rating: number): boolean =>
  rating >= VENUE_TOP_RATED_THRESHOLD;

export const pickAtmosphereTags = (
  tags: string[] | undefined,
  limit = 2,
): string[] =>
  (tags ?? []).filter((tag): tag is string => typeof tag === "string").slice(0, limit);

export const resolvePriceBandMeta = (priceLevel: CanonicalPriceLevel | undefined) =>
  priceLevel ? PRICE_LEVEL_META[priceLevel] : null;

export const resolveActiveImageIndex = (
  retryState: VenueImageRetryState,
  sourceKey: string,
): number => (retryState.sourceKey === sourceKey ? retryState.index : 0);

export const advanceImageRetry = (
  retryState: VenueImageRetryState,
  sourceKey: string,
  candidateCount: number,
): VenueImageRetryState => {
  const currentIndex =
    retryState.sourceKey === sourceKey ? retryState.index : 0;
  return {
    sourceKey,
    index: Math.min(currentIndex + 1, candidateCount),
  };
};

export const buildVenueCardShellClass = (isHorizontal: boolean): string =>
  cn(
    "group/place relative bg-card rounded-2xl border border-border/60 overflow-hidden cursor-pointer",
    "transition-all duration-250 ease-out",
    "md:hover:shadow-lg md:hover:shadow-primary/5 md:hover:border-secondary/20",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
    "shadow-sm flex flex-col h-full",
    isHorizontal
      ? "w-[clamp(15.5rem,78vw,20rem)] sm:w-[18.25rem] flex-shrink-0"
      : "w-full",
  );

const OPEN_STATUS_TONE: Record<string, string> = {
  open: "text-emerald-600 dark:text-emerald-300",
  closed: "text-muted-foreground dark:text-foreground/75",
  unknown: "text-amber-700 dark:text-amber-300",
};

export const resolveOpenStatusTone = (
  isOpen: boolean | null | undefined,
): string => {
  const toneKey =
    isOpen === true ? "open" : isOpen === false ? "closed" : "unknown";
  return OPEN_STATUS_TONE[toneKey];
};
