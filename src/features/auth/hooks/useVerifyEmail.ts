/**
 * useVerifyEmail Hook
 *
 * Handles the email verification flow:
 *   1. Submits the OTP together with the email to AuthContext.verifyEmail
 *   2. Exposes a resendOtp helper for requesting a new code
 *   3. Surfaces loading, resending, and error state to the UI
 *
 * Flow: VerifyEmailPage → useVerifyEmail → AuthContext.verifyEmail → authService → authApi
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage } from "../errors";

interface UseVerifyEmailReturn {
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  isLoading: boolean;
  isResending: boolean;
  error: string | null;
  clearError: () => void;
}

export const useVerifyEmail = (): UseVerifyEmailReturn => {
  const { verifyEmail, resendOtp: contextResendOtp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await verifyEmail(email, otp);
      return true;
    } catch (err) {
      setError(getAuthErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string): Promise<boolean> => {
    setIsResending(true);
    setError(null);

    try {
      await contextResendOtp(email);
      return true;
    } catch (err) {
      setError(getAuthErrorMessage(err));
      return false;
    } finally {
      setIsResending(false);
    }
  };

  return { verifyOtp, resendOtp, isLoading, isResending, error, clearError };
};
