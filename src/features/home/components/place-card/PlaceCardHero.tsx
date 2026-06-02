import { Heart, Star, Wifi } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import type { usePlaceCard } from "@/features/home/hooks/usePlaceCard";

type PlaceCardHeroProps = Pick<
  ReturnType<typeof usePlaceCard>,
  | "t"
  | "place"
  | "isSavePending"
  | "venueName"
  | "ratingLabel"
  | "reviewCountLabel"
  | "activeImageSrc"
  | "isImageMissing"
  | "heroHeightClass"
  | "favoriteAriaLabel"
  | "cardMotion"
  | "commitFavoriteToggle"
  | "commitImageFallback"
>;

export const PlaceCardHero = ({
  t,
  place,
  isSavePending,
  venueName,
  ratingLabel,
  reviewCountLabel,
  activeImageSrc,
  isImageMissing,
  heroHeightClass,
  favoriteAriaLabel,
  cardMotion,
  commitFavoriteToggle,
  commitImageFallback,
}: PlaceCardHeroProps) => (
  <div className={cn("relative overflow-hidden", heroHeightClass)}>
    {activeImageSrc && (
      <img
        src={activeImageSrc}
        alt={venueName}
        className="h-full w-full object-cover transition-transform duration-500 ease-out md:group-hover/place:scale-105"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={commitImageFallback}
      />
    )}

    {isImageMissing && (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/70 px-4 text-center">
        <span className="text-sm font-semibold text-muted-foreground break-words">
          {t("home.place.imageUnavailable")}
        </span>
      </div>
    )}

    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/65 via-black/30 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

    <motion.button
      type="button"
      onClick={commitFavoriteToggle}
      aria-label={favoriteAriaLabel}
      aria-pressed={place.isSaved}
      aria-busy={isSavePending}
      disabled={isSavePending}
      whileHover={cardMotion.favoriteHover}
      whileTap={cardMotion.favoriteTap}
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
          animate={place.isSaved ? cardMotion.heartPulse : { scale: 1, rotate: 0 }}
          transition={cardMotion.heartTransition}
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

    <Badge className="absolute bottom-3 left-3 border-0 bg-card/95 px-2.5 py-1 font-semibold text-foreground shadow-sm backdrop-blur-md gap-1">
      <Star className="h-3.5 w-3.5 fill-secondary text-secondary dark:fill-primary dark:text-primary" />
      {ratingLabel}
      <span className="text-muted-foreground font-normal ml-0.5">
        ({reviewCountLabel})
      </span>
    </Badge>

    {place.hasWifi && (
      <Badge className="absolute bottom-3 right-3 border-0 bg-card/90 px-2 py-1 text-foreground shadow-sm backdrop-blur-md gap-1">
        <Wifi className="h-3 w-3 text-muted-foreground dark:text-foreground/95" />
      </Badge>
    )}
  </div>
);
