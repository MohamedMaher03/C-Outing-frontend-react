import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sessionApi } from "../api/sessionApi";
import type {
  Session,
  SessionStatus,
  SessionRecommendation,
  RecommendationCount,
} from "../types/session.types";
import {
  DEFAULT_RECOMMENDATION_COUNT,
  RECOMMENDATION_COUNT_OPTIONS,
} from "../types/session.types";
import { useAuth } from "@/features/auth/context/AuthContext";

const POLL_INTERVAL_MS = 4_000;

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

  //NOTE FOR ME TO REMIND:this is i use for preventing the polling loop from triggering multiple simultaneous calls
  const recsFetchedRef = useRef(false);

  // ── Helpers ───────────────────────────────────────────────────

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current !== null) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const getCacheKey = useCallback((code: string, count: RecommendationCount) => {
    const safeCode = code.trim().toUpperCase();
    return `session-recs:${safeCode}:${count}`;
  }, []);

  const getCountMetaKey = useCallback((code: string) => {
    const safeCode = code.trim().toUpperCase();
    return `session-rec-count:${safeCode}`;
  }, []);

  const setCachedRecommendations = useCallback(
    (
      code: string,
      count: RecommendationCount,
      recs: SessionRecommendation[],
    ) => {
      try {
        sessionStorage.setItem(getCacheKey(code, count), JSON.stringify(recs));
        sessionStorage.setItem(getCountMetaKey(code), String(count));
      } catch {
        // storage can fail in private mode; ignore
      }
    },
    [getCacheKey, getCountMetaKey],
  );

  const getCachedRecommendations = useCallback(
    (
      code: string,
      count: RecommendationCount,
    ): SessionRecommendation[] | null => {
      try {
        const cached = sessionStorage.getItem(getCacheKey(code, count));
        if (!cached) return null;
        const parsed = JSON.parse(cached);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    [getCacheKey],
  );

  const getCachedRecommendationCount = useCallback(
    (code: string): RecommendationCount => {
      try {
        const stored = sessionStorage.getItem(getCountMetaKey(code));
        const parsed = Number(stored);
        if (parsed === 10 || parsed === 20 || parsed === 30) return parsed;
      } catch {
        // ignore
      }
      return DEFAULT_RECOMMENDATION_COUNT;
    },
    [getCountMetaKey],
  );

  const clearCachedRecommendations = useCallback(
    (code: string) => {
      try {
        for (const count of RECOMMENDATION_COUNT_OPTIONS) {
          sessionStorage.removeItem(getCacheKey(code, count));
        }
        sessionStorage.removeItem(getCountMetaKey(code));
      } catch {
        // ignore
      }
    },
    [getCacheKey, getCountMetaKey],
  );

  const syncSession = useCallback(
    async (code: string) => {
      try {
        const updated = await sessionApi.getSession(code);
        setSession(updated);

        if (updated.status === "ready" && !recsFetchedRef.current) {
          recsFetchedRef.current = true;
          stopPolling();
          setStatus("loading-recs");
          const count = DEFAULT_RECOMMENDATION_COUNT;
          setRecommendationCount(count);
          try {
            const recs = await sessionApi.getRecommendations(code, { count });
            setCachedRecommendations(code, count, recs);
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
        // Silently ignore intermittent poll errors.
      }
    },
    [stopPolling, setCachedRecommendations],
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

  // ── Actions ───────────────────────────────────────────────────

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
      setError(
        err instanceof Error ? err.message : "Failed to create session.",
      );
      setStatus("idle");
    }
  }, [navigate, startPolling]);

  const joinSession = useCallback(
    async (code: string) => {
      const trimmedCode = code.trim().toUpperCase();
      if (!trimmedCode) {
        setError("Please enter a valid session code.");
        return;
      }
      setError(null);
      setStatus("joining");
      recsFetchedRef.current = false;
      try {
        const joined = await sessionApi.joinSession(trimmedCode);
        sessionCodeRef.current = trimmedCode;
        setSession(joined);
        setStatus("waiting");
        startPolling(trimmedCode);
        navigate(`/session/${trimmedCode}`, { replace: true });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to join session.",
        );
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
      //
    } finally {
      stopPolling();
      sessionCodeRef.current = null;
      recsFetchedRef.current = false;
      setSession(null);
      setRecommendations(null);
      setRecommendationCount(DEFAULT_RECOMMENDATION_COUNT);
      clearCachedRecommendations(code);
      setStatus("idle");
      setError(null);
    }
  }, [session, stopPolling, clearCachedRecommendations]);

  const getRecommendations = useCallback(
    async (count: RecommendationCount = recommendationCount) => {
      const code = sessionCodeRef.current ?? session?.code;
      if (!code) return;
      setError(null);
      setRecommendationCount(count);
      setStatus("loading-recs");
      recsFetchedRef.current = true;
      try {
        const recs = await sessionApi.getRecommendations(code, { count });
        stopPolling();
        setRecommendations(recs);
        setCachedRecommendations(code, count, recs);
        setStatus("ready");
      } catch (err) {
        recsFetchedRef.current = false;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch recommendations.",
        );
        setStatus(recommendations ? "ready" : "waiting");
      }
    },
    [
      session,
      recommendationCount,
      recommendations,
      stopPolling,
      setCachedRecommendations,
    ],
  );

  /** Restore session when navigating directly to /session/:code */
  const restoreSession = useCallback(
    async (code: string) => {
      if (session?.code === code) return;
      setError(null);
      setIsRestoring(true);
      recsFetchedRef.current = false;
      try {
        const existing = await sessionApi.getSession(code);
        sessionCodeRef.current = code;
        setSession(existing);

        const cachedCount = getCachedRecommendationCount(code);
        const cached = getCachedRecommendations(code, cachedCount);

        if (cached && cached.length > 0) {
          recsFetchedRef.current = true;
          setRecommendationCount(cachedCount);
          setRecommendations(cached);
          setStatus("ready");
          stopPolling();
        } else if (existing.status === "ready") {
          recsFetchedRef.current = true;
          setStatus("loading-recs");
          const count = DEFAULT_RECOMMENDATION_COUNT;
          setRecommendationCount(count);
          try {
            const recs = await sessionApi.getRecommendations(code, { count });
            setCachedRecommendations(code, count, recs);
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
    [
      session,
      startPolling,
      getCachedRecommendations,
      getCachedRecommendationCount,
      setCachedRecommendations,
      stopPolling,
    ],
  );

  const isHost = user?.userId !== undefined && session?.host.id === user.userId;
  const memberCount = session?.members.length ?? 0;

  return {
    // State
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
    // Actions
    createSession,
    joinSession,
    leaveSession,
    getRecommendations,
    restoreSession,
  };
}
