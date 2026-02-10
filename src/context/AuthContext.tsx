/**
 * Authentication Context
 * Manages global authentication state and user session
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    age?: number;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider component
 * Wraps application and provides authentication context
 */
export function AuthProvider({
  children,
}: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize auth state from storage on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("authUser");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (_email: string, _password: string): Promise<void> => {
    // Implementation will use authService
    // This is a placeholder structure
  };

  const register = async (_data: {
    name: string;
    email: string;
    password: string;
    age?: number;
  }): Promise<void> => {
    // Implementation will use authService
    // This is a placeholder structure
  };

  const logout = async (): Promise<void> => {
    // Implementation will clear state and storage
    // This is a placeholder structure
  };

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
    localStorage.setItem("authUser", JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook
 * Access authentication context anywhere in the app
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
