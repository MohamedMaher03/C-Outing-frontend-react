/**
 * Dashboard Layout
 *
 * here i use shared sidebar-based layout used by both Admin and Moderator roles.
 * Nav items are passed as props so each role gets its own navigation.
 */

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useEffect, useState, type ReactNode } from "react";
import { AuthStatusBanner } from "@/features/auth/components/ui/AuthStatusBanner";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageToggle, useI18n } from "@/components/i18n";
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
  const { t, direction } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    logoutUser,
    isLoading: isLoggingOut,
    error: logoutError,
    clearError: clearLogoutError,
  } = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const sidebarOffset = direction === "rtl" ? 280 : -280;

  const userRoleLabel =
    user?.role === "admin"
      ? t("layout.adminPanel")
      : user?.role === "moderator"
        ? t("layout.moderator")
        : t("layout.userFallback");

  const handleLogout = async () => {
    await logoutUser();
  };

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [sidebarOpen]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo & Title */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <img src={logo} alt="C-Outing" className="h-9 w-auto rounded-lg" />
        <div>
          <span className="text-lg font-bold text-foreground tracking-tight block">
            C-OUTING
          </span>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
            {title}
          </span>
        </div>
      </div>

      <div className="space-y-2 px-5 py-3 border-b border-border">
        <LanguageToggle className="w-full" />
        <ThemeToggle alwaysShowLabels className="w-full" />
      </div>

      {/* User Info */}
      <div className="px-5 py-4 border-b border-border">
        <p
          className="text-sm font-semibold text-foreground break-words"
          title={user?.name || t("layout.userFallback")}
        >
          {user?.name || t("layout.userFallback")}
        </p>
        <p
          className="text-xs text-muted-foreground break-words"
          title={user?.email || ""}
          dir="auto"
        >
          {user?.email || ""}
        </p>
        <span
          className={cn(
            "inline-block mt-1.5 rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider",
            user?.role === "admin"
              ? "border-destructive/25 bg-destructive/12 text-destructive"
              : "border-primary/25 bg-primary/12 text-primary",
          )}
        >
          {userRoleLabel}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              type="button"
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              aria-current={active ? "page" : undefined}
              className={cn(
                "w-full min-h-11 flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
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
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
          className="w-full flex items-center gap-3 rounded-xl border border-red-300/80 bg-red-50/70 px-3 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-wait disabled:opacity-75 dark:border-red-500/45 dark:bg-red-900/35 dark:text-red-100 dark:hover:bg-red-900/55"
        >
          {isLoggingOut ? (
            <>{t("layout.loggingOut")}</>
          ) : (
            <>
              <LogOut className="h-4.5 w-4.5" />
              {t("layout.logout")}
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {logoutError && (
        <div className="fixed left-1/2 top-[4.5rem] z-[90] w-[min(92vw,30rem)] -translate-x-1/2 md:left-auto md:top-4 md:w-[min(28rem,calc(100vw-2rem))] md:translate-x-0 md:[inset-inline-end:1rem]">
          <AuthStatusBanner
            message={logoutError}
            onDismiss={clearLogoutError}
            className="shadow-lg"
          />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-card border-border fixed inset-y-0 z-40 [inset-inline-start:0] [border-inline-end-width:1px]">
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
              className="fixed inset-0 bg-foreground/45 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              id="dashboard-mobile-sidebar"
              initial={
                shouldReduceMotion ? { opacity: 0 } : { x: sidebarOffset }
              }
              animate={{ x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { x: sidebarOffset }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
              }
              className="fixed inset-y-0 w-64 bg-card border-border z-50 md:hidden [inset-inline-start:0] [border-inline-end-width:1px]"
              aria-label={t("layout.navigation", { title })}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:[margin-inline-start:16rem]">
        {/* Top Bar (mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            aria-label={
              sidebarOpen ? t("layout.closeMenu") : t("layout.openMenu")
            }
            aria-expanded={sidebarOpen}
            aria-controls="dashboard-mobile-sidebar"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="C-Outing" className="h-7 w-auto rounded-lg" />
            <span
              className="max-w-[11rem] truncate text-sm font-bold text-foreground"
              title={title}
            >
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle mode="compact" />
            <ThemeToggle mode="compact" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={
                shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={
                shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }
              }
              transition={
                shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }
              }
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
