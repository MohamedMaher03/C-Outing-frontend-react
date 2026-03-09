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

  // On mount: restore stored session (token + user from localStorage).
  useEffect(() => {
    const init = async () => {
      const session = authService.restoreSession();
      if (session) {
        setToken(session.token);
        setUser(session.user);
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
    },
    [],
  );

  /**
   * Register — triggers account creation + OTP email dispatch.
   * Does NOT set user/token; the user must verify their email first.
   */
  const register = useCallback(async (data: RegisterRequest): Promise<void> => {
    await authService.register(data);
  }, []);

  /**
   * Verify email — validates the OTP. On success the backend returns a
   * full auth session; we persist it and set user + token in state so
   * the user is automatically logged in and redirected to onboarding.
   */
  const verifyEmail = useCallback(
    async (email: string, otp: string): Promise<void> => {
      const response = await authService.verifyEmail({ email, otp });
      setToken(response.token);
      setUser(response.user);
    },
    [],
  );

  /**
   * Resend OTP — requests a new verification code for the given email.
   */
  const resendOtp = useCallback(async (email: string): Promise<void> => {
    await authService.resendOtp({ email });
  }, []);

  /**
   * Logout — delegates to authService (clears storage + calls BE),
   *           then resets React state.
   */
  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setToken(null);
  }, []);

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
    login,
    register,
    verifyEmail,
    resendOtp,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
