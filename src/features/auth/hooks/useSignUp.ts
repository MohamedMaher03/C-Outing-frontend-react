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

import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { AuthError, getAuthErrorMessage } from "../errors";
import type { SignUpFormData } from "../validation/signUp.schema";
import type { ValidationErrors } from "@/utils/apiError";

interface UseSignUpReturn {
  registerUser: (data: SignUpFormData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  validationErrors: ValidationErrors | null;
  clearError: () => void;
}

export const useSignUp = (): UseSignUpReturn => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] =
    useState<ValidationErrors | null>(null);
  const inFlightRef = useRef(false);

  const clearError = () => {
    setError(null);
    setValidationErrors(null);
  };

  const registerUser = async (data: SignUpFormData): Promise<boolean> => {
    if (inFlightRef.current) return false;

    inFlightRef.current = true;
    setIsLoading(true);
    setError(null);
    setValidationErrors(null);

    try {
      await register({
        name: data.fullName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phone,
        dateOfBirth: data.dateOfBirth,
        avatar: data.avatar,
      });
      return true;
    } catch (err) {
      if (err instanceof AuthError) {
        setValidationErrors(err.validationErrors ?? null);
      }
      setError(getAuthErrorMessage(err));
      return false;
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  return { registerUser, isLoading, error, validationErrors, clearError };
};
