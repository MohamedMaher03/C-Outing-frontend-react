import { motion } from "framer-motion";
import { MapPin, Star, Banknote, Tag } from "lucide-react";
import { useI18n } from "@/components/i18n/useI18n";
import type { SessionRecommendation } from "../types/session.types";
import { MOTION_EASE_OUT_QUART } from "../constants/sessionPresentation";

interface RecommendationCardProps {
  recommendation: SessionRecommendation;
  rankIndex: number;
  onOpen: () => void;
}

export function RecommendationCard({
  recommendation,
  rankIndex,
  onOpen,
}: RecommendationCardProps) {
  const { t } = useI18n();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: rankIndex * 0.07,
        duration: 0.4,
        ease: MOTION_EASE_OUT_QUART,
      }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md cursor-pointer"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => event.key === "Enter" && onOpen()}
      aria-label={t("session.page.recs.cardAria", { name: recommendation.name })}
    >
      <div className="relative h-36 overflow-hidden bg-muted sm:h-44">
        {recommendation.imageUrl ? (
          <img
            src={recommendation.imageUrl}
            alt={recommendation.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[hsl(216,50%,16%)]/12 to-[hsl(38,42%,58%)]/12">
            <MapPin className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        {recommendation.category && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {recommendation.category}
          </span>
        )}
        <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(38,42%,58%)] text-xs font-bold text-white shadow-md">
          #{rankIndex + 1}
        </span>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground leading-snug">
          {recommendation.name}
        </h3>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{recommendation.address}</span>
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {typeof recommendation.rating === "number" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              <Star className="h-3 w-3 fill-current" />
              {recommendation.rating.toFixed(2)}
            </span>
          )}
          {recommendation.priceRange && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              <Banknote className="h-3 w-3" />
              {recommendation.priceRange}
            </span>
          )}
          {recommendation.atmosphereTags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
