import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage } from "../errors";

interface UseLogoutReturn {
  logoutUser: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useLogout = (): UseLogoutReturn => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const preloadLoginPage = async (): Promise<void> => {
    try {
      await import("@/features/auth/pages/LoginPage");
    } catch {
      return;
    }
  };

  const logoutUser = async (): Promise<void> => {
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      await preloadLoginPage();
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  return { logoutUser, isLoading, error, clearError };
};
