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

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionCodeRef = useRef<string | null>(null);

  // ── Helpers ───────────────────────────────────────────────────

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current !== null) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const syncSession = useCallback(async (code: string) => {
    try {
      const updated = await sessionApi.getSession(code);
      setSession(updated);
    } catch {
      // silently ignore intermittent poll errors
    }
  }, []);

  const startPolling = useCallback(
    (code: string) => {
      stopPolling();
      pollTimerRef.current = setInterval(() => {
        void syncSession(code);
      }, POLL_INTERVAL_MS);
    },
    [stopPolling, syncSession],
  );

  // Clean up polling on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  // ── Actions ───────────────────────────────────────────────────

  const createSession = useCallback(async () => {
    setError(null);
    setStatus("creating");
    try {
      // createSession returns the plain string code e.g. "302174"
      const code = await sessionApi.createSession();

      // Now fetch the full session object (host, members, createdAt, etc.)
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
      // best-effort
    } finally {
      stopPolling();
      sessionCodeRef.current = null;
      setSession(null);
      setRecommendations(null);
      setStatus("idle");
      setError(null);
    }
  }, [session, stopPolling]);

  const getRecommendations = useCallback(async () => {
    const code = sessionCodeRef.current ?? session?.code;
    if (!code) return;
    setError(null);
    setStatus("loading-recs");
    try {
      const recs = await sessionApi.getRecommendations(code);
      stopPolling();
      setRecommendations(recs ?? []);
      setStatus("ready");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch recommendations.",
      );
      setStatus("waiting");
    }
  }, [session, stopPolling]);

  /** Restore session when navigating directly to /session/:code */
  const restoreSession = useCallback(
    async (code: string) => {
      if (session?.code === code) return;
      setError(null);
      try {
        const existing = await sessionApi.getSession(code);
        sessionCodeRef.current = code;
        setSession(existing);
        setStatus("waiting");
        startPolling(code);
      } catch {
        setError("Session not found or has expired.");
        setStatus("idle");
      }
    },
    [session, startPolling],
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
    // Actions
    createSession,
    joinSession,
    leaveSession,
    getRecommendations,
    restoreSession,
  };
}
