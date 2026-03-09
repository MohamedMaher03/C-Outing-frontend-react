/**
 * useResetPassword Hook
 *
 * Handles the password-reset flow:
 *   1. Calls authService.resetPassword with email + OTP + new password
 *   2. Returns true on success so the UI can redirect to /login
 *   3. Surfaces loading and error state
 *
 * Flow: ResetPasswordPage → useResetPassword → authService → authApi → axios
 */

import { useState } from "react";
import { authService } from "../services/authService";
import { AUTH_ERROR_MESSAGES } from "../constants";
import { AuthError } from "../errors";
import type { ResetPasswordFormData } from "../validation/resetPassword.schema";

interface UseResetPasswordReturn {
  resetPassword: (data: ResetPasswordFormData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useResetPassword = (): UseResetPasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const resetPassword = async (
    data: ResetPasswordFormData,
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword({
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
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

  return { resetPassword, isLoading, error, clearError };
};
