/**
 * Authentication Provider
 *
 * Manages global auth state (user, token, loading).
 * All side effects (HTTP calls + localStorage) are delegated to authService.
 */

import React, { useState, useEffect, useCallback } from "react";
import type { User } from "@/types";
import { authService } from "../services/authService";
import type { RegisterRequest } from "../types";
import { AuthContext } from "./AuthContext";
import type { AuthContextType } from "./AuthContext";

// ── Provider ──────────────────────────────────────────────────

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // On mount: restore stored session (token + user from localStorage).
  useEffect(() => {
    const init = async () => {
      const session = authService.restoreSession();
      if (session) {
        setToken(session.token);
        setUser(session.user);
        setOnboardingCompleted(
          authService.isOnboardingCompleted(session.user.userId),
        );
      }
      setIsLoading(false);
    };

    init();
  }, []);

  /**
   * Login — delegates to authService (handles HTTP + storage),
   *          then syncs the returned data into React state.
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const response = await authService.login({ email, password });
      setToken(response.token);
      setUser(response.user);
      setOnboardingCompleted(
        authService.isOnboardingCompleted(response.user.userId),
      );
    },
    [],
  );

  /**
   * Register — same pattern as login.
   * Onboarding is NOT marked complete here; new users must go through it.
   */
  const register = useCallback(async (data: RegisterRequest): Promise<void> => {
    const response = await authService.register(data);
    setToken(response.token);
    setUser(response.user);
    // New users always start with onboarding incomplete
    setOnboardingCompleted(false);
  }, []);

  /**
   * Logout — delegates to authService (clears storage + calls BE),
   *           then resets React state.
   */
  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setToken(null);
    setOnboardingCompleted(false);
  }, []);

  /**
   * MarkOnboardingCompleted — persists the flag and updates React state.
   */
  const markOnboardingCompleted = useCallback((): void => {
    if (user) {
      authService.markOnboardingCompleted(user.userId);
      setOnboardingCompleted(true);
    }
  }, [user]);

  /**
   * UpdateUser — syncs an updated user object into context + storage
   *              (e.g. called after a profile edit).
   */
  const updateUser = useCallback((updatedUser: User): void => {
    setUser(updatedUser);
    authService.updateStoredUser(updatedUser);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    onboardingCompleted,
    login,
    register,
    logout,
    updateUser,
    markOnboardingCompleted,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
