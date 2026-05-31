import React, { useState, useEffect, useCallback } from "react";
import type { User } from "@/types";
import { authService } from "../services/authService";
import type { RegisterRequest } from "../types";
import { AuthContext } from "./AuthContext";
import type { AuthContextType } from "./AuthContext";
import { AUTH_SESSION_CLEARED_EVENT } from "../constants";
import { normalizeEmail } from "@/utils/textNormalization";

export interface AuthProviderProps {
  children: React.ReactNode;
}

// Restore session synchronously at module evaluation time so the very first
// render already has the correct auth state — no loading flash on new tabs.
const restoredSession = authService.restoreSession();
const restoredPendingEmail = authService.getPendingVerificationEmail();

export function AuthProvider({
  children,
}: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(restoredSession?.user ?? null);
  const [token, setToken] = useState<string | null>(
    restoredSession?.token ?? null,
  );
  const [pendingVerificationEmail, setPendingVerificationEmailState] = useState<
    string | null
  >(restoredPendingEmail);
  // Session is restored synchronously above, so we never need to show a
  // loading state for auth on initial render.
  const [isLoading] = useState(false);

  useEffect(() => {
    const handleSessionCleared = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, handleSessionCleared);

    return () => {
      window.removeEventListener(
        AUTH_SESSION_CLEARED_EVENT,
        handleSessionCleared,
      );
    };
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      staySignedIn = false,
    ): Promise<void> => {
      const response = await authService.login({
        email,
        password,
        staySignedIn,
      });
      setToken(response.token);
      setUser(response.user);
      setPendingVerificationEmailState(null);
    },
    [],
  );

  const register = useCallback(async (data: RegisterRequest): Promise<void> => {
    await authService.register(data);
    setPendingVerificationEmailState(normalizeEmail(data.email));
  }, []);

  const verifyEmail = useCallback(
    async (email: string, otp: string): Promise<void> => {
      const response = await authService.verifyEmail({ email, otp });
      setToken(response.token);
      setUser(response.user);
      setPendingVerificationEmailState(null);
    },
    [],
  );

  const resendVerificationOtp = useCallback(
    async (email: string): Promise<void> => {
      await authService.resendVerificationOtp({ email });
      setPendingVerificationEmailState(normalizeEmail(email));
    },
    [],
  );

  const resendResetPasswordOtp = useCallback(
    async (email: string): Promise<void> => {
      await authService.resendResetPasswordOtp({ email });
    },
    [],
  );

  const setPendingVerificationEmail = useCallback((email: string): void => {
    const normalizedEmail = normalizeEmail(email);
    authService.setPendingVerificationEmail(normalizedEmail);
    setPendingVerificationEmailState(normalizedEmail || null);
  }, []);

  const clearPendingVerificationEmail = useCallback((): void => {
    authService.clearPendingVerificationEmail();
    setPendingVerificationEmailState(null);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setToken(null);
    setPendingVerificationEmailState(null);
  }, []);

  const updateUser = useCallback((updatedUser: User): void => {
    setUser(updatedUser);
    authService.updateStoredUser(updatedUser);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    pendingVerificationEmail,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    verifyEmail,
    resendVerificationOtp,
    resendResetPasswordOtp,
    setPendingVerificationEmail,
    clearPendingVerificationEmail,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
