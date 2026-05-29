import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sessionApi } from "../api/sessionApi";
import type {
  Session,
  SessionStatus,
  SessionRecommendation,
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

  const getCacheKey = useCallback((code: string) => {
    const safeCode = code.trim().toUpperCase();
    return `session-recs:${safeCode}`;
  }, []);

  const setCachedRecommendations = useCallback(
    (code: string, recs: SessionRecommendation[]) => {
      try {
        sessionStorage.setItem(getCacheKey(code), JSON.stringify(recs));
      } catch {
        // storage can fail in private mode; ignore
      }
    },
    [getCacheKey],
  );

  const getCachedRecommendations = useCallback(
    (code: string): SessionRecommendation[] | null => {
      try {
        const cached = sessionStorage.getItem(getCacheKey(code));
        if (!cached) return null;
        const parsed = JSON.parse(cached);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    [getCacheKey],
  );

  const clearCachedRecommendations = useCallback(
    (code: string) => {
      try {
        sessionStorage.removeItem(getCacheKey(code));
      } catch {
        // ignore
      }
    },
    [getCacheKey],
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
          try {
            const recs = await sessionApi.getRecommendations(code);
            setCachedRecommendations(code, recs);
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
      clearCachedRecommendations(code);
      setStatus("idle");
      setError(null);
    }
  }, [session, stopPolling, clearCachedRecommendations]);

  const getRecommendations = useCallback(async () => {
    const code = sessionCodeRef.current ?? session?.code;
    if (!code) return;
    setError(null);
    setStatus("loading-recs");
    recsFetchedRef.current = true;
    try {
      const recs = await sessionApi.getRecommendations(code);
      stopPolling();
      setRecommendations(recs);
      setCachedRecommendations(code, recs);
      setStatus("ready");
    } catch (err) {
      recsFetchedRef.current = false;
      setError(
        err instanceof Error ? err.message : "Failed to fetch recommendations.",
      );
      setStatus("waiting");
    }
  }, [session, stopPolling, setCachedRecommendations]);

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

        const cached = getCachedRecommendations(code);

        if (cached && cached.length > 0) {
          recsFetchedRef.current = true;
          setRecommendations(cached);
          setStatus("ready");
          stopPolling();
        } else if (existing.status === "ready") {
          recsFetchedRef.current = true;
          setStatus("loading-recs");
          try {
            const recs = await sessionApi.getRecommendations(code);
            setCachedRecommendations(code, recs);
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
    // Actions
    createSession,
    joinSession,
    leaveSession,
    getRecommendations,
    restoreSession,
  };
}
