/**
 * useSignUp Hook
 *
 * Handles the complete registration flow:
 *   1. Calls AuthContext.register (which delegates to authService → authApi)
 *   2. Surfaces loading and error state to the UI
 *   3. Returns a boolean indicating success so the caller can navigate
 *
 * Flow: SignUpForm → useSignUp → AuthContext.register → authService → authApi → axios
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { AUTH_ERROR_MESSAGES } from "../constants";
import { AuthError } from "../errors";
import type { SignUpFormData } from "../validation/signUp.schema";

interface UseSignUpReturn {
  registerUser: (data: SignUpFormData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useSignUp = (): UseSignUpReturn => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const registerUser = async (data: SignUpFormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await register({
        name: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
      });
      return true;
    } catch (err) {
      const code = err instanceof AuthError ? err.code : "UNKNOWN_ERROR";
      setError(AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { registerUser, isLoading, error, clearError };
};
