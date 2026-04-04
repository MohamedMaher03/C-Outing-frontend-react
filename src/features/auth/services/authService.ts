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
 * Mock control:
 *   VITE_AUTH_USE_MOCKS=true|false
 * Falls back to VITE_USE_MOCKS when VITE_AUTH_USE_MOCKS is not set.
 */

import { authApi } from "../api/authApi";
import { authMock } from "../mocks/authMock";
import { AUTH_STORAGE_KEYS } from "../constants";
import type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  ResendOtpRequest,
  AuthApiResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../types";
import type { User } from "@/types";
import { buildUserFromAuthToken } from "./jwtClaims";

const parseBooleanEnv = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

const resolveFeatureMockFlag = (featureValue: unknown): boolean => {
  if (typeof featureValue === "string") {
    return parseBooleanEnv(featureValue);
  }

  return parseBooleanEnv(import.meta.env.VITE_USE_MOCKS);
};

const shouldUseAuthMocks = resolveFeatureMockFlag(
  import.meta.env.VITE_AUTH_USE_MOCKS,
);
const authDataSource = shouldUseAuthMocks ? authMock : authApi;

// ── Session helpers (private) ────────────────────────────────

const canUseStorage = (): boolean =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const getStorageItem = (key: string): string | null => {
  if (!canUseStorage()) return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStorageItem = (key: string, value: string): boolean => {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const removeStorageItem = (key: string): void => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // no-op: storage can be disabled in strict browser modes
  }
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const readPendingVerificationEmail = (): string | null => {
  const raw = getStorageItem(AUTH_STORAGE_KEYS.PENDING_VERIFICATION_EMAIL);
  if (!raw) return null;

  const email = normalizeEmail(raw);
  return email.length > 0 ? email : null;
};

const persistPendingVerificationEmail = (email: string): void => {
  const normalized = normalizeEmail(email);
  if (normalized.length === 0) {
    clearPendingVerificationEmailStorage();
    return;
  }

  setStorageItem(AUTH_STORAGE_KEYS.PENDING_VERIFICATION_EMAIL, normalized);
};

const clearPendingVerificationEmailStorage = (): void => {
  removeStorageItem(AUTH_STORAGE_KEYS.PENDING_VERIFICATION_EMAIL);
};

const isUserRole = (value: unknown): value is User["role"] =>
  value === "user" || value === "moderator" || value === "admin";

const isStoredUser = (value: unknown): value is User => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<User>;

  return (
    typeof candidate.userId === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.hasCompletedOnboarding === "boolean" &&
    isUserRole(candidate.role)
  );
};

const persistSession = (token: string, user: User): void => {
  const tokenStored = setStorageItem(AUTH_STORAGE_KEYS.TOKEN, token);
  const userStored = setStorageItem(
    AUTH_STORAGE_KEYS.USER,
    JSON.stringify(user),
  );

  // Keep storage consistent if one write fails.
  if (!tokenStored || !userStored) {
    removeStorageItem(AUTH_STORAGE_KEYS.TOKEN);
    removeStorageItem(AUTH_STORAGE_KEYS.USER);
  }
};

const clearSession = (): void => {
  removeStorageItem(AUTH_STORAGE_KEYS.TOKEN);
  removeStorageItem(AUTH_STORAGE_KEYS.USER);
};

// ── Auth Service ─────────────────────────────────────────────

export const authService = {
  /**
   * Login — extracts user claims from JWT,
   * persists the session, and returns the internal AuthApiResponse.
   */
  async login(payload: LoginRequest): Promise<AuthApiResponse> {
    const raw = await authDataSource.login(payload);
    const user: User = buildUserFromAuthToken(raw);
    persistSession(raw.token, user);
    clearPendingVerificationEmailStorage();
    return { token: raw.token, user };
  },

  /**
   * Register — creates the account and triggers an OTP email.
   * Does NOT persist a session; the user must verify email first.
   */
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const response = await authDataSource.register(payload);
    persistPendingVerificationEmail(payload.email);
    return response;
  },

  /**
   * Verify email — validates the OTP against the backend.
   * On success the backend returns a token payload (same shape as login),
   * so we derive User claims from the token, persist the session, and return it.
   * The user is now logged in and should be directed to onboarding.
   */
  async verifyEmail(payload: VerifyEmailRequest): Promise<AuthApiResponse> {
    const raw = await authDataSource.verifyEmail(payload);
    const user: User = buildUserFromAuthToken(raw);
    persistSession(raw.token, user);
    clearPendingVerificationEmailStorage();
    return { token: raw.token, user };
  },

  /**
   * Resend OTP — requests a new verification code for the given email.
   */
  async resendOtp(payload: ResendOtpRequest): Promise<void> {
    await authDataSource.resendOtp(payload);
  },

  /**
   * Logout — calls backend to invalidate session (best-effort),
   *          then unconditionally clears localStorage.
   */
  async logout(): Promise<void> {
    try {
      await authDataSource.logout();
    } finally {
      clearSession();
      clearPendingVerificationEmailStorage();
    }
  },

  setPendingVerificationEmail(email: string): void {
    persistPendingVerificationEmail(email);
  },

  getPendingVerificationEmail(): string | null {
    return readPendingVerificationEmail();
  },

  clearPendingVerificationEmail(): void {
    clearPendingVerificationEmailStorage();
  },

  /**
   * Restore session — reads token + user from localStorage.
   * Called once on app startup to rehydrate the AuthContext.
   * Returns null if no valid session is stored.
   */
  restoreSession(): { token: string; user: User } | null {
    const token = getStorageItem(AUTH_STORAGE_KEYS.TOKEN);
    const raw = getStorageItem(AUTH_STORAGE_KEYS.USER);

    if (!token || !raw) return null;

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!isStoredUser(parsed)) {
        clearSession();
        return null;
      }

      return { token, user: parsed };
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
    setStorageItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  },

  /**
   * Forgot password — sends an OTP to the given email for password reset.
   */
  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    await authDataSource.forgotPassword(payload);
  },

  /**
   * Reset password — validates the OTP and updates the password.
   */
  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await authDataSource.resetPassword(payload);
  },
};
