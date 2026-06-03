import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Trophy, Users, Sparkles, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/useI18n";
import { cn } from "@/lib/utils";
import type { SessionVotes } from "../types/session.types";
import { SESSION_PAGE_VARIANTS } from "../constants/sessionPresentation";

interface SessionVoteProgressProps {
  votes: SessionVotes | null;
  prefersReducedMotion: boolean;
}

export function SessionVoteProgress({
  votes,
  prefersReducedMotion,
}: SessionVoteProgressProps) {
  const { t } = useI18n();

  if (!votes) return null;

  const totalMembers = Number.isFinite(votes.totalMembers) ? votes.totalMembers : 0;
  const submittedVotes = Number.isFinite(votes.submittedVotes)
    ? votes.submittedVotes
    : 0;
  const progressPercent =
    totalMembers > 0
      ? Math.min(100, Math.round((submittedVotes / totalMembers) * 100))
      : 0;
  const isComplete = totalMembers > 0 && submittedVotes >= totalMembers;
  const hasWinner = Boolean(votes.winningVenueId);
  const progressLabel = t("session.page.votes.progress", {
    submitted: submittedVotes,
    total: totalMembers,
  });

  return (
    <motion.div
      variants={SESSION_PAGE_VARIANTS}
      initial="hidden"
      animate="visible"
      transition={{ duration: prefersReducedMotion ? 0.01 : 0.28 }}
      className={cn(
        "rounded-2xl border px-4 py-4 space-y-3 transition-all duration-500",
        hasWinner
          ? "border-[hsl(38,42%,58%)]/50 bg-gradient-to-r from-[hsl(38,42%,58%)]/8 to-[hsl(38,55%,50%)]/5"
          : isComplete
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-border/60 bg-card/80",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {hasWinner ? (
              <motion.div
                key="trophy"
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                <Trophy className="h-4 w-4 text-[hsl(38,42%,52%)]" />
              </motion.div>
            ) : isComplete ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Sparkles className="h-4 w-4 text-emerald-500" />
              </motion.div>
            ) : (
              <Users key="users" className="h-4 w-4 text-muted-foreground" />
            )}
          </AnimatePresence>
          <p className="text-sm font-semibold text-foreground">
            {t("session.page.votes.title")}
          </p>
        </div>

        {/* Vote pills */}
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.max(totalMembers, 1) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: i * 0.05,
                duration: prefersReducedMotion ? 0 : 0.25,
                type: "spring",
                stiffness: 300,
              }}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors duration-500",
                i < submittedVotes
                  ? hasWinner
                    ? "bg-[hsl(38,42%,52%)]"
                    : "bg-emerald-500"
                  : "bg-muted-foreground/25",
              )}
            />
          ))}
          <span className="ml-1.5 text-xs font-semibold tabular-nums text-muted-foreground">
            {submittedVotes}/{totalMembers}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn(
            "h-full rounded-full transition-colors duration-500",
            hasWinner
              ? "bg-gradient-to-r from-[hsl(38,55%,45%)] to-[hsl(38,42%,62%)]"
              : isComplete
                ? "bg-emerald-500"
                : "bg-[hsl(216,50%,28%)] dark:bg-[hsl(38,42%,58%)]",
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.55, ease: "easeOut" }}
        />
      </div>

      <p
        className={cn(
          "text-xs font-medium",
          hasWinner
            ? "text-[hsl(38,42%,45%)] dark:text-[hsl(38,42%,68%)]"
            : isComplete
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground",
        )}
      >
        {hasWinner
          ? t("session.page.votes.finalized")
          : isComplete
            ? t("session.page.votes.waitingHost")
            : progressLabel}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Winner Banner — shown above the cards grid once a winner is declared
───────────────────────────────────────────────────────────────────────────── */
interface WinnerBannerProps {
  winnerName: string;
  winnerAddress?: string;
  winnerImageUrl?: string;
  prefersReducedMotion: boolean;
}

export function WinnerBanner({
  winnerName,
  winnerAddress,
  winnerImageUrl,
  prefersReducedMotion,
}: WinnerBannerProps) {
  const { t } = useI18n();

  return (
    <motion.div
      key="winner-banner"
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: prefersReducedMotion ? 0.01 : 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="relative overflow-hidden rounded-2xl border-2 border-[hsl(38,42%,58%)]/60 bg-gradient-to-br from-[hsl(38,55%,55%)]/12 via-[hsl(38,42%,58%)]/6 to-transparent shadow-[0_0_32px_hsl(38,42%,58%,0.22)]"
    >
      {/* Decorative shimmer */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(38,42%,58%)]/10 to-transparent" />

      <div className="flex items-center gap-4 p-4 sm:p-5">
        {/* Trophy icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.15,
            type: "spring",
            stiffness: 260,
            damping: 15,
            duration: prefersReducedMotion ? 0 : undefined,
          }}
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(38,55%,50%)] to-[hsl(38,42%,62%)] shadow-lg"
        >
          <Trophy className="h-7 w-7 text-white" />
        </motion.div>

        {/* Winner info */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[hsl(38,42%,45%)] dark:text-[hsl(38,42%,68%)]">
            {t("session.page.votes.winner")}
          </p>
          <h2 className="truncate text-lg font-bold text-foreground sm:text-xl">
            {winnerName}
          </h2>
          {winnerAddress && (
            <p className="truncate text-xs text-muted-foreground">{winnerAddress}</p>
          )}
        </div>

        {/* Venue thumbnail */}
        {winnerImageUrl && (
          <div className="hidden h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl sm:block">
            <img
              src={winnerImageUrl}
              alt={winnerName}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Party icon */}
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : { rotate: [0, -12, 12, -8, 8, 0] }
          }
          transition={{ delay: 0.4, duration: 0.7, ease: "easeInOut" }}
          className="hidden flex-shrink-0 sm:block"
        >
          <PartyPopper className="h-6 w-6 text-[hsl(38,42%,52%)]" />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Session Ended View
───────────────────────────────────────────────────────────────────────────── */
interface SessionEndedViewProps {
  prefersReducedMotion: boolean;
  copy: {
    title: string;
    subtitle: string;
    back: string;
  };
  onBackHome: () => void;
}

export function SessionEndedView({
  prefersReducedMotion,
  copy,
  onBackHome,
}: SessionEndedViewProps) {
  return (
    <motion.div
      key="ended"
      variants={SESSION_PAGE_VARIANTS}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: prefersReducedMotion ? 0.01 : 0.32 }}
      className="mx-auto max-w-lg px-4 py-16 text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.1,
          type: "spring",
          stiffness: 240,
          damping: 18,
          duration: prefersReducedMotion ? 0 : undefined,
        }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/20"
      >
        <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: prefersReducedMotion ? 0 : 0.35 }}
        className="space-y-2"
      >
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {copy.title}
        </h1>
        <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: prefersReducedMotion ? 0 : 0.3 }}
      >
        <Button
          onClick={onBackHome}
          className="h-11 rounded-2xl px-8 font-semibold"
        >
          {copy.back}
        </Button>
      </motion.div>
    </motion.div>
  );
}
