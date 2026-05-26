import { useEffect, useCallback, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Users,
  Copy,
  Check,
  Crown,
  LogOut,
  Sparkles,
  ArrowLeft,
  Share2,
  Loader2,
  MapPin,
  Star,
  Banknote,
  Tag,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "../hooks/useSession";
import type {
  SessionMember,
  SessionRecommendation,
} from "../types/session.types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useI18n } from "@/components/i18n/useI18n";
import { cn } from "@/lib/utils";

// ── Easing helpers ────────────────────────────────────────────
const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as [number, number, number, number];

// ── Avatar helpers ────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-[hsl(216,50%,28%)]",
  "bg-[hsl(38,42%,52%)]",
  "bg-[hsl(199,55%,40%)]",
  "bg-[hsl(280,40%,45%)]",
  "bg-[hsl(160,45%,38%)]",
  "bg-[hsl(0,50%,45%)]",
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function MemberAvatar({
  member,
  isHost,
  size = "md",
}: {
  member: SessionMember;
  isHost: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-base",
  };
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative flex-shrink-0">
      {member.avatarUrl ? (
        <img
          src={member.avatarUrl}
          alt={member.name}
          className={cn(
            "rounded-full object-cover ring-2 ring-border/60",
            sizeClasses[size],
          )}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-border/60",
            getAvatarColor(member.id),
            sizeClasses[size],
          )}
        >
          {initials}
        </div>
      )}
      {isHost && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(38,42%,58%)] shadow-sm">
          <Crown className="h-2.5 w-2.5 text-white" />
        </span>
      )}
    </div>
  );
}

// ── Standalone copy button (used inside share panel) ─────────
function SessionCopyButton({ code }: { code: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? t("session.code.copied") : t("session.code.copy")}
    </button>
  );
}

// ── Standalone share button (used inside share panel) ─────────
function SessionShareButton({ code }: { code: string }) {
  const { t } = useI18n();
  const handleShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: t("session.share.title"),
          text: t("session.share.text", { code }),
        });
      } catch {
        /* cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        /* ignore */
      }
    }
  };
  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[hsl(38,42%,58%)] px-4 text-xs font-bold text-[hsl(216,50%,14%)] transition-colors hover:bg-[hsl(38,42%,66%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(38,42%,58%)]/60"
    >
      <Share2 className="h-3.5 w-3.5" />
      {t("session.code.share")}
    </button>
  );
}

function RecommendationCard({
  rec,
  index,
  onClick,
}: {
  rec: SessionRecommendation;
  index: number;
  onClick: () => void;
}) {
  const { t } = useI18n();
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: EASE_OUT_QUART }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={t("session.page.recs.cardAria", { name: rec.name })}
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden bg-muted sm:h-44">
        {rec.imageUrl ? (
          <img
            src={rec.imageUrl}
            alt={rec.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[hsl(216,50%,16%)]/12 to-[hsl(38,42%,58%)]/12">
            <MapPin className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        {rec.category && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {rec.category}
          </span>
        )}
        <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(38,42%,58%)] text-xs font-bold text-white shadow-md">
          #{index + 1}
        </span>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground leading-snug">
          {rec.name}
        </h3>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{rec.address}</span>
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {typeof rec.rating === "number" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              <Star className="h-3 w-3 fill-current" />
              {rec.rating.toFixed(2)}
            </span>
          )}
          {rec.priceRange && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              <Banknote className="h-3 w-3" />
              {rec.priceRange}
            </span>
          )}
          {rec.atmosphereTags?.slice(0, 2).map((tag) => (
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

// ── Page variants ─────────────────────────────────────────────
const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// ── Main Page ─────────────────────────────────────────────────
export default function SessionPage() {
  const { code } = useParams<{ code?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();
  const { t } = useI18n();

  const {
    status,
    session,
    recommendations,
    error,
    isHost,
    memberCount,
    isRestoring,
    leaveSession,
    getRecommendations,
    restoreSession,
    createSession,
    joinSession,
  } = useSession();

  // Guard: only run the action effect once
  const actionHandled = useRef(false);

  useEffect(() => {
    if (actionHandled.current || status !== "idle") return;

    const action = searchParams.get("action");

    if (action === "create") {
      actionHandled.current = true;
      void createSession();
      return;
    }

    if (action === "join") {
      const joinCode = searchParams.get("code") ?? "";
      if (joinCode) {
        actionHandled.current = true;
        void joinSession(joinCode);
        return;
      }
    }

    // No action param — restore from URL code if present
    if (code) {
      actionHandled.current = true;
      void restoreSession(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleLeave = useCallback(async () => {
    await leaveSession();
    navigate("/");
  }, [leaveSession, navigate]);

  const MAX_MEMBERS = 10;

  // ── Waiting Room ─────────────────────────────────────────────
  const renderWaitingRoom = () => (
    <motion.div
      key="waiting"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.32 }}
      className="mx-auto max-w-2xl px-4 py-8 space-y-5"
    >
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(216,50%,16%)] to-[hsl(216,50%,28%)] shadow-lg dark:from-[hsl(38,42%,52%)] dark:to-[hsl(38,42%,40%)]">
          <Users className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("session.page.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isHost
            ? t("session.page.subtitle.host")
            : t("session.page.subtitle.member")}
        </p>
      </div>

      {/* Creating spinner */}
      {status === "creating" && (
        <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-[hsl(38,42%,58%)]" />
          {t("session.page.creating")}
        </div>
      )}

      {session && (
        <>
          {/* Share panel — host only */}
          {isHost && (
            <div className="relative overflow-hidden rounded-3xl border border-[hsl(38,42%,58%)]/30 bg-gradient-to-br from-[hsl(216,50%,16%)] to-[hsl(216,50%,24%)] p-5 shadow-lg">
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[hsl(38,42%,58%)]/20 blur-2xl" />
              <div className="pointer-events-none absolute -left-4 bottom-0 h-16 w-16 rounded-full bg-[hsl(38,42%,58%)]/12 blur-xl" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-[hsl(38,42%,72%)]" />
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[hsl(38,42%,72%)]">
                    {t("session.page.share.title", { max: MAX_MEMBERS })}
                  </p>
                </div>
                {/* Code digits */}
                <div className="flex items-center justify-center gap-2">
                  {session.code.split("").map((digit, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: -10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: i * 0.06,
                        duration: 0.28,
                        ease: EASE_OUT_QUART,
                      }}
                      className="flex h-12 w-10 items-center justify-center rounded-xl border-2 border-[hsl(38,42%,58%)]/50 bg-white/8 text-xl font-bold tracking-widest text-white sm:h-14 sm:w-12 sm:text-2xl"
                    >
                      {digit}
                    </motion.span>
                  ))}
                </div>
                <p className="text-center text-xs text-white/60">
                  {t("session.page.share.hint")}
                </p>
                <div className="flex gap-2">
                  <SessionCopyButton code={session.code} />
                  <SessionShareButton code={session.code} />
                </div>
              </div>
            </div>
          )}

          {/* Non-host: read-only code badge */}
          {!isHost && (
            <div className="rounded-3xl border border-border/60 bg-card p-5 text-center space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {t("session.code.label")}
              </p>
              <p className="font-mono text-3xl font-bold tracking-[0.3em] text-foreground">
                {session.code}
              </p>
            </div>
          )}

          {/* Capacity bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">
                {t("session.page.members.label")}
              </span>
              <span
                className={
                  memberCount >= MAX_MEMBERS
                    ? "text-destructive"
                    : "text-foreground"
                }
              >
                {memberCount} / {MAX_MEMBERS}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  memberCount >= MAX_MEMBERS
                    ? "bg-destructive"
                    : memberCount >= 7
                      ? "bg-amber-500"
                      : "bg-[hsl(38,42%,58%)]",
                )}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min((memberCount / MAX_MEMBERS) * 100, 100)}%`,
                }}
                transition={{ duration: 0.5, ease: EASE_OUT_QUART }}
              />
            </div>
            {memberCount >= MAX_MEMBERS && (
              <p className="text-xs text-destructive font-medium">
                {t("session.page.members.full")}
              </p>
            )}
          </div>

          {/* Member list */}
          <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                {t("session.page.members.listTitle")}
              </p>
              {isHost && memberCount === 1 && (
                <p className="text-[11px] text-muted-foreground">
                  {t("session.page.members.waiting")}
                </p>
              )}
            </div>
            <div className="divide-y divide-border/40">
              <AnimatePresence initial={false}>
                {session.members.map((member, i) => {
                  const isMemberHost = member.id === session.host.id;
                  const isMe = member.id === user?.userId;
                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{
                        delay: i * 0.04,
                        duration: 0.22,
                        ease: EASE_OUT_QUART,
                      }}
                      className="flex items-center gap-3 px-5 py-3.5"
                    >
                      <MemberAvatar
                        member={member}
                        isHost={isMemberHost}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {member.name}
                          {isMe && (
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                              {t("session.page.member.you")}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isMemberHost
                            ? t("session.page.member.host")
                            : t("session.page.member.member")}
                        </p>
                      </div>
                      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {/* Empty slot hint */}
              {memberCount < MAX_MEMBERS && (
                <div className="flex items-center gap-3 px-5 py-3 opacity-40">
                  <div className="h-11 w-11 rounded-full border-2 border-dashed border-border/80 flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground">
                      +
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    {t("session.page.members.remaining", {
                      count: MAX_MEMBERS - memberCount,
                      suffix: MAX_MEMBERS - memberCount !== 1 ? "s" : "",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {isHost ? (
              <Button
                onClick={() => void getRecommendations()}
                disabled={memberCount < 2}
                className="flex-1 h-12 rounded-2xl bg-[hsl(216,50%,16%)] text-white font-semibold hover:bg-[hsl(216,50%,22%)] disabled:opacity-50 dark:bg-[hsl(38,42%,58%)] dark:text-[hsl(216,50%,16%)] dark:hover:bg-[hsl(38,42%,66%)]"
                id="session-get-recommendations-btn"
              >
                <Sparkles className="h-4 w-4" />
                {memberCount < 2
                  ? t("session.page.action.waitingFriend")
                  : t("session.page.action.getRecs", { count: memberCount })}
              </Button>
            ) : (
              <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 py-3.5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("session.page.action.waitingHost")}
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => void handleLeave()}
              className="h-12 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/5 sm:w-auto"
              id="session-leave-btn"
            >
              <LogOut className="h-4 w-4" />
              {t("session.page.action.leave")}
            </Button>
          </div>
        </>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive"
          role="alert"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );

  // ── Loading Recommendations ───────────────────────────────────
  const renderLoadingRecs = () => (
    <motion.div
      key="loading-recs"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.32 }}
      className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center space-y-6"
    >
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[hsl(216,50%,16%)] to-[hsl(216,50%,28%)] shadow-lg dark:from-[hsl(38,42%,52%)] dark:to-[hsl(38,42%,40%)]">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        {!shouldReduceMotion && (
          <div className="absolute -inset-2 rounded-[22px] border-2 border-[hsl(38,42%,58%)]/40 animate-ping" />
        )}
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">
          {t("session.page.loading.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("session.page.loading.subtitle")}
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-[hsl(38,42%,58%)]"
            style={{
              animation: shouldReduceMotion
                ? "none"
                : `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );

  // ── Recommendations ───────────────────────────────────────────
  const renderRecommendations = () => (
    <motion.div
      key="recommendations"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.32 }}
      className="mx-auto max-w-4xl px-4 py-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[hsl(38,42%,45%)] dark:text-[hsl(38,42%,68%)]">
            {t("session.page.recs.badge")}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("session.page.recs.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("session.page.recs.subtitle", { count: memberCount })}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {isHost && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void getRecommendations()}
              className="h-9 rounded-full px-4 text-xs font-semibold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t("session.page.recs.refresh")}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleLeave()}
            className="h-9 rounded-full border-destructive/30 px-4 text-xs font-semibold text-destructive hover:bg-destructive/5"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("session.page.recs.end")}
          </Button>
        </div>
      </div>

      {/* Members strip */}
      {session && (
        <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-card/80 px-4 py-3">
          <div className="flex -space-x-2">
            {session.members.slice(0, 5).map((m) => (
              <MemberAvatar
                key={m.id}
                member={m}
                isHost={m.id === session.host.id}
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
            {t("session.page.recs.forLabel")}{" "}
            <span className="font-semibold text-foreground">
              {session.members.map((m) => m.name.split(" ")[0]).join(", ")}
            </span>
          </p>
        </div>
      )}

      {/* Grid */}
      {recommendations && recommendations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec, i) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              index={i}
              onClick={() => navigate(`/venue/${rec.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border/70 bg-card/70 py-16 text-center">
          <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">
            {t("session.page.recs.empty.title")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("session.page.recs.empty.subtitle")}
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

  // ── Idle / Error fallback ─────────────────────────────────────
  const renderIdleError = () => (
    <motion.div
      key="idle"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.32 }}
      className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center space-y-5"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">
          {t("session.page.idle.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {error ?? t("session.page.idle.subtitle")}
        </p>
      </div>
      <Button onClick={() => navigate("/")} className="rounded-full px-6">
        <ArrowLeft className="h-4 w-4" />
        {t("session.page.idle.back")}
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={t("session.page.backHomeAria")}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">
            {t("session.page.topbar.title")}
          </h1>
          {(status === "waiting" || status === "loading-recs") && session && (
            <span className="ml-auto rounded-full border border-border/60 bg-muted px-3 py-1 text-xs font-mono font-semibold tracking-widest text-foreground">
              {session.code}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {(status === "waiting" ||
          status === "creating" ||
          status === "joining") &&
          renderWaitingRoom()}
        {status === "loading-recs" && renderLoadingRecs()}
        {status === "ready" && renderRecommendations()}
        {status === "idle" &&
          (isRestoring ? renderLoadingRecs() : renderIdleError())}
      </AnimatePresence>
    </div>
  );
}
