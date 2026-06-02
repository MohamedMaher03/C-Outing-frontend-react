import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import type { UserRole } from "@/types";

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RoleBasedRoute({
  children,
  allowedRoles,
  redirectTo = "/",
}: RoleBasedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoading />;

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
