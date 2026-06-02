import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PageLoading } from "@/components/ui/LoadingSpinner";

export { RoleBasedRoute } from "./RoleBasedRoute";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoading />;
  if (!user) return <Navigate to="/login" replace />;

  if (
    user.role === "user" &&
    !user.hasCompletedOnboarding &&
    location.pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  if (user) {
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

interface OnboardingRouteProps {
  children: ReactNode;
}

export function OnboardingRoute({ children }: OnboardingRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoading />;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "user") return <Navigate to="/not-found" replace />;

  
  if (user.hasCompletedOnboarding) return <Navigate to="/" replace />;

  return children;
}
