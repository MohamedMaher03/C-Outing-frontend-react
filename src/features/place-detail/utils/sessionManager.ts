const SESSION_KEY = "sessionId";

const createSessionId = (): string =>
  `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const getOrCreateSessionId = (): string => {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const next = createSessionId();
  sessionStorage.setItem(SESSION_KEY, next);
  return next;
};
