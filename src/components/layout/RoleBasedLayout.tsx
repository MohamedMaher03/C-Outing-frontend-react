import { useAuth } from "@/features/auth/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Outlet } from "react-router-dom";
import type { DashboardNavItem } from "@/components/layout/DashboardLayout";

interface Props {
  adminNavItems: DashboardNavItem[];
  moderatorNavItems: DashboardNavItem[];
}

export default function RoleBasedLayout({
  adminNavItems,
  moderatorNavItems,
}: Props) {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "admin") {
    return (
      <DashboardLayout navItems={adminNavItems} title="Admin Panel">
        <Outlet />
      </DashboardLayout>
    );
  }

  if (user.role === "moderator") {
    return (
      <DashboardLayout navItems={moderatorNavItems} title="Moderator">
        <Outlet />
      </DashboardLayout>
    );
  }

  // default → normal user
  return <AppLayout></AppLayout>;
}
