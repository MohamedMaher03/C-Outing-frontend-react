/**
 * useLogout Hook
 *
 * Handles the complete logout flow:
 *   1. Calls AuthContext.logout (which delegates to authService, clears storage)
 *   2. Navigates to /login on success
 *   3. Surfaces loading and error state to the UI
 *
 * Flow: Component \u2192 useLogout \u2192 AuthContext.logout \u2192 authService \u2192 authApi \u2192 axios
 */

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage } from "../errors";

interface UseLogoutReturn {
  logoutUser: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useLogout = (): UseLogoutReturn => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const preloadLoginPage = async (): Promise<void> => {
    try {
      await import("@/features/auth/pages/LoginPage");
    } catch {
      // Navigation should continue even if preloading fails.
    }
  };

  const logoutUser = async (): Promise<void> => {
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      await preloadLoginPage();
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  return { logoutUser, isLoading, error, clearError };
};
