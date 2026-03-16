import { Heart, MapPin, Star, Clock, Wifi, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlaceCardProps } from "@/features/home/types";
import { getDistanceDisplayState } from "@/features/home/utils/distance";

/** Maps price level to dollar-sign shorthand */
const PRICE_SYMBOL: Record<string, string> = {
  price_cheapest: "$",
  cheap: "$$",
  mid_range: "$$$",
  expensive: "$$$$",
  luxury: "$$$$$",
};

const PlaceCard = ({
  place,
  variant = "grid",
  userLocation,
  onToggleSave,
  onClick,
}: PlaceCardProps) => {
  const isHorizontal = variant === "horizontal";
  const rating = typeof place.rating === "number" ? place.rating : 0;
  const reviewCount =
    typeof place.reviewCount === "number" ? place.reviewCount : 0;
  const isTopRated = rating >= 4.7;
  const distanceState = getDistanceDisplayState(
    userLocation,
    place.latitude,
    place.longitude,
  );

  const distanceClassName = cn(
    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
    distanceState.kind === "distance" &&
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    distanceState.kind === "locating" &&
      "border-slate-200 bg-slate-50 text-slate-600",
    distanceState.kind === "permission-denied" &&
      "border-amber-200 bg-amber-50 text-amber-700",
    (distanceState.kind === "unsupported" ||
      distanceState.kind === "position-unavailable" ||
      distanceState.kind === "error" ||
      distanceState.kind === "place-coordinates-missing") &&
      "border-border bg-muted/60 text-muted-foreground",
  );

  return (
    <div
      onClick={() => onClick?.(place.id)}
      role="button"
      tabIndex={0}
      aria-label={`View ${place.name} — rated ${rating}`}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(place.id)}
      className={cn(
        "group relative bg-white rounded-2xl border border-border/60 overflow-hidden cursor-pointer",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 hover:border-secondary/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
        "shadow-md",
        isHorizontal ? "w-[280px] flex-shrink-0" : "w-full",
      )}
    >
      {/* Top Rated Badge */}
      {isTopRated && (
        <div className="absolute top-3 left-3 z-10 bg-secondary text-primary px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg">
          <Star className="h-3 w-3 fill-current" />
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
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Save Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.(place.id);
          }}
          aria-label={
            place.isSaved ? "Remove from favorites" : "Add to favorites"
          }
          className={cn(
            "absolute top-3 right-3 p-2.5 rounded-full transition-all duration-200",
            "backdrop-blur-md border border-white/20",
            place.isSaved
              ? "bg-destructive/90 text-white shadow-lg"
              : "bg-white/70 hover:bg-white text-foreground hover:shadow-lg",
          )}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-all",
              place.isSaved
                ? "fill-white text-white scale-110"
                : "text-foreground group-hover:text-destructive",
            )}
          />
        </button>

        {/* Rating Badge */}
        <Badge className="absolute bottom-3 left-3 bg-white/95 text-foreground backdrop-blur-md border-0 gap-1 font-bold shadow-md px-2.5 py-1">
          <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
          {rating}
          <span className="text-muted-foreground font-normal ml-0.5">
            ({reviewCount.toLocaleString()})
          </span>
        </Badge>

        {/* Wi-Fi badge */}
        {place.hasWifi && (
          <Badge className="absolute bottom-3 right-3 bg-white/90 text-foreground backdrop-blur-md border-0 gap-1 shadow-md px-2 py-1">
            <Wifi className="h-3 w-3 text-blue-500" />
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-1 group-hover:text-secondary transition-colors">
          {place.name}
        </h3>

        {/* Address row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs min-w-0">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{place.address}</span>
          </div>
          {place.isOpen !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-[10px] font-semibold flex-shrink-0 ml-1",
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
        <div className="flex items-center gap-1.5 pt-0.5">
          <div className="flex gap-1.5 overflow-hidden flex-1 min-w-0">
            {(place.atmosphereTags ?? []).slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2.5 py-0.5 rounded-full bg-muted/70 text-muted-foreground font-medium border border-border/40 flex-shrink-0"
              >
                {tag}
              </span>
            ))}
          </div>
          {/* Price Level */}
          {place.priceLevel && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-bold border border-secondary/20 flex-shrink-0 ml-auto">
              {PRICE_SYMBOL[place.priceLevel] ?? "?"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
