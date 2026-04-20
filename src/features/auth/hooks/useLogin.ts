import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage, isEmailNotVerifiedError } from "../errors";
import type { LoginFormData } from "../validation/login.schema";
import { normalizeEmail } from "@/utils/textNormalization";

interface UseLoginReturn {
  loginUser: (data: LoginFormData) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
  isLoading: boolean;
  isResendingVerification: boolean;
  error: string | null;
  pendingVerificationEmail: string | null;
  clearError: () => void;
}

export const useLogin = (): UseLoginReturn => {
  const {
    login,
    resendOtp,
    setPendingVerificationEmail,
    pendingVerificationEmail,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);
  const resendInFlightRef = useRef(false);

  const clearError = () => setError(null);

  const loginUser = async (data: LoginFormData): Promise<boolean> => {
    if (inFlightRef.current) return false;

    inFlightRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      await login(data.email, data.password);
      return true;
    } catch (err) {
      setError(getAuthErrorMessage(err));
      if (isEmailNotVerifiedError(err)) {
        setPendingVerificationEmail(data.email);
      }
      return false;
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string): Promise<boolean> => {
    if (resendInFlightRef.current) return false;

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return false;

    resendInFlightRef.current = true;
    setIsResendingVerification(true);
    setError(null);

    try {
      await resendOtp(normalizedEmail);
      setPendingVerificationEmail(normalizedEmail);
      return true;
    } catch (err) {
      setError(getAuthErrorMessage(err));
      return false;
    } finally {
      resendInFlightRef.current = false;
      setIsResendingVerification(false);
    }
  };

  return {
    loginUser,
    resendVerificationEmail,
    isLoading,
    isResendingVerification,
    error,
    pendingVerificationEmail,
    clearError,
  };
};
