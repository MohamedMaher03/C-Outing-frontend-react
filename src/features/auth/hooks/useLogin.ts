/**
 * useLogin Hook
 *
 * Handles the complete login flow:
 *   1. Calls AuthContext.login (which delegates to authService → authApi)
 *   2. Surfaces loading and error state to the UI
 *   3. Returns a boolean indicating success so the caller can navigate
 *
 * Flow: LoginForm → useLogin → AuthContext.login → authService → authApi → axios
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage } from "../errors";
import type { LoginFormData } from "../validation/login.schema";

interface UseLoginReturn {
  loginUser: (data: LoginFormData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useLogin = (): UseLoginReturn => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const loginUser = async (data: LoginFormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data.email, data.password);
      return true;
    } catch (err) {
      setError(getAuthErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { loginUser, isLoading, error, clearError };
};
