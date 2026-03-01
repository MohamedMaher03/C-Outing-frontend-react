import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PageLoading } from "@/components/ui/LoadingSpinner";

/**
 * Protected Route Component
 * Requires authentication AND completed onboarding.
 * - Unauthenticated → /login
 * - Authenticated but onboarding pending → /onboarding
 */
interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, onboardingCompleted } = useAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

/**
 * Public Route Component
 * Redirects authenticated users away from public pages (login, register).
 * - Authenticated + onboarding done → /
 * - Authenticated + onboarding pending → /onboarding
 */
interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, isLoading, onboardingCompleted } = useAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  if (user) {
    return <Navigate to={onboardingCompleted ? "/" : "/onboarding"} replace />;
  }

  return children;
}

/**
 * Onboarding Route Component
 * Only accessible to authenticated users who have NOT yet completed onboarding.
 * - Unauthenticated → /login
 * - Onboarding already completed → /
 */
interface OnboardingRouteProps {
  children: ReactNode;
}

export function OnboardingRoute({ children }: OnboardingRouteProps) {
  const { user, isLoading, onboardingCompleted } = useAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (onboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  return children;
}
