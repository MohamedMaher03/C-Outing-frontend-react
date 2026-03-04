/**
 * Dashboard Layout
 *
 * Shared sidebar-based layout used by both Admin and Moderator roles.
 * Nav items are passed as props so each role gets its own navigation.
 *
 * Matches the project's design system:
 *   – bg-background, bg-card, text-foreground, border-border
 *   – Secondary (gold) accent for active states
 *   – Plus Jakarta Sans font (inherited)
 */

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useState, type ReactNode } from "react";
import logo from "@/assets/images/logo3.png";

export interface DashboardNavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  navItems: DashboardNavItem[];
  title: string;
  children?: ReactNode;
}

const DashboardLayout = ({ navItems, title }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo & Title */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <img src={logo} alt="C-Outing" className="h-9 w-auto rounded-lg" />
        <div>
          <span className="text-lg font-bold text-foreground tracking-tight block">
            C-OUTING
          </span>
          <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">
            {title}
          </span>
        </div>
      </div>

      {/* User Info */}
      <div className="px-5 py-4 border-b border-border">
        <p className="text-sm font-semibold text-foreground truncate">
          {user?.name || "User"}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {user?.email || ""}
        </p>
        <span
          className={cn(
            "inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
            user?.role === "admin"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700",
          )}
        >
          {user?.role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-4.5 w-4.5",
                  active && "text-primary-foreground",
                )}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-card border-r border-border fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Bar (mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="C-Outing" className="h-7 w-auto rounded-lg" />
            <span className="text-sm font-bold text-foreground">{title}</span>
          </div>
          <div className="w-9" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
