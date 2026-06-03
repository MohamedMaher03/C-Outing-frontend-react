import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { useI18n } from "@/components/i18n/useI18n";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useSessionContext } from "../context/useSessionContext";
import { normalizeSessionCode } from "../utils/sessionCode";
import { DEFAULT_RECOMMENDATION_COUNT } from "../types/session.types";
import type {
  RecommendationCount,
  SessionStatus,
} from "../types/session.types";
import { resolveSessionBootstrapIntent } from "../utils/sessionRouteIntent";
import {
  resolveCapacityBarClass,
  resolveCapacityBarTone,
  resolveCapacityFillPercent,
  isSessionAtCapacity,
} from "../utils/sessionCapacityPresentation";
import { SESSION_MEMBER_CAP } from "../constants/sessionPresentation";

const WAITING_STATUSES = new Set<SessionStatus>([
  "waiting",
  "creating",
  "joining",
]);

export const useSessionPage = () => {
  const { code: routeCode } = useParams<{ code?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { user } = useAuth();
  const { t } = useI18n();

  const {
    status,
    session,
    recommendations,
    votes,
    error,
    isHost,
    memberCount,
    isRestoring,
    recommendationCount,
    isSubmittingVote,
    isFinalizingVotes,
    myVoteVenueId,
    winningVenueId,
    hasFinalizedWinner,
    leaveSession,
    endSession,
    submitVote,
    finalizeVotes,
    getRecommendations,
    restoreSession,
    createSession,
    joinSession,
    isActiveForCode,
    resetSession,
  } = useSessionContext();

  const bootstrapConsumed = useRef(false);

  useEffect(() => {
    const normalizedRouteCode = routeCode
      ? normalizeSessionCode(routeCode)
      : "";

    if (
      normalizedRouteCode &&
      (isActiveForCode(normalizedRouteCode) ||
        (status !== "idle" &&
          status !== "ended" &&
          session?.code === normalizedRouteCode))
    ) {
      bootstrapConsumed.current = true;
      return;
    }
    if (status === "ended") {
      const intent = resolveSessionBootstrapIntent(searchParams, routeCode);
      if (intent.kind === "create" || intent.kind === "join") {
        bootstrapConsumed.current = false;
        resetSession();
        return;
      }
    }

    if (bootstrapConsumed.current || status !== "idle") return;

    const intent = resolveSessionBootstrapIntent(searchParams, routeCode);
    if (intent.kind === "pending") return;

    bootstrapConsumed.current = true;

    const bootstrapRunners = {
      create: () => createSession(),
      join: (joinCode: string) => joinSession(joinCode),
      restore: (sessionCode: string) => restoreSession(sessionCode),
    } as const;

    if (intent.kind === "create") void bootstrapRunners.create();
    else if (intent.kind === "join") void bootstrapRunners.join(intent.code);
    else void bootstrapRunners.restore(intent.code);
  }, [
    status,
    searchParams,
    routeCode,
    createSession,
    joinSession,
    restoreSession,
    isActiveForCode,
    resetSession,
    session?.code,
  ]);

  const exitSessionAndReturnHome = useCallback(async () => {
    if (isHost && status === "ready") {
      await endSession();
      return;
    }
    await leaveSession();
    navigate("/");
  }, [endSession, isHost, leaveSession, navigate, status]);

  const returnHomeFromEndedSession = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const openVenueFromRecommendation = useCallback(
    (venueId: string) => {
      navigate(`/venue/${venueId}`);
    },
    [navigate],
  );

  const requestDefaultRecommendations = useCallback(() => {
    void getRecommendations(DEFAULT_RECOMMENDATION_COUNT);
  }, [getRecommendations]);

  const requestRecommendationBatch = useCallback(
    (count: RecommendationCount) => {
      if (count !== recommendationCount) {
        void getRecommendations(count);
      }
    },
    [getRecommendations, recommendationCount],
  );

  const refreshRecommendations = useCallback(() => {
    void getRecommendations();
  }, [getRecommendations]);

  const submitVenueVote = useCallback(
    (venueId: string) => {
      void submitVote(venueId);
    },
    [submitVote],
  );

  const finalizeSessionVotes = useCallback(() => {
    void finalizeVotes();
  }, [finalizeVotes]);

  const leaveActionLabel = isHost
    ? t("session.page.recs.end")
    : t("session.page.action.leave");

  const capacityTone = resolveCapacityBarTone(memberCount);
  const capacityPresentation = useMemo(
    () => ({
      fillPercent: resolveCapacityFillPercent(memberCount),
      barClassName: resolveCapacityBarClass(capacityTone),
      atCapacity: isSessionAtCapacity(memberCount),
      memberCap: SESSION_MEMBER_CAP,
      openSlots: Math.max(SESSION_MEMBER_CAP - memberCount, 0),
    }),
    [memberCount, capacityTone],
  );

  const showSessionCodeInTopBar =
    (status === "waiting" || status === "loading-recs") && Boolean(session);

  const isWaitingPhase = WAITING_STATUSES.has(status);

  const waitingRoomCopy = useMemo(
    () => ({
      pageTitle: t("session.page.title"),
      hostSubtitle: t("session.page.subtitle.host"),
      memberSubtitle: t("session.page.subtitle.member"),
      creating: t("session.page.creating"),
      shareTitle: t("session.page.share.title", {
        max: SESSION_MEMBER_CAP,
      }),
      shareHint: t("session.page.share.hint"),
      codeLabel: t("session.code.label"),
      membersLabel: t("session.page.members.label"),
      membersFull: t("session.page.members.full"),
      membersListTitle: t("session.page.members.listTitle"),
      membersWaiting: t("session.page.members.waiting"),
      memberYou: t("session.page.member.you"),
      memberHost: t("session.page.member.host"),
      memberMember: t("session.page.member.member"),
      membersRemaining: t("session.page.members.remaining", {
        count: capacityPresentation.openSlots,
        suffix: capacityPresentation.openSlots !== 1 ? "s" : "",
      }),
      waitingFriend: t("session.page.action.waitingFriend"),
      getRecs: t("session.page.action.getRecs", { count: memberCount }),
      waitingHost: t("session.page.action.waitingHost"),
    }),
    [t, memberCount, capacityPresentation.openSlots],
  );

  const recommendationsCopy = useMemo(
    () => ({
      badge: t("session.page.recs.badge"),
      title: t("session.page.recs.title"),
      subtitle: t("session.page.recs.subtitle", {
        count: memberCount,
        places: recommendationCount,
      }),
      refresh: t("session.page.recs.refresh"),
      forLabel: t("session.page.recs.forLabel"),
      emptyTitle: t("session.page.recs.empty.title"),
      emptySubtitle: t("session.page.recs.empty.subtitle"),
      finalizeVotes: t("session.page.votes.finalize"),
      finalizingVotes: t("session.page.votes.finalizing"),
    }),
    [t, memberCount, recommendationCount],
  );

  const endedCopy = useMemo(
    () => ({
      title: t("session.page.ended.title"),
      subtitle: t("session.page.ended.subtitle"),
      back: t("session.page.ended.back"),
    }),
    [t],
  );

  const loadingCopy = useMemo(
    () => ({
      title: t("session.page.loading.title"),
      subtitle: t("session.page.loading.subtitle"),
      subtitleCount: t("session.page.loading.subtitleCount", {
        count: recommendationCount,
      }),
    }),
    [t, recommendationCount],
  );

  const idleCopy = useMemo(
    () => ({
      title: t("session.page.idle.title"),
      subtitle: t("session.page.idle.subtitle"),
      back: t("session.page.idle.back"),
    }),
    [t],
  );

  return {
    t,
    user,
    prefersReducedMotion,
    navigate,
    status,
    session,
    recommendations,
    votes,
    error,
    isHost,
    memberCount,
    isRestoring,
    recommendationCount,
    isSubmittingVote,
    isFinalizingVotes,
    myVoteVenueId,
    winningVenueId,
    hasFinalizedWinner,
    leaveActionLabel,
    capacityPresentation,
    showSessionCodeInTopBar,
    isWaitingPhase,
    exitSessionAndReturnHome,
    returnHomeFromEndedSession,
    openVenueFromRecommendation,
    requestDefaultRecommendations,
    requestRecommendationBatch,
    refreshRecommendations,
    submitVenueVote,
    finalizeSessionVotes,
    waitingRoomCopy,
    recommendationsCopy,
    loadingCopy,
    idleCopy,
    endedCopy,
  };
};
