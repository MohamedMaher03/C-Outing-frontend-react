import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import type { UserRole } from "@/types";

/**
 * Role-Based Route Component
 * Restricts access based on user role. Supports multiple allowed roles.
 */
interface RoleBasedRouteProps {
  children: ReactNode;
  /** Roles allowed to access this route */
  allowedRoles: UserRole[];
  /** Where to redirect if the role is not allowed (default: "/") */
  redirectTo?: string;
}

export function RoleBasedRoute({
  children,
  allowedRoles,
  redirectTo = "/",
}: RoleBasedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoading />;

  // Not authenticated → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Role not allowed → redirect
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
