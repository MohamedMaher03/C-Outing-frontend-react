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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage } from "../errors";

interface UseLogoutReturn {
  logoutUser: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useLogout = (): UseLogoutReturn => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoutUser = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return { logoutUser, isLoading, error };
};
