/**
 * Auth Service — Business Logic Layer
 *
 * Sits between AuthContext and the HTTP layer (authApi).
 * Responsibilities:
 *   • Call authApi functions
 *   • Persist / restore / clear the session from localStorage
 *   • Keep storage key names centralised via AUTH_STORAGE_KEYS
 *
 * ┌──────────────────────────────────────────────────────────┐
 * │  AuthContext  →  authService  →  authApi  →  axios       │
 * └──────────────────────────────────────────────────────────┘
 *
 * 🔧 To use mocks during development, swap the import:
 *   import { authMock as authApi } from "../mocks/authMock";
 */

//import { authApi } from "../api/authApi";(WHEN INTEGRATE WITH BACKEND USE THIS AND REMOVE ONE DOWN)
import { authMock as authApi } from "../mocks/authMock";
import { AUTH_STORAGE_KEYS } from "../constants";
import type { LoginRequest, RegisterRequest, AuthApiResponse } from "../types";
import type { User } from "@/types";

// ── Session helpers (private) ────────────────────────────────

const persistSession = (token: string, user: User): void => {
  localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
};

const clearSession = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
};

// ── Auth Service ─────────────────────────────────────────────

export const authService = {
  /**
   * Login — authenticates the user and persists the session.
   */
  async login(payload: LoginRequest): Promise<AuthApiResponse> {
    const response = await authApi.login(payload);
    persistSession(response.token, response.user);
    return response;
  },

  /**
   * Register — creates a new account and persists the session.
   */
  async register(payload: RegisterRequest): Promise<AuthApiResponse> {
    const response = await authApi.register(payload);
    persistSession(response.token, response.user);
    return response;
  },

  /**
   * Logout — calls backend to invalidate session (best-effort),
   *          then unconditionally clears localStorage.
   */
  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  },

  /**
   * Restore session — reads token + user from localStorage.
   * Called once on app startup to rehydrate the AuthContext.
   * Returns null if no valid session is stored.
   */
  restoreSession(): { token: string; user: User } | null {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USER);

    if (!token || !raw) return null;

    try {
      const user = JSON.parse(raw) as User;
      return { token, user };
    } catch {
      // Corrupted storage — clear it
      clearSession();
      return null;
    }
  },

  /**
   * Update stored user — called after profile edits so the cached
   *                       user stays in sync with the latest data.
   */
  updateStoredUser(user: User): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  },

  /**
   * Mark onboarding as completed for the given user.
   * Stored per-user so multiple accounts on the same device work correctly.
   */
  markOnboardingCompleted(userId: number): void {
    localStorage.setItem(
      `${AUTH_STORAGE_KEYS.ONBOARDING_PREFIX}${userId}`,
      "true",
    );
  },

  /**
   * Check if onboarding has been completed for the given user.
   */
  isOnboardingCompleted(userId: number): boolean {
    return (
      localStorage.getItem(
        `${AUTH_STORAGE_KEYS.ONBOARDING_PREFIX}${userId}`,
      ) === "true"
    );
  },
};
