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
import type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  ResendOtpRequest,
  AuthApiResponse,
} from "../types";
import type { User, UserRole } from "@/types";

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
   * Login — maps the flat backend LoginApiData into a User object,
   * persists the session, and returns the internal AuthApiResponse.
   */
  async login(payload: LoginRequest): Promise<AuthApiResponse> {
    const raw = await authApi.login(payload);
    const user: User = {
      userId: raw.userId,
      name: raw.name,
      email: raw.email,
      role: raw.role as UserRole,
      hasCompletedOnboarding: raw.hasCompletedOnboarding ?? false,
    };
    persistSession(raw.token, user);
    return { token: raw.token, user };
  },

  /**
   * Register — creates the account and triggers an OTP email.
   * Does NOT persist a session; the user must verify email first.
   */
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    return await authApi.register(payload);
  },

  /**
   * Verify email — validates the OTP against the backend.
   * On success the backend returns a full auth session (same shape as login),
   * so we build the User, persist the session, and return it.
   * The user is now logged in and should be directed to onboarding.
   */
  async verifyEmail(payload: VerifyEmailRequest): Promise<AuthApiResponse> {
    const raw = await authApi.verifyEmail(payload);
    const user: User = {
      userId: raw.userId,
      name: raw.name,
      email: raw.email,
      role: raw.role as UserRole,
      hasCompletedOnboarding: raw.hasCompletedOnboarding ?? false,
    };
    persistSession(raw.token, user);
    return { token: raw.token, user };
  },

  /**
   * Resend OTP — requests a new verification code for the given email.
   */
  async resendOtp(payload: ResendOtpRequest): Promise<void> {
    await authApi.resendOtp(payload);
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
};
