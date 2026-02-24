import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PageLoading } from "@/components/ui/LoadingSpinner";

/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Public Route Component
 * Redirects authenticated users away from public pages (login, register)
 */
interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  if (user) {
    return <Navigate to="/recommendations" replace />;
  }

  return children;
}
