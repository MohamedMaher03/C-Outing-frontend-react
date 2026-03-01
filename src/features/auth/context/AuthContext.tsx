/**
 * Authentication Context
 *
 * Defines the auth context shape and exports the raw context object
 * and the useAuth hook. The provider lives in AuthProvider.tsx.
 *
 * ┌──────────────────────────────────────────────────────────┐
 * │  AuthContext  →  authService  →  authApi  →  axios       │
 * └──────────────────────────────────────────────────────────┘
 */

import { createContext, useContext } from "react";
import type { User } from "@/types";
import type { RegisterRequest } from "../types";

// ── Context type ────────────────────────────────────────────────

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Whether the current user has completed the onboarding flow. */
  onboardingCompleted: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  /** Persist onboarding completion for the current user. */
  markOnboardingCompleted: () => void;
}

// ── Context ─────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// ── Hook ───────────────────────────────────────────────────────

/**
 * useAuth — access the auth context anywhere inside AuthProvider.
 * Throws a clear error if used outside the provider tree.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
