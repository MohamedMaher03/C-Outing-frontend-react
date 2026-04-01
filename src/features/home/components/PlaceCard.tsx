import { Heart, MapPin, Star, Clock, Wifi, Navigation } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import type { PlaceCardProps } from "@/features/home/types";
import { getDistanceDisplayState } from "@/features/home/utils/distance";
import { PRICE_LEVEL_META } from "@/utils/priceLevels";
import { motion, useReducedMotion } from "framer-motion";

const TOP_RATED_MIN_RATING = 4.7;

const toSafeNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const PlaceCard = ({
  place,
  variant = "grid",
  userLocation,
  onToggleSave,
  isSavePending = false,
  hideTopRatedBadge = false,
  onClick,
}: PlaceCardProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [isImageBroken, setIsImageBroken] = useState(false);
  const isHorizontal = variant === "horizontal";
  const rating = toSafeNumber(place.rating);
  const reviewCount = toSafeNumber(place.reviewCount);
  const safeName = place.name?.trim() || "Untitled venue";
  const safeAddress = place.address?.trim() || "Address unavailable";
  const safeTagList = (place.atmosphereTags ?? [])
    .filter((tag): tag is string => typeof tag === "string")
    .slice(0, 2);
  const ratingDisplay = Number.isFinite(rating) ? rating.toFixed(1) : "0.0";
  const reviewCountDisplay = useMemo(
    () =>
      Number.isFinite(reviewCount)
        ? new Intl.NumberFormat().format(Math.max(0, reviewCount))
        : "0",
    [reviewCount],
  );
  const isTopRated = rating >= TOP_RATED_MIN_RATING;
  const cardAriaLabel = `View ${safeName} rated ${ratingDisplay}`;
  const distanceState = getDistanceDisplayState(
    userLocation,
    place.latitude,
    place.longitude,
  );
  const priceMeta = place.priceLevel
    ? PRICE_LEVEL_META[place.priceLevel]
    : null;

  const distanceClassName = cn(
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
    distanceState.kind === "distance" &&
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    distanceState.kind === "locating" &&
      "border-border bg-muted/70 text-muted-foreground",
    distanceState.kind === "permission-denied" &&
      "border-secondary/40 bg-secondary/10 text-foreground",
    (distanceState.kind === "unsupported" ||
      distanceState.kind === "position-unavailable" ||
      distanceState.kind === "error" ||
      distanceState.kind === "place-coordinates-missing") &&
      "border-border bg-muted/60 text-muted-foreground",
  );

  return (
    <motion.div
      onClick={() => onClick?.(place.id)}
      role="button"
      tabIndex={0}
      aria-label={cardAriaLabel}
      whileHover={
        shouldReduceMotion
          ? undefined
          : { y: -3, transition: { duration: 0.2, ease: [0.25, 1, 0.5, 1] } }
      }
      whileTap={
        shouldReduceMotion
          ? undefined
          : { scale: 0.99, transition: { duration: 0.1 } }
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(place.id);
        }
      }}
      className={cn(
        "group/place relative bg-card rounded-2xl border border-border/60 overflow-hidden cursor-pointer",
        "transition-all duration-250 ease-out",
        "md:hover:shadow-lg md:hover:shadow-primary/5 md:hover:border-secondary/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
        "shadow-sm",
        isHorizontal
          ? "w-[clamp(15.5rem,78vw,20rem)] sm:w-[18.25rem] flex-shrink-0"
          : "w-full",
      )}
    >
      {/* Top Rated Badge */}
      {isTopRated && !hideTopRatedBadge && (
        <div
          className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-cream/35 bg-primary/95 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-cream shadow-lg shadow-black/35 backdrop-blur-sm"
          title={`Top Rated appears when rating is ${TOP_RATED_MIN_RATING.toFixed(1)} or higher.`}
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-secondary/20">
            <Star className="h-2.5 w-2.5 fill-secondary text-secondary" />
          </span>
          TOP RATED
        </div>
      )}

      {/* Image */}
      <div
        className={cn(
          "relative overflow-hidden",
          isHorizontal ? "h-40" : "h-48",
        )}
      >
        <img
          src={isImageBroken ? "" : place.image}
          alt={safeName}
          className="h-full w-full object-cover transition-transform duration-500 ease-out md:group-hover/place:scale-105"
          loading="lazy"
          onError={() => setIsImageBroken(true)}
        />
        {isImageBroken && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/70 px-4 text-center">
            <span className="text-sm font-semibold text-muted-foreground break-words">
              Image unavailable
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/65 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Save Button */}
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.(place.id);
          }}
          aria-label={
            place.isSaved ? "Remove from favorites" : "Add to favorites"
          }
          aria-pressed={place.isSaved}
          aria-busy={isSavePending}
          disabled={isSavePending}
          whileHover={
            shouldReduceMotion
              ? undefined
              : { scale: 1.05, transition: { duration: 0.16 } }
          }
          whileTap={
            shouldReduceMotion
              ? undefined
              : { scale: 0.92, transition: { duration: 0.1 } }
          }
          className={cn(
            "absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2.5 transition-all duration-200",
            "backdrop-blur-md border border-white/20",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-black/40",
            isSavePending && "opacity-85",
            place.isSaved
              ? "bg-destructive/90 text-destructive-foreground shadow-sm"
              : "bg-card/80 text-foreground hover:bg-card hover:shadow-sm",
          )}
        >
          {isSavePending ? (
            <LoadingSpinner size="sm" className="scale-[0.78]" />
          ) : (
            <motion.span
              key={place.isSaved ? "saved" : "idle"}
              initial={false}
              animate={
                place.isSaved && !shouldReduceMotion
                  ? { scale: [1, 1.2, 1], rotate: [0, -10, 0] }
                  : { scale: 1, rotate: 0 }
              }
              transition={{
                duration: shouldReduceMotion ? 0.01 : 0.28,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-all",
                  place.isSaved
                    ? "fill-destructive-foreground text-destructive-foreground"
                    : "text-foreground group-hover/place:text-destructive/80",
                )}
              />
            </motion.span>
          )}
        </motion.button>

        {/* Rating Badge */}
        <Badge className="absolute bottom-3 left-3 border-0 bg-card/95 px-2.5 py-1 font-semibold text-foreground shadow-sm backdrop-blur-md gap-1">
          <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
          {ratingDisplay}
          <span className="text-muted-foreground font-normal ml-0.5">
            ({reviewCountDisplay})
          </span>
        </Badge>

        {/* Wi-Fi badge */}
        {place.hasWifi && (
          <Badge className="absolute bottom-3 right-3 border-0 bg-card/90 px-2 py-1 text-foreground shadow-sm backdrop-blur-md gap-1">
            <Wifi className="h-3 w-3 text-muted-foreground" />
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2 p-4 sm:p-5">
        <h3
          className="text-sm font-semibold leading-tight text-foreground transition-colors line-clamp-2 break-words"
          title={safeName}
        >
          {safeName}
        </h3>

        {/* Address row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-role-micro text-muted-foreground min-w-0">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate" title={safeAddress}>
              {safeAddress}
            </span>
          </div>
          {place.isOpen !== undefined && (
            <div
              className={cn(
                "ml-1 flex flex-shrink-0 items-center gap-1 text-xs font-semibold",
                place.isOpen ? "text-emerald-600" : "text-muted-foreground",
              )}
            >
              <Clock className="h-3 w-3" />
              {place.isOpen ? "Open" : "Closed"}
            </div>
          )}
        </div>

        <div className={distanceClassName} aria-live="polite">
          <Navigation className="h-3 w-3" />
          <span>{distanceState.text}</span>
        </div>

        {/* Tags & price */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <div className="flex gap-1.5 overflow-hidden flex-1 min-w-0">
            {safeTagList.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/40 bg-muted/70 px-2.5 py-1 text-xs font-medium text-muted-foreground flex-shrink-0 max-w-[126px] truncate"
                title={tag}
              >
                {tag}
              </span>
            ))}
          </div>
          {/* Price Level */}
          {priceMeta && (
            <span
              className="ml-auto inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-secondary/20 bg-secondary/10 px-2.5 py-1 text-[11px] font-medium text-foreground"
              aria-label={`Budget level: ${priceMeta.label}`}
              title={`Budget level: ${priceMeta.label}`}
            >
              <span>{priceMeta.label}</span>
              <span className="text-[11px] font-semibold text-secondary/80">
                {priceMeta.symbol}
              </span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MemoizedPlaceCard = memo(PlaceCard);

MemoizedPlaceCard.displayName = "PlaceCard";

export default MemoizedPlaceCard;
