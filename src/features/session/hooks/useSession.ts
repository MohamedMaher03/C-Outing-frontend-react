import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sessionApi } from "../api/sessionApi";
import { sessionHubClient } from "../api/sessionHub";
import type { SessionHubHandlers } from "../api/sessionHub";
import type {
  Session,
  SessionStatus,
  SessionRecommendation,
  SessionVotes,
  RecommendationCount,
} from "../types/session.types";
import { DEFAULT_RECOMMENDATION_COUNT } from "../types/session.types";
import { normalizeSessionCode } from "../utils/sessionCode";
import {
  persistSessionRecommendations,
  readSessionRecommendations,
  readPersistedRecommendationCount,
  purgeSessionRecommendationCache,
} from "../utils/sessionRecommendationCache";
import { useAuth } from "@/features/auth/context/AuthContext";

const SYNC_INTERVAL_MS = 3_000;

const resolveErrorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

export function useSession() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [status, setStatus] = useState<SessionStatus>("idle");
  const [session, setSession] = useState<Session | null>(null);
  const [recommendations, setRecommendations] = useState<
    SessionRecommendation[] | null
  >(null);
  const [votes, setVotes] = useState<SessionVotes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [isFinalizingVotes, setIsFinalizingVotes] = useState(false);
  const [recommendationCount, setRecommendationCount] =
    useState<RecommendationCount>(DEFAULT_RECOMMENDATION_COUNT);

  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionCodeRef = useRef<string | null>(null);
  const recsFetchedRef = useRef(false);
  const recsLoadingRef = useRef(false);
  const hubConnectedRef = useRef(false);

  const localMyVoteRef = useRef<string | undefined>(undefined);

  const userIdRef = useRef<string | undefined>(user?.userId);
  useEffect(() => {
    userIdRef.current = user?.userId;
    if (user?.userId && session?.memberVotes?.[user.userId]) {
      localMyVoteRef.current = session.memberVotes[user.userId];
    }
  }, [user?.userId, session?.memberVotes]);

  const statusRef = useRef(status);
  const recommendationCountRef = useRef(recommendationCount);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    recommendationCountRef.current = recommendationCount;
  }, [recommendationCount]);

  const stopSync = useCallback(() => {
    if (syncTimerRef.current !== null) {
      clearInterval(syncTimerRef.current);
      syncTimerRef.current = null;
    }
  }, []);

  const updateVotesWithGuard = useCallback((tally: SessionVotes | null) => {
    if (!tally) {
      setVotes(null);
      return;
    }
    setVotes((prev) => {
      if (
        prev !== null &&
        (tally.totalMembers ?? 0) === 0 &&
        (prev.totalMembers ?? 0) > 0
      ) {
        return prev;
      }
      return tally;
    });
  }, []);

  const fetchRecommendationsIfReady = useCallback(
    async (
      code: string,
      count: RecommendationCount = DEFAULT_RECOMMENDATION_COUNT,
    ) => {
      if (recsFetchedRef.current || recsLoadingRef.current) return;
      recsLoadingRef.current = true;
      try {
        const recs = await sessionApi.getRecommendations(code, { count });
        persistSessionRecommendations(code, count, recs);
        recsFetchedRef.current = true;
        setRecommendationCount(count);
        setRecommendations(recs);
        setStatus("ready");
        try {
          const tally = await sessionApi.getVotes(code);
          updateVotesWithGuard(tally);
        } catch {
          updateVotesWithGuard(null);
        }
      } catch {
        recsFetchedRef.current = false;
      } finally {
        recsLoadingRef.current = false;
      }
    },
    [updateVotesWithGuard],
  );

  const applySessionSnapshot = useCallback(
    (updated: Session) => {
      const currentUserId = userIdRef.current;
      const preservedMemberVotes = {
        ...(updated.memberVotes ?? {}),
      };
      if (currentUserId && localMyVoteRef.current) {
        preservedMemberVotes[currentUserId] = localMyVoteRef.current;
      }

      setSession({
        ...updated,
        memberVotes: preservedMemberVotes,
      });

      if (updated.status === "ready") {
        const code = updated.code;
        if (!recsFetchedRef.current && !recsLoadingRef.current) {
          if (statusRef.current !== "loading-recs") {
            setStatus("loading-recs");
          }
          void fetchRecommendationsIfReady(
            code,
            recommendationCountRef.current,
          );
        } else if (recsFetchedRef.current && statusRef.current === "waiting") {
          setStatus("ready");
        }
      }
    },
    [fetchRecommendationsIfReady],
  );

  const handlersRef = useRef<SessionHubHandlers>({
    onSessionState: () => undefined,
    onSessionVotes: () => undefined,
    onSessionEnded: () => undefined,
  });

  const handleSessionEnded = useCallback(
    (code: string) => {
      stopSync();
      sessionCodeRef.current = null;
      recsFetchedRef.current = false;
      recsLoadingRef.current = false;
      hubConnectedRef.current = false;
      localMyVoteRef.current = undefined;
      purgeSessionRecommendationCache(code);
      setSession(null);
      setRecommendations(null);
      setVotes(null);
      setRecommendationCount(DEFAULT_RECOMMENDATION_COUNT);
      setStatus("ended");
      setError(null);
      void sessionHubClient.disconnect();
    },
    [stopSync],
  );

  const handleSessionVotesUpdate = useCallback(
    (tally: SessionVotes) => {
      updateVotesWithGuard(tally);
      setSession((current) =>
        current
          ? { ...current, winningVenueId: tally.winningVenueId }
          : current,
      );

      const code = sessionCodeRef.current;
      if (!code) return;

      void sessionApi
        .getSession(code)
        .then((fresh) => {
          setSession((current) => {
            if (current?.code !== fresh.code) return current;

            const currentUserId = userIdRef.current;
            const preservedMemberVotes = {
              ...(fresh.memberVotes ?? {}),
              ...(current?.memberVotes ?? {}),
            };
            if (currentUserId && localMyVoteRef.current) {
              preservedMemberVotes[currentUserId] = localMyVoteRef.current;
            }

            return {
              ...fresh,
              memberVotes: preservedMemberVotes,
              winningVenueId:
                tally.winningVenueId ?? fresh.winningVenueId ?? null,
            };
          });
        })
        .catch(() => undefined);
    },
    [updateVotesWithGuard],
  );

  const syncSessionSnapshot = useCallback(async () => {
    const code = sessionCodeRef.current;
    if (!code) return;

    try {
      const updated = await sessionApi.getSession(code);
      applySessionSnapshot(updated);

      if (updated.status === "ready") {
        try {
          const tally = await sessionApi.getVotes(code);
          updateVotesWithGuard(tally);
        } catch {
          console.warn("Failed to sync votes with session snapshot.");
        }
      }
    } catch {
      return;
    }
  }, [applySessionSnapshot, updateVotesWithGuard]);

  handlersRef.current = {
    onSessionState: applySessionSnapshot,
    onSessionVotes: handleSessionVotesUpdate,
    onSessionEnded: handleSessionEnded,
  };

  const connectHub = useCallback(async (code: string) => {
    try {
      await sessionHubClient.connect({
        onSessionState: (session) =>
          handlersRef.current.onSessionState(session),
        onSessionVotes: (votes) => handlersRef.current.onSessionVotes(votes),
        onSessionEnded: (endedCode) =>
          handlersRef.current.onSessionEnded(endedCode),
      });
      await sessionHubClient.subscribe(code);
      hubConnectedRef.current = true;
    } catch {
      hubConnectedRef.current = false;
    }
  }, []);

  const startSync = useCallback(() => {
    stopSync();
    void syncSessionSnapshot();
    syncTimerRef.current = setInterval(() => {
      void syncSessionSnapshot();
    }, SYNC_INTERVAL_MS);
  }, [stopSync, syncSessionSnapshot]);

  const disconnectHub = useCallback(async () => {
    hubConnectedRef.current = false;
    await sessionHubClient.disconnect();
  }, []);

  useEffect(() => {
    sessionHubClient.setHandlers({
      onSessionState: (session) => handlersRef.current.onSessionState(session),
      onSessionVotes: (votes) => handlersRef.current.onSessionVotes(votes),
      onSessionEnded: (endedCode) =>
        handlersRef.current.onSessionEnded(endedCode),
    });
  });

  useEffect(
    () => () => {
      stopSync();
      void sessionHubClient.disconnect();
    },
    [stopSync],
  );

  const loadRecommendationsForSession = useCallback(
    async (code: string, count: RecommendationCount) => {
      setStatus("loading-recs");
      setRecommendationCount(count);
      recsLoadingRef.current = true;
      try {
        const recs = await sessionApi.getRecommendations(code, { count });
        persistSessionRecommendations(code, count, recs);
        recsFetchedRef.current = true;
        setRecommendations(recs);
        setStatus("ready");
        try {
          const tally = await sessionApi.getVotes(code);
          updateVotesWithGuard(tally);
        } catch {
          updateVotesWithGuard(null);
        }
      } catch (err) {
        recsFetchedRef.current = false;
        setError(resolveErrorMessage(err, "Failed to fetch recommendations."));
        setRecommendations((existing) => {
          setStatus(existing?.length ? "ready" : "waiting");
          return existing;
        });
      } finally {
        recsLoadingRef.current = false;
      }
    },
    [],
  );

  const resetLocalSession = useCallback(
    (code: string | null) => {
      stopSync();
      if (code) purgeSessionRecommendationCache(code);
      sessionCodeRef.current = null;
      recsFetchedRef.current = false;
      recsLoadingRef.current = false;
      hubConnectedRef.current = false;
      localMyVoteRef.current = undefined;
      setSession(null);
      setRecommendations(null);
      setVotes(null);
      setRecommendationCount(DEFAULT_RECOMMENDATION_COUNT);
      setStatus("idle");
      setError(null);
    },
    [stopSync],
  );

  const resetSession = useCallback(() => {
    sessionCodeRef.current = null;
    recsFetchedRef.current = false;
    recsLoadingRef.current = false;
    hubConnectedRef.current = false;
    localMyVoteRef.current = undefined;
    setSession(null);
    setRecommendations(null);
    setVotes(null);
    setRecommendationCount(DEFAULT_RECOMMENDATION_COUNT);
    setStatus("idle");
    setError(null);
  }, []);

  const activateSession = useCallback(
    async (code: string, initialSession: Session) => {
      sessionCodeRef.current = code;
      setSession(initialSession);
      setStatus(initialSession.status === "ready" ? "loading-recs" : "waiting");
      const currentUserId = userIdRef.current;
      if (currentUserId && initialSession.memberVotes?.[currentUserId]) {
        localMyVoteRef.current = initialSession.memberVotes[currentUserId];
      }
      await connectHub(code);
      startSync();

      if (initialSession.status === "ready") {
        const cachedCount = readPersistedRecommendationCount(code);
        const cached = readSessionRecommendations(code, cachedCount);
        if (cached?.length) {
          recsFetchedRef.current = true;
          setRecommendationCount(cachedCount);
          setRecommendations(cached);
          setStatus("ready");
          try {
            const tally = await sessionApi.getVotes(code);
            updateVotesWithGuard(tally);
          } catch {
            updateVotesWithGuard(null);
          }
        } else {
          void fetchRecommendationsIfReady(code, cachedCount);
        }
      }
    },
    [connectHub, fetchRecommendationsIfReady, startSync],
  );

  const createSession = useCallback(async () => {
    setError(null);
    setStatus("creating");
    recsFetchedRef.current = false;
    try {
      const code = await sessionApi.createSession();
      const newSession = await sessionApi.getSession(code);
      await activateSession(code, newSession);
      navigate(`/session/${code}`, { replace: true });
    } catch (err) {
      setError(resolveErrorMessage(err, "Failed to create session."));
      setStatus("idle");
    }
  }, [activateSession, navigate]);

  const joinSession = useCallback(
    async (rawCode: string) => {
      const code = normalizeSessionCode(rawCode);
      if (!code) {
        setError("Please enter a valid session code.");
        return;
      }
      setError(null);
      setStatus("joining");
      recsFetchedRef.current = false;
      try {
        const joined = await sessionApi.joinSession(code);
        await activateSession(code, joined);
        navigate(`/session/${code}`, { replace: true });
      } catch (err) {
        setError(resolveErrorMessage(err, "Failed to join session."));
        setStatus("idle");
      }
    },
    [activateSession, navigate],
  );

  const leaveSession = useCallback(async () => {
    const code = sessionCodeRef.current ?? session?.code;
    if (!code) return;
    try {
      await sessionApi.leaveSession(code);
    } catch {
      return;
    } finally {
      await disconnectHub();
      resetLocalSession(code);
    }
  }, [disconnectHub, resetLocalSession, session?.code]);

  const endSession = useCallback(async () => {
    const code = sessionCodeRef.current ?? session?.code;
    if (!code) return;
    setError(null);
    try {
      await sessionApi.endSession(code);
    } catch (err) {
      setError(resolveErrorMessage(err, "Failed to end session."));
    }
  }, [session?.code]);

  const submitVote = useCallback(
    async (venueId: string) => {
      const code = sessionCodeRef.current ?? session?.code;
      if (!code || votes?.winningVenueId) return;
      setError(null);
      setIsSubmittingVote(true);
      localMyVoteRef.current = venueId;
      try {
        const tally = await sessionApi.submitVote(code, venueId);
        handleSessionVotesUpdate(tally);
        if (user?.userId) {
          setSession((current) =>
            current
              ? {
                  ...current,
                  memberVotes: {
                    ...current.memberVotes,
                    [user.userId]: venueId,
                  },
                }
              : current,
          );
        }
      } catch (err) {
        localMyVoteRef.current = undefined;
        setError(resolveErrorMessage(err, "Failed to submit vote."));
      } finally {
        setIsSubmittingVote(false);
      }
    },
    [
      handleSessionVotesUpdate,
      session?.code,
      user?.userId,
      votes?.winningVenueId,
    ],
  );

  const finalizeVotes = useCallback(async () => {
    const code = sessionCodeRef.current ?? session?.code;
    if (!code) return;
    setError(null);
    setIsFinalizingVotes(true);
    try {
      const tally = await sessionApi.finalizeVotes(code);
      handleSessionVotesUpdate(tally);
    } catch (err) {
      setError(resolveErrorMessage(err, "Failed to finalize votes."));
    } finally {
      setIsFinalizingVotes(false);
    }
  }, [handleSessionVotesUpdate, session?.code]);

  const getRecommendations = useCallback(
    async (count: RecommendationCount = recommendationCount) => {
      const code = sessionCodeRef.current ?? session?.code;
      if (!code) return;
      setError(null);
      recsFetchedRef.current = false;
      await loadRecommendationsForSession(code, count);
    },
    [session?.code, recommendationCount, loadRecommendationsForSession],
  );

  const restoreSession = useCallback(
    async (rawCode: string) => {
      const code = normalizeSessionCode(rawCode);
      if (!code) return;

      if (sessionCodeRef.current === code && statusRef.current !== "idle") {
        return;
      }

      setError(null);
      setIsRestoring(true);
      recsFetchedRef.current = false;
      try {
        const existing = await sessionApi.getSession(code);
        await activateSession(code, existing);
      } catch {
        setError("Session not found or has expired.");
        setStatus("idle");
      } finally {
        setIsRestoring(false);
      }
    },
    [activateSession],
  );

  const isHost = user?.userId !== undefined && session?.host.id === user.userId;
  const memberCount = session?.members.length ?? 0;

  const serverMyVote =
    user?.userId && session?.memberVotes
      ? session.memberVotes[user.userId]
      : undefined;
  const myVoteVenueId = localMyVoteRef.current ?? serverMyVote;

  const winningVenueId =
    votes?.winningVenueId ?? session?.winningVenueId ?? null;
  const hasFinalizedWinner = Boolean(winningVenueId);

  const isActiveForCode = useCallback((code: string) => {
    const normalized = normalizeSessionCode(code);
    return (
      normalized.length > 0 &&
      sessionCodeRef.current === normalized &&
      statusRef.current !== "idle" &&
      statusRef.current !== "ended"
    );
  }, []);

  return {
    status,
    session,
    recommendations,
    votes,
    error,
    joinCodeInput,
    setJoinCodeInput,
    isHost,
    memberCount,
    isRestoring,
    recommendationCount,
    isSubmittingVote,
    isFinalizingVotes,
    myVoteVenueId,
    winningVenueId,
    hasFinalizedWinner,
    isActiveForCode,
    createSession,
    joinSession,
    leaveSession,
    endSession,
    submitVote,
    finalizeVotes,
    getRecommendations,
    restoreSession,
    resetSession,
  };
}
