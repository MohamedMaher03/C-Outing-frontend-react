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

import type { LoginRequest, RegisterRequest, AuthApiResponse } from "../types";
import type { User } from "@/types";
import { AuthError } from "../errors";

// ── Mock seed data ───────────────────────────────────────────

const MOCK_USER: User = {
  userId: 1,
  name: "maher Smith",
  email: "jane@example.com",
  age: 28,
  preferences: [0.9, 0.6, 0.4, 0.2],
  lastUpdated: new Date(),
  totalInteractions: 12,
  hasCompletedOnboarding: true,
  role: "user",
};

const MOCK_ADMIN: User = {
  userId: 99,
  name: "Admin User",
  email: "admin@example.com",
  age: 35,
  preferences: [],
  lastUpdated: new Date(),
  totalInteractions: 0,
  hasCompletedOnboarding: true,
  role: "admin",
};

const MOCK_MODERATOR: User = {
  userId: 50,
  name: "Moderator User",
  email: "mod@example.com",
  age: 30,
  preferences: [],
  lastUpdated: new Date(),
  totalInteractions: 0,
  hasCompletedOnboarding: true,
  role: "moderator",
};

const MOCK_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.bW9ja19wYXlsb2Fk.mock_signature";

// ── Helper ───────────────────────────────────────────────────

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
  async login(payload: LoginRequest): Promise<AuthApiResponse> {
    await delay(900);

    if (payload.password === "wrongpass") {
      throw new AuthError("INVALID_CREDENTIALS");
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
      userId: mockUser.userId,
      token: MOCK_TOKEN,
      user: mockUser,
    };
  },

  /**
   * Mock POST /users/register
   * Use email "exists@example.com" to simulate duplicate-email error.
   * Use phone "0000000000" to simulate duplicate-phone error.
   */
  async register(payload: RegisterRequest): Promise<AuthApiResponse> {
    await delay(1100);

    if (payload.email === "exists@example.com") {
      throw new AuthError("EMAIL_ALREADY_EXISTS");
    }

    if (payload.phone === "0000000000") {
      throw new AuthError("PHONE_ALREADY_EXISTS");
    }

    const newUser: User = {
      ...MOCK_USER,
      userId: Math.floor(Math.random() * 9000) + 100,
      name: payload.name,
      email: payload.email,
      age: payload.age ?? 18,
      preferences: [],
      totalInteractions: 0,
      lastUpdated: new Date(),
      hasCompletedOnboarding: false,
      role: "user",
    };

    return {
      userId: newUser.userId,
      token: MOCK_TOKEN,
      user: newUser,
    };
  },

  /**
   * Mock POST /users/logout
   * Always succeeds after a short delay.
   */
  async logout(): Promise<void> {
    await delay(300);
  },
};
