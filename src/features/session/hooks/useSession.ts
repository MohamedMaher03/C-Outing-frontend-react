import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sessionApi } from "../api/sessionApi";
import type {
  Session,
  SessionStatus,
  SessionRecommendation,
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

const POLL_INTERVAL_MS = 4_000;

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
  const [error, setError] = useState<string | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [recommendationCount, setRecommendationCount] =
    useState<RecommendationCount>(DEFAULT_RECOMMENDATION_COUNT);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionCodeRef = useRef<string | null>(null);
//here note foe me to remember : i use this for preventing double fetching of recommendations.
  const recsFetchedRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current !== null) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const loadRecommendationsForSession = useCallback(
    async (code: string, count: RecommendationCount) => {
      setStatus("loading-recs");
      setRecommendationCount(count);
      recsFetchedRef.current = true;
      try {
        const recs = await sessionApi.getRecommendations(code, { count });
        persistSessionRecommendations(code, count, recs);
        setRecommendations(recs);
        setStatus("ready");
        stopPolling();
      } catch (err) {
        recsFetchedRef.current = false;
        setError(
          resolveErrorMessage(err, "Failed to fetch recommendations."),
        );
        setRecommendations((existing) => {
          setStatus(existing?.length ? "ready" : "waiting");
          return existing;
        });
      }
    },
    [stopPolling],
  );

  const syncSession = useCallback(
    async (code: string) => {
      try {
        const updated = await sessionApi.getSession(code);
        setSession(updated);

        if (updated.status === "ready" && !recsFetchedRef.current) {
          recsFetchedRef.current = true;
          stopPolling();
          const count = DEFAULT_RECOMMENDATION_COUNT;
          try {
            const recs = await sessionApi.getRecommendations(code, { count });
            persistSessionRecommendations(code, count, recs);
            setRecommendationCount(count);
            setRecommendations(recs);
            setStatus("ready");
          } catch {
            recsFetchedRef.current = false;
            setStatus("waiting");
            pollTimerRef.current = setInterval(() => {
              void syncSession(code);
            }, POLL_INTERVAL_MS);
          }
        }
      } catch {
        return;
      }
    },
    [stopPolling],
  );

  const startPolling = useCallback(
    (code: string) => {
      stopPolling();
      pollTimerRef.current = setInterval(() => {
        void syncSession(code);
      }, POLL_INTERVAL_MS);
    },
    [stopPolling, syncSession],
  );

  useEffect(() => () => stopPolling(), [stopPolling]);

  const createSession = useCallback(async () => {
    setError(null);
    setStatus("creating");
    recsFetchedRef.current = false;
    try {
      const code = await sessionApi.createSession();
      const newSession = await sessionApi.getSession(code);
      sessionCodeRef.current = code;
      setSession(newSession);
      setStatus("waiting");
      startPolling(code);
      navigate(`/session/${code}`, { replace: true });
    } catch (err) {
      setError(resolveErrorMessage(err, "Failed to create session."));
      setStatus("idle");
    }
  }, [navigate, startPolling]);

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
        sessionCodeRef.current = code;
        setSession(joined);
        setStatus("waiting");
        startPolling(code);
        navigate(`/session/${code}`, { replace: true });
      } catch (err) {
        setError(resolveErrorMessage(err, "Failed to join session."));
        setStatus("idle");
      }
    },
    [navigate, startPolling],
  );

  const leaveSession = useCallback(async () => {
    const code = sessionCodeRef.current ?? session?.code;
    if (!code) return;
    try {
      await sessionApi.leaveSession(code);
    } catch {
      return;
    } finally {
      stopPolling();
      sessionCodeRef.current = null;
      recsFetchedRef.current = false;
      setSession(null);
      setRecommendations(null);
      setRecommendationCount(DEFAULT_RECOMMENDATION_COUNT);
      purgeSessionRecommendationCache(code);
      setStatus("idle");
      setError(null);
    }
  }, [session?.code, stopPolling]);

  const getRecommendations = useCallback(
    async (count: RecommendationCount = recommendationCount) => {
      const code = sessionCodeRef.current ?? session?.code;
      if (!code) return;
      setError(null);
      await loadRecommendationsForSession(code, count);
    },
    [session?.code, recommendationCount, loadRecommendationsForSession],
  );

  const restoreSession = useCallback(
    async (rawCode: string) => {
      const code = normalizeSessionCode(rawCode);
      if (session?.code === code) return;
      setError(null);
      setIsRestoring(true);
      recsFetchedRef.current = false;
      try {
        const existing = await sessionApi.getSession(code);
        sessionCodeRef.current = code;
        setSession(existing);

        const cachedCount = readPersistedRecommendationCount(code);
        const cached = readSessionRecommendations(code, cachedCount);

        if (cached?.length) {
          recsFetchedRef.current = true;
          setRecommendationCount(cachedCount);
          setRecommendations(cached);
          setStatus("ready");
          stopPolling();
        } else if (existing.status === "ready") {
          recsFetchedRef.current = true;
          const count = DEFAULT_RECOMMENDATION_COUNT;
          try {
            const recs = await sessionApi.getRecommendations(code, { count });
            persistSessionRecommendations(code, count, recs);
            setRecommendationCount(count);
            setRecommendations(recs);
            setStatus("ready");
          } catch {
            recsFetchedRef.current = false;
            setStatus("waiting");
            startPolling(code);
          }
        } else {
          setStatus("waiting");
          startPolling(code);
        }
      } catch {
        setError("Session not found or has expired.");
        setStatus("idle");
      } finally {
        setIsRestoring(false);
      }
    },
    [session?.code, startPolling, stopPolling],
  );

  const isHost =
    user?.userId !== undefined && session?.host.id === user.userId;
  const memberCount = session?.members.length ?? 0;

  return {
    status,
    session,
    recommendations,
    error,
    joinCodeInput,
    setJoinCodeInput,
    isHost,
    memberCount,
    isRestoring,
    recommendationCount,
    createSession,
    joinSession,
    leaveSession,
    getRecommendations,
    restoreSession,
  };
}
