/**
 * Auth Mock Implementations
 *
 * Drop-in replacements for authApi — mirrors the same interface so it can be
 * swapped in authService.ts without changing any other code:
 *
 *   // authService.ts — swap this one line:
 *   import { authMock as authApi } from "../mocks/authMock";
 *
 * Simulates realistic network latency and common error scenarios so the UI
 * can be fully developed and tested without a running backend.
 */

import type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  ResendOtpRequest,
  AuthTokenApiData,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../types";
import type { User } from "@/types";
import { AuthError } from "../errors";

// ── Mock seed data ───────────────────────────────────────────

const MOCK_USER: User = {
  userId: "00000000-0000-0000-0000-000000000001",
  name: "maher Smith",
  email: "jane@example.com",
  hasCompletedOnboarding: true,
  role: "user",
};

const MOCK_ADMIN: User = {
  userId: "00000000-0000-0000-0000-000000000099",
  name: "Admin User",
  email: "admin@example.com",
  hasCompletedOnboarding: true,
  role: "admin",
};

const MOCK_MODERATOR: User = {
  userId: "00000000-0000-0000-0000-000000000050",
  name: "Moderator User",
  email: "mod@example.com",
  hasCompletedOnboarding: true,
  role: "moderator",
};

const encodeBase64Url = (value: string): string =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const createMockToken = (user: User): string => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier":
      user.userId,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress":
      user.email,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": user.name,
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": user.role,
    exp: now + 60 * 60,
    iat: now,
  };

  return [
    encodeBase64Url(JSON.stringify(header)),
    encodeBase64Url(JSON.stringify(payload)),
    "mock_signature",
  ].join(".");
};

/** Mock OTP used during development — any other OTP will fail. */
const MOCK_OTP = "123456";

/**
 * Holds users who have registered but not yet verified their email.
 * Key: email address. Value: the pre-built User object.
 */
const pendingVerifications = new Map<string, User>();

// ── Helper ──────────────────────────────────────────────────────

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ── Mock Auth API ────────────────────────────────────────────
// Interface intentionally mirrors authApi so they are interchangeable.

export const authMock = {
  /**
   * Mock POST /users/login
   * Use password "wrongpass" to simulate invalid-credentials error.
   *
   * Test accounts (any password except "wrongpass"):
   *   admin@example.com  → Admin role
   *   mod@example.com    → Moderator role
   *   (anything else)    → Regular user role
   */
  async login(payload: LoginRequest): Promise<AuthTokenApiData> {
    await delay(900);

    if (payload.password === "wrongpass") {
      throw new AuthError("INVALID_CREDENTIALS");
    }

    if (pendingVerifications.has(payload.email)) {
      throw new AuthError(
        "EMAIL_NOT_VERIFIED",
        "Your email is not verified yet. Verify your account to continue.",
      );
    }

    // Pick the right mock user based on email
    let mockUser: User;
    if (payload.email === "admin@example.com") {
      mockUser = { ...MOCK_ADMIN, email: payload.email };
    } else if (payload.email === "mod@example.com") {
      mockUser = { ...MOCK_MODERATOR, email: payload.email };
    } else {
      mockUser = { ...MOCK_USER, email: payload.email };
    }

    return {
      token: createMockToken(mockUser),
      hasCompletedOnboarding: mockUser.hasCompletedOnboarding,
    };
  },

  /**
   * Mock POST /users/register
   * Use email "exists@example.com" to simulate duplicate-email error.
   * Use phone "0000000000" to simulate duplicate-phone error.
   *
   * On success, queues the user for pending email verification.
   * The OTP to use on /verify-email is always "123456".
   */
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    await delay(1100);

    if (payload.email === "exists@example.com") {
      throw new AuthError("EMAIL_ALREADY_EXISTS");
    }

    if (payload.phoneNumber === "0000000000") {
      throw new AuthError("PHONE_ALREADY_EXISTS");
    }

    const newUser: User = {
      ...MOCK_USER,
      userId: `mock-${Math.floor(Math.random() * 9000) + 100}`,
      name: payload.name,
      email: payload.email,
      hasCompletedOnboarding: false,
      role: "user",
    };

    // Store for later retrieval by verifyEmail
    pendingVerifications.set(payload.email, newUser);

    return "OTP sent to your email";
  },

  /**
   * Mock POST /verify-email
   * Use OTP "123456" for a successful verification.
   * Any other code throws INVALID_OTP.
   *
   * Returns a full auth session (token + user) so the caller can
   * auto-login the user and redirect directly to onboarding.
   */
  async verifyEmail(payload: VerifyEmailRequest): Promise<AuthTokenApiData> {
    await delay(900);

    if (payload.otp !== MOCK_OTP) {
      throw new AuthError("INVALID_OTP");
    }

    // Retrieve the user queued during register; fall back to a safe default
    let user = pendingVerifications.get(payload.email);
    if (!user) {
      user = {
        ...MOCK_USER,
        email: payload.email,
        hasCompletedOnboarding: false,
      };
    }
    pendingVerifications.delete(payload.email);

    return {
      token: createMockToken(user),
      hasCompletedOnboarding: user.hasCompletedOnboarding,
    };
  },

  /**
   * Mock POST /resend-otp
   * Use email "unregistered@example.com" to simulate not-found error.
   * Always succeeds for any other email after a short delay.
   */
  async resendOtp(_payload: ResendOtpRequest): Promise<void> {
    await delay(800);
    if (_payload.email === "unregistered@example.com") {
      throw new AuthError("EMAIL_NOT_FOUND");
    }
    // In mock, resend always succeeds — just simulate the delay
  },

  /**
   * Mock POST /users/logout
   * Always succeeds after a short delay.
   */
  async logout(): Promise<void> {
    await delay(300);
  },

  /**
   * Mock POST /forgot-password
   * Use email "unknown@example.com" to simulate email-not-found error.
   * Any other email succeeds and "sends" an OTP (always "123456" in mock).
   */
  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    await delay(900);
    if (payload.email === "unknown@example.com") {
      throw new AuthError("EMAIL_NOT_FOUND");
    }
    // In mock the OTP is always MOCK_OTP — store email for reset
    pendingVerifications.set(payload.email, {
      ...MOCK_USER,
      email: payload.email,
    });
  },

  /**
   * Mock POST /reset-password
   * Use OTP "123456" for success. Any other OTP throws INVALID_RESET_OTP.
   */
  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await delay(900);
    if (payload.otp !== MOCK_OTP) {
      throw new AuthError("INVALID_RESET_OTP");
    }
    pendingVerifications.delete(payload.email);
  },
};
