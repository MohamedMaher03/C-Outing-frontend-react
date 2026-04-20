import { useRef, useState } from "react";
import { authService } from "../services/authService";
import { getAuthErrorMessage } from "../errors";
import type { ResetPasswordFormData } from "../validation/resetPassword.schema";

interface UseResetPasswordReturn {
  resetPassword: (data: ResetPasswordFormData) => Promise<boolean>;
  resendResetOtp: (email: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useResetPassword = (): UseResetPasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const clearError = () => setError(null);

  const resetPassword = async (
    data: ResetPasswordFormData,
  ): Promise<boolean> => {
    if (inFlightRef.current) return false;

    inFlightRef.current = true;
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
      setError(getAuthErrorMessage(err));
      return false;
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const resendResetOtp = async (email: string): Promise<boolean> => {
    if (inFlightRef.current) return false;

    inFlightRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      await authService.resendOtp({ email });
      return true;
    } catch (err) {
      setError(getAuthErrorMessage(err));
      return false;
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  return { resetPassword, resendResetOtp, isLoading, error, clearError };
};
