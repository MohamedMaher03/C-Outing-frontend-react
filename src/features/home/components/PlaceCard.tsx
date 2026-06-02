import { Star } from "lucide-react";
import { memo } from "react";
import { motion } from "framer-motion";
import type { PlaceCardProps } from "@/features/home/types";
import { usePlaceCard } from "@/features/home/hooks/usePlaceCard";
import { PlaceCardHero } from "@/features/home/components/place-card/PlaceCardHero";
import { PlaceCardBody } from "@/features/home/components/place-card/PlaceCardBody";

const PlaceCard = (props: PlaceCardProps) => {
  const viewModel = usePlaceCard(props);
  const {
    t,
    showTopRatedRibbon,
    topRatedThresholdLabel,
    cardAriaLabel,
    shellClassName,
    cardMotion,
    commitCardActivation,
    commitKeyboardActivation,
  } = viewModel;

  return (
    <motion.div
      onClick={commitCardActivation}
      role="button"
      tabIndex={0}
      aria-label={cardAriaLabel}
      whileHover={cardMotion.hover}
      whileTap={cardMotion.tap}
      onKeyDown={commitKeyboardActivation}
      className={shellClassName}
    >
      {showTopRatedRibbon && (
        <div
          className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-cream/35 bg-primary/95 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-cream shadow-lg shadow-black/35 backdrop-blur-sm"
          title={t("home.place.topRatedHint", { rating: topRatedThresholdLabel })}
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-secondary/20 dark:bg-primary-foreground/24">
            <Star className="h-2.5 w-2.5 fill-secondary text-secondary dark:fill-cream dark:text-cream" />
          </span>
          {t("home.place.topRatedBadge")}
        </div>
      )}
      <PlaceCardHero {...viewModel} />
      <PlaceCardBody {...viewModel} />
    </motion.div>
  );
};

const MemoizedPlaceCard = memo(PlaceCard);
MemoizedPlaceCard.displayName = "PlaceCard";

export default MemoizedPlaceCard;
