import { motion } from "framer-motion";
import { Sparkles, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  Session,
  SessionRecommendation,
  RecommendationCount,
  SessionStatus,
} from "../types/session.types";
import { SESSION_PAGE_VARIANTS } from "../constants/sessionPresentation";
import { MemberAvatar } from "./MemberAvatar";
import { RecommendationCard } from "./RecommendationCard";
import { RecommendationCountSelector } from "./RecommendationCountSelector";

interface SessionRecommendationsViewProps {
  session: Session | null;
  recommendations: SessionRecommendation[] | null;
  status: SessionStatus;
  isHost: boolean;
  recommendationCount: RecommendationCount;
  error: string | null;
  prefersReducedMotion: boolean;
  leaveActionLabel: string;
  copy: {
    badge: string;
    title: string;
    subtitle: string;
    refresh: string;
    forLabel: string;
    emptyTitle: string;
    emptySubtitle: string;
  };
  onRefresh: () => void;
  onExitSession: () => void;
  onRecCountChange: (count: RecommendationCount) => void;
  onOpenVenue: (venueId: string) => void;
}

export function SessionRecommendationsView({
  session,
  recommendations,
  status,
  isHost,
  leaveActionLabel,
  error,
  prefersReducedMotion,
  recommendationCount,
  copy,
  onRefresh,
  onExitSession,
  onRecCountChange,
  onOpenVenue,
}: SessionRecommendationsViewProps) {
  const memberFirstNames =
    session?.members.map((member) => member.name.split(" ")[0]).join(", ") ??
    "";

  return (
    <motion.div
      key="recommendations"
      variants={SESSION_PAGE_VARIANTS}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: prefersReducedMotion ? 0.01 : 0.32 }}
      className="mx-auto max-w-4xl px-4 py-8 space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[hsl(38,42%,45%)] dark:text-[hsl(38,42%,68%)]">
            {copy.badge}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {copy.title}
          </h1>
          <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {isHost && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-9 rounded-full px-4 text-xs font-semibold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {copy.refresh}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void onExitSession()}
            className="h-9 rounded-full border-destructive/30 px-4 text-xs font-semibold text-destructive hover:bg-destructive/5"
          >
            <LogOut className="h-3.5 w-3.5" />
            {leaveActionLabel}
          </Button>
        </div>
      </div>

      {session && (
        <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-card/80 px-4 py-3">
          <div className="flex -space-x-2">
            {session.members.slice(0, 5).map((member) => (
              <MemberAvatar
                key={member.id}
                member={member}
                isHost={member.id === session.host.id}
                size="sm"
              />
            ))}
            {session.members.length > 5 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-bold text-muted-foreground">
                +{session.members.length - 5}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {copy.forLabel}{" "}
            <span className="font-semibold text-foreground">
              {memberFirstNames}
            </span>
          </p>
        </div>
      )}

      <RecommendationCountSelector
        value={recommendationCount}
        disabled={status === "loading-recs"}
        onChange={onRecCountChange}
      />

      {recommendations?.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              rankIndex={index}
              onOpen={() => onOpenVenue(recommendation.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border/70 bg-card/70 py-16 text-center">
          <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">{copy.emptyTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {copy.emptySubtitle}
          </p>
        </div>
      )}

      {error && (
        <div
          className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}
    </motion.div>
  );
}
