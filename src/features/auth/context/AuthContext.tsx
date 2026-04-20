import { createContext, useContext } from "react";
import type { User } from "@/types";
import type { RegisterRequest } from "../types";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  pendingVerificationEmail: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  setPendingVerificationEmail: (email: string) => void;
  clearPendingVerificationEmail: () => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
