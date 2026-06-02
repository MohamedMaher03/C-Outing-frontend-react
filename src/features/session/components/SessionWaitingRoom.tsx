import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Share2,
  Loader2,
  Sparkles,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Session, SessionStatus } from "../types/session.types";
import type { SessionMember } from "../types/session.types";
import {
  MOTION_EASE_OUT_QUART,
  SESSION_PAGE_VARIANTS,
} from "../constants/sessionPresentation";
import { MemberAvatar } from "./MemberAvatar";
import { SessionCopyButton } from "./SessionCopyButton";
import { SessionShareButton } from "./SessionShareButton";

interface CapacityPresentation {
  fillPercent: number;
  barClassName: string;
  atCapacity: boolean;
  memberCap: number;
  openSlots: number;
}

interface SessionWaitingRoomProps {
  status: SessionStatus;
  session: Session | null;
  error: string | null;
  isHost: boolean;
  memberCount: number;
  currentUserId?: string;
  prefersReducedMotion: boolean;
  leaveActionLabel: string;
  capacityPresentation: CapacityPresentation;
  copy: {
    pageTitle: string;
    hostSubtitle: string;
    memberSubtitle: string;
    creating: string;
    shareTitle: string;
    shareHint: string;
    codeLabel: string;
    membersLabel: string;
    membersFull: string;
    membersListTitle: string;
    membersWaiting: string;
    memberYou: string;
    memberHost: string;
    memberMember: string;
    membersRemaining: string;
    waitingFriend: string;
    getRecs: string;
    waitingHost: string;
  };
  onRequestDefaultRecommendations: () => void;
  onExitSession: () => void;
}

export function SessionWaitingRoom({
  status,
  session,
  error,
  isHost,
  memberCount,
  currentUserId,
  prefersReducedMotion,
  leaveActionLabel,
  capacityPresentation,
  copy,
  onRequestDefaultRecommendations,
  onExitSession,
}: SessionWaitingRoomProps) {
  const { memberCap, fillPercent, barClassName, atCapacity, openSlots } =
    capacityPresentation;

  return (
    <motion.div
      key="waiting"
      variants={SESSION_PAGE_VARIANTS}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: prefersReducedMotion ? 0.01 : 0.32 }}
      className="mx-auto max-w-2xl px-4 py-8 space-y-5"
    >
      <div className="text-center space-y-1.5">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(216,50%,16%)] to-[hsl(216,50%,28%)] shadow-lg dark:from-[hsl(38,42%,52%)] dark:to-[hsl(38,42%,40%)]">
          <Users className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {copy.pageTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isHost ? copy.hostSubtitle : copy.memberSubtitle}
        </p>
      </div>

      {status === "creating" && (
        <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-[hsl(38,42%,58%)]" />
          {copy.creating}
        </div>
      )}

      {session && (
        <>
          {isHost && (
            <div className="relative overflow-hidden rounded-3xl border border-[hsl(38,42%,58%)]/30 bg-gradient-to-br from-[hsl(216,50%,16%)] to-[hsl(216,50%,24%)] p-5 shadow-lg">
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[hsl(38,42%,58%)]/20 blur-2xl" />
              <div className="pointer-events-none absolute -left-4 bottom-0 h-16 w-16 rounded-full bg-[hsl(38,42%,58%)]/12 blur-xl" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-[hsl(38,42%,72%)]" />
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[hsl(38,42%,72%)]">
                    {copy.shareTitle}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  {session.code.split("").map((digit, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: -10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: index * 0.06,
                        duration: 0.28,
                        ease: MOTION_EASE_OUT_QUART,
                      }}
                      className="flex h-12 w-10 items-center justify-center rounded-xl border-2 border-[hsl(38,42%,58%)]/50 bg-white/8 text-xl font-bold tracking-widest text-white sm:h-14 sm:w-12 sm:text-2xl"
                    >
                      {digit}
                    </motion.span>
                  ))}
                </div>
                <p className="text-center text-xs text-white/60">{copy.shareHint}</p>
                <div className="flex gap-2">
                  <SessionCopyButton code={session.code} />
                  <SessionShareButton code={session.code} />
                </div>
              </div>
            </div>
          )}

          {!isHost && (
            <div className="rounded-3xl border border-border/60 bg-card p-5 text-center space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {copy.codeLabel}
              </p>
              <p className="font-mono text-3xl font-bold tracking-[0.3em] text-foreground">
                {session.code}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">{copy.membersLabel}</span>
              <span
                className={atCapacity ? "text-destructive" : "text-foreground"}
              >
                {memberCount} / {memberCap}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className={cn("h-full rounded-full", barClassName)}
                initial={{ width: 0 }}
                animate={{ width: `${fillPercent}%` }}
                transition={{ duration: 0.5, ease: MOTION_EASE_OUT_QUART }}
              />
            </div>
            {atCapacity && (
              <p className="text-xs text-destructive font-medium">
                {copy.membersFull}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                {copy.membersListTitle}
              </p>
              {isHost && memberCount === 1 && (
                <p className="text-[11px] text-muted-foreground">
                  {copy.membersWaiting}
                </p>
              )}
            </div>
            <div className="divide-y divide-border/40">
              <AnimatePresence initial={false}>
                {session.members.map((member: SessionMember, index) => {
                  const isMemberHost = member.id === session.host.id;
                  const isCurrentUser = member.id === currentUserId;

                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{
                        delay: index * 0.04,
                        duration: 0.22,
                        ease: MOTION_EASE_OUT_QUART,
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
                          {isCurrentUser && (
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                              {copy.memberYou}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isMemberHost ? copy.memberHost : copy.memberMember}
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
              {openSlots > 0 && (
                <div className="flex items-center gap-3 px-5 py-3 opacity-40">
                  <div className="h-11 w-11 rounded-full border-2 border-dashed border-border/80 flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground">
                      +
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    {copy.membersRemaining}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {isHost ? (
              <Button
                onClick={onRequestDefaultRecommendations}
                disabled={memberCount < 2}
                className="flex-1 h-12 rounded-2xl bg-[hsl(216,50%,16%)] text-white font-semibold hover:bg-[hsl(216,50%,22%)] disabled:opacity-50 dark:bg-[hsl(38,42%,58%)] dark:text-[hsl(216,50%,16%)] dark:hover:bg-[hsl(38,42%,66%)]"
                id="session-get-recommendations-btn"
              >
                <Sparkles className="h-4 w-4" />
                {memberCount < 2 ? copy.waitingFriend : copy.getRecs}
              </Button>
            ) : (
              <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 py-3.5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {copy.waitingHost}
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => void onExitSession()}
              className="h-12 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/5 sm:w-auto"
              id="session-leave-btn"
            >
              <LogOut className="h-4 w-4" />
              {leaveActionLabel}
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
}
