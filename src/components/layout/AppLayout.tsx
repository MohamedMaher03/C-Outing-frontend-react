import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Home, Heart, User, LogOut, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { useLogout } from "@/features/auth/hooks/useLogout";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import { NotificationsCountProvider } from "@/features/notifications/context/NotificationsCountContext";
import { InlineLoading } from "@/components/ui/LoadingSpinner";
import { AuthStatusBanner } from "@/features/auth/components/ui/AuthStatusBanner";
import { LogoutProgressOverlay } from "@/features/auth/components/ui/LogoutProgressOverlay";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageToggle, useI18n } from "@/components/i18n";
import logo from "@/assets/images/logo3.png";

const AppLayout = () => {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const {
    logoutUser,
    isLoading: isLoggingOut,
    error: logoutError,
    clearError: clearLogoutError,
  } = useLogout();

  const handleLogout = async () => {
    await logoutUser();
  };

  const navItems = useMemo(
    () => [
      { path: "/", label: t("nav.home"), icon: Home },
      { path: "/map", label: t("nav.map", undefined, "Map"), icon: Map },
      { path: "/favorites", label: t("nav.saved"), icon: Heart },
      { path: "/profile", label: t("nav.profile"), icon: User },
    ],
    [t],
  );

  const logoutToneClassName =
    "border border-red-300/80 bg-red-50/70 text-red-700 transition-colors hover:bg-red-100 disabled:cursor-wait disabled:opacity-75 dark:border-red-500/45 dark:bg-red-900/35 dark:text-red-100 dark:hover:bg-red-900/55";

  const renderLogoutContent = (mobile: boolean) => {
    if (isLoggingOut) {
      return (
        <>
          <InlineLoading size="sm" className={mobile ? "h-5 w-5" : "h-4 w-4"} />
          {mobile ? (
            <span className="max-w-full truncate text-xs font-medium leading-tight">
              {t("layout.loggingOut")}
            </span>
          ) : (
            t("layout.loggingOut")
          )}
        </>
      );
    }

    return (
      <>
        <LogOut className={mobile ? "h-5 w-5" : "h-4 w-4"} />
        {mobile ? (
          <span className="max-w-full truncate text-xs font-medium leading-tight">
            {t("layout.logout")}
          </span>
        ) : (
          t("layout.logout")
        )}
      </>
    );
  };

  return (
    <NotificationsCountProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {logoutError && (
          <div className="fixed left-1/2 top-3 z-[90] w-[min(92vw,30rem)] -translate-x-1/2 md:left-auto md:top-[calc(4rem+0.75rem)] md:w-[min(28rem,calc(100vw-2rem))] md:translate-x-0 md:[inset-inline-end:1rem]">
            <AuthStatusBanner
              message={logoutError}
              onDismiss={clearLogoutError}
              className="shadow-lg"
            />
          </div>
        )}
        <LogoutProgressOverlay isVisible={isLoggingOut} />

        {/* Desktop Top Nav */}
        <header className="hidden md:flex items-center justify-between px-8 py-3 bg-card border-b border-border sticky top-0 z-50">
          <button
            type="button"
            className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            onClick={() => navigate("/")}
            aria-label={t("layout.goHome")}
          >
            <img src={logo} alt="C-Outing" className="h-9 w-auto rounded-lg" />
            <span className="text-xl font-bold text-foreground tracking-tight">
              C-OUTING
            </span>
          </button>
          <nav
            className="flex items-center gap-1"
            aria-label={t("layout.primaryNavigation")}
          >
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  type="button"
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-w-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
            {/* Notification bell with unread badge */}
            <NotificationBell />
            <LanguageToggle className="ml-2" />
            <ThemeToggle className="ml-2" />
            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-busy={isLoggingOut}
              className={cn(
                "ml-2 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
                logoutToneClassName,
              )}
            >
              {renderLogoutContent(false)}
            </button>
          </nav>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-[calc(5rem+max(env(safe-area-inset-bottom),0px))] md:pb-0">
          <motion.div
            key={location.pathname}
            initial={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }
            }
          >
            <Outlet />
          </motion.div>
        </main>

        <div className="fixed bottom-[calc(5.35rem+max(env(safe-area-inset-bottom),0px))] z-50 flex items-center gap-2 md:hidden [inset-inline-end:1rem]">
          <LanguageToggle mode="compact" />
          <ThemeToggle mode="compact" />
        </div>

        {/* Mobile Bottom Tab Bar */}
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 supports-[backdrop-filter]:bg-card/85 supports-[backdrop-filter]:backdrop-blur"
          aria-label={t("layout.bottomNavigation")}
        >
          <div className="grid grid-cols-6 items-stretch gap-1 px-1.5 py-2 pb-[calc(0.625rem+max(env(safe-area-inset-bottom),0px))]">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  type="button"
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-full min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2 transition-colors",
                    active ? "text-secondary" : "text-muted-foreground",
                  )}
                >
                  <item.icon
                    className={cn("h-5 w-5", active && "fill-secondary/20")}
                  />
                  <span className="max-w-full truncate text-xs font-medium leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
            <NotificationBell mobile />
            {/* Mobile Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-busy={isLoggingOut}
              className={cn(
                "flex h-full min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2",
                logoutToneClassName,
              )}
            >
              {renderLogoutContent(true)}
            </button>
          </div>
        </nav>
      </div>
    </NotificationsCountProvider>
  );
};

export default AppLayout;
