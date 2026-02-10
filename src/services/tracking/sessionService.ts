/**
 * Session Service
 * Manages user sessions and generates session IDs
 * Tracks context and interactions for the entire user session
 */

import { Session } from "../../types";

const SESSION_ID_KEY = "hcars_session_id";

export const sessionService = {
  /**
   * Generate a new session ID (GUID format)
   */
  generateSessionId(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  },

  /**
   * Get or create session ID for current session
   */
  getSessionId(): string {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);

    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    return sessionId;
  },

  /**
   * Clear session on logout
   */
  clearSession(): void {
    sessionStorage.removeItem(SESSION_ID_KEY);
  },

  /**
   * Create session object
   */
  createSession(userId: number): Session {
    return {
      sessionId: this.getSessionId(),
      userId,
      startTime: new Date(),
    };
  },
};
