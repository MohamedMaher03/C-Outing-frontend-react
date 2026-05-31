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

export function AuthProvider({
  children,
}: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmailState] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const session = authService.restoreSession();
      const pendingEmail = authService.getPendingVerificationEmail();
      if (session) {
        setToken(session.token);
        setUser(session.user);
      }
      setPendingVerificationEmailState(pendingEmail);
      setIsLoading(false);
    };

    init();
  }, []);

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
