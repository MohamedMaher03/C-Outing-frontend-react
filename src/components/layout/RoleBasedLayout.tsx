import { useAuth } from "@/features/auth/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Outlet } from "react-router-dom";
import type { DashboardNavItem } from "@/components/layout/DashboardLayout";

interface Props {
  adminNavItems: DashboardNavItem[];
  moderatorNavItems: DashboardNavItem[];
  adminTitle: string;
  moderatorTitle: string;
}

export default function RoleBasedLayout({
  adminNavItems,
  moderatorNavItems,
  adminTitle,
  moderatorTitle,
}: Props) {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "admin") {
    return (
      <DashboardLayout navItems={adminNavItems} title={adminTitle}>
        <Outlet />
      </DashboardLayout>
    );
  }

  if (user.role === "moderator") {
    return (
      <DashboardLayout navItems={moderatorNavItems} title={moderatorTitle}>
        <Outlet />
      </DashboardLayout>
    );
  }

  // default → normal user
  return <AppLayout></AppLayout>;
}
