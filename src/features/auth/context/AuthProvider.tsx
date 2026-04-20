import React, { useState, useEffect, useCallback } from "react";
import type { User } from "@/types";
import { authService } from "../services/authService";
import type { RegisterRequest } from "../types";
import { AuthContext } from "./AuthContext";
import type { AuthContextType } from "./AuthContext";

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

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const response = await authService.login({ email, password });
      setToken(response.token);
      setUser(response.user);
      setPendingVerificationEmailState(null);
    },
    [],
  );

  const register = useCallback(async (data: RegisterRequest): Promise<void> => {
    await authService.register(data);
    setPendingVerificationEmailState(data.email.trim().toLowerCase());
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

  const resendOtp = useCallback(async (email: string): Promise<void> => {
    await authService.resendOtp({ email });
    setPendingVerificationEmailState(email.trim().toLowerCase());
  }, []);

  const setPendingVerificationEmail = useCallback((email: string): void => {
    const normalizedEmail = email.trim().toLowerCase();
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
    resendOtp,
    setPendingVerificationEmail,
    clearPendingVerificationEmail,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
