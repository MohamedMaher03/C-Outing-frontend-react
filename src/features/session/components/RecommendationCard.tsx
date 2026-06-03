import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Star, Banknote, Tag, ThumbsUp, Trophy, Check } from "lucide-react";
import { useI18n } from "@/components/i18n/useI18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionRecommendation } from "../types/session.types";
import { MOTION_EASE_OUT_QUART } from "../constants/sessionPresentation";

interface RecommendationCardProps {
  recommendation: SessionRecommendation;
  rankIndex: number;
  voteCount?: number;
  isMyVote?: boolean;
  isWinner?: boolean;
  votingDisabled?: boolean;
  isSubmittingVote?: boolean;
  onOpen: () => void;
  onVote?: () => void;
}

export function RecommendationCard({
  recommendation,
  rankIndex,
  voteCount = 0,
  isMyVote = false,
  isWinner = false,
  votingDisabled = false,
  isSubmittingVote = false,
  onOpen,
  onVote,
}: RecommendationCardProps) {
  const { t } = useI18n();
  // Show vote button while voting is open (not yet finalized)
  const showVoteControls = Boolean(onVote) && !votingDisabled;
  // Show persistent voted badge when user has voted (even when showVoteControls is false after finalize)
  const showVotedBadge = isMyVote && votingDisabled;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: rankIndex * 0.07,
        duration: 0.4,
        ease: MOTION_EASE_OUT_QUART,
      }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300",
        isWinner
          ? "border-[hsl(38,42%,58%)] ring-2 ring-[hsl(38,42%,58%)]/40 shadow-[0_0_20px_hsl(38,42%,58%,0.18)]"
          : isMyVote
            ? "border-emerald-500/50 ring-2 ring-emerald-500/20 shadow-[0_0_16px_hsl(152,56%,40%,0.12)]"
            : "border-border/60 hover:shadow-md",
      )}
    >
      {/* Winner glow overlay */}
      {isWinner && (
        <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-gradient-to-br from-[hsl(38,42%,58%)]/8 to-transparent" />
      )}

      {/* Image area */}
      <div
        className="relative h-36 overflow-hidden bg-muted sm:h-44 cursor-pointer"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => event.key === "Enter" && onOpen()}
        aria-label={t("session.page.recs.cardAria", { name: recommendation.name })}
      >
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

        {/* Category badge */}
        {recommendation.category && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {recommendation.category}
          </span>
        )}

        {/* Rank badge */}
        <span
          className={cn(
            "absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-md",
            isWinner
              ? "bg-[hsl(38,42%,52%)] ring-2 ring-white/30"
              : "bg-[hsl(38,42%,58%)]",
          )}
        >
          #{rankIndex + 1}
        </span>

        {/* Winner trophy banner */}
        {isWinner && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease: MOTION_EASE_OUT_QUART }}
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[hsl(38,55%,45%)] to-[hsl(38,42%,60%)] py-2 text-[12px] font-bold text-white shadow-lg"
          >
            <Trophy className="h-3.5 w-3.5 fill-white/30" />
            {t("session.page.votes.winner")}
          </motion.span>
        )}

        {/* Vote count badge (non-winner) */}
        {(voteCount > 0 || isMyVote) && !isWinner && (
          <span
            className={cn(
              "absolute left-3 bottom-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm",
              isMyVote
                ? "bg-emerald-500 shadow-md backdrop-blur-none"
                : "bg-black/60",
            )}
          >
            {isMyVote && <Check className="h-3 w-3" />}
            {t("session.page.votes.count", { count: voteCount })}
          </span>
        )}

        {/* Winner vote count */}
        {voteCount > 0 && isWinner && (
          <span className="absolute right-3 bottom-10 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {t("session.page.votes.count", { count: voteCount })}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 space-y-2">
        <h3
          className="font-semibold text-foreground leading-snug cursor-pointer"
          onClick={onOpen}
        >
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

        {/* ── Vote button (while voting is open) ── */}
        <AnimatePresence mode="wait">
          {showVoteControls && (
            <motion.div
              key="vote-btn"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {isMyVote ? (
                /* Voted state — always visible, green pill */
                <div className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-xs font-bold text-white shadow-sm">
                  <Check className="h-4 w-4" />
                  {t("session.page.votes.voted")}
                </div>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isSubmittingVote}
                  onClick={(event) => {
                    event.stopPropagation();
                    onVote?.();
                  }}
                  className={cn(
                    "mt-2 h-9 w-full rounded-xl text-xs font-semibold transition-all duration-200",
                    "border-[hsl(216,50%,28%)]/40 text-[hsl(216,50%,28%)] hover:bg-[hsl(216,50%,28%)] hover:text-white hover:border-[hsl(216,50%,28%)]",
                    "dark:border-[hsl(38,42%,58%)]/50 dark:text-[hsl(38,42%,68%)] dark:hover:bg-[hsl(38,42%,58%)] dark:hover:text-white dark:hover:border-[hsl(38,42%,58%)]",
                    isSubmittingVote && "animate-pulse cursor-wait",
                  )}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {isSubmittingVote
                    ? t("session.page.votes.voting")
                    : t("session.page.votes.vote")}
                </Button>
              )}
            </motion.div>
          )}

          {/* ── Post-finalize: show my vote badge in body ── */}
          {showVotedBadge && (
            <motion.div
              key="voted-badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400"
            >
              <Check className="h-4 w-4" />
              {t("session.page.votes.myVote")}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
