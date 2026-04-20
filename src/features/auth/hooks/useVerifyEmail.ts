import { useRef, useState } from "react";
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
  const verifyInFlightRef = useRef(false);
  const resendInFlightRef = useRef(false);

  const clearError = () => setError(null);

  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    if (verifyInFlightRef.current) return false;

    verifyInFlightRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      await verifyEmail(email, otp);
      return true;
    } catch (err) {
      setError(getAuthErrorMessage(err));
      return false;
    } finally {
      verifyInFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string): Promise<boolean> => {
    if (resendInFlightRef.current) return false;

    resendInFlightRef.current = true;
    setIsResending(true);
    setError(null);

    try {
      await contextResendOtp(email);
      return true;
    } catch (err) {
      setError(getAuthErrorMessage(err));
      return false;
    } finally {
      resendInFlightRef.current = false;
      setIsResending(false);
    }
  };

  return { verifyOtp, resendOtp, isLoading, isResending, error, clearError };
};
