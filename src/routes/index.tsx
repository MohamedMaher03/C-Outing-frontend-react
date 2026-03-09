import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PageLoading } from "@/components/ui/LoadingSpinner";

// Re-export RoleBasedRoute for convenient importing
export { RoleBasedRoute } from "./RoleBasedRoute";

/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoading />;

  // Not authenticated → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // User authenticated but hasn't completed onboarding → redirect to /onboarding
  if (!user.hasCompletedOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
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
    // Redirect based on role
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === "moderator") {
      return <Navigate to="/moderator" replace />;
    }
    return (
      <Navigate
        to={user.hasCompletedOnboarding ? "/" : "/onboarding"}
        replace
      />
    );
  }

  return children;
}

/**
 * Onboarding Route Guard
 * Allows only authenticated users with an incomplete onboarding.
 * Users who already finished onboarding are sent straight to home.
 */
interface OnboardingRouteProps {
  children: ReactNode;
}

export function OnboardingRoute({ children }: OnboardingRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoading />;

  // Not authenticated → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Role not allowed on onboarding (admin/moderator have no onboarding)
  if (user.role !== "user") return <Navigate to="/not-found" replace />;

  // Already completed → send to home
  if (user.hasCompletedOnboarding) return <Navigate to="/" replace />;

  return children;
}
