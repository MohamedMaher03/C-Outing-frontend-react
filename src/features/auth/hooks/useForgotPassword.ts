/**
 * useForgotPassword Hook
 *
 * Handles the forgot-password flow:
 *   1. Calls authService.forgotPassword with the provided email
 *   2. On success, returns true so the UI can navigate to reset-password
 *   3. Surfaces loading and error state
 *
 * Flow: ForgotPasswordPage → useForgotPassword → authService → authApi → axios
 */

import { useState } from "react";
import { authService } from "../services/authService";
import { AUTH_ERROR_MESSAGES } from "../constants";
import { AuthError } from "../errors";
import type { ForgotPasswordFormData } from "../validation/forgotPassword.schema";

interface UseForgotPasswordReturn {
  sendResetOtp: (data: ForgotPasswordFormData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useForgotPassword = (): UseForgotPasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const sendResetOtp = async (
    data: ForgotPasswordFormData,
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword({ email: data.email });
      return true;
    } catch (err) {
      const code = err instanceof AuthError ? err.code : "UNKNOWN_ERROR";
      setError(AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { sendResetOtp, isLoading, error, clearError };
};
