import { useRef, useState } from "react";
import { authService } from "../services/authService";
import { getAuthErrorMessage } from "../errors";
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
  const inFlightRef = useRef(false);

  const clearError = () => setError(null);

  const sendResetOtp = async (
    data: ForgotPasswordFormData,
  ): Promise<boolean> => {
    if (inFlightRef.current) return false;

    inFlightRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword({ email: data.email });
      return true;
    } catch (err) {
      setError(getAuthErrorMessage(err));
      return false;
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  return { sendResetOtp, isLoading, error, clearError };
};
