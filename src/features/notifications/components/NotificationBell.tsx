import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, CheckCheck, Inbox, RefreshCw, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import NotificationItem from "@/features/notifications/components/NotificationItem";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { useI18n } from "@/components/i18n";

interface NotificationBellProps {
  mobile?: boolean;
}

const NotificationBell = ({ mobile = false }: NotificationBellProps) => {
  const { t, formatNumber } = useI18n();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const dialogId = mobile
    ? "notifications-panel-mobile"
    : "notifications-panel-desktop";
  const [openState, setOpenState] = useState({
    path: location.pathname,
    open: false,
  });
  const open = openState.path === location.pathname && openState.open;

  const setOpenForCurrentPath = useCallback(
    (nextOpen: boolean) => {
      setOpenState({ path: location.pathname, open: nextOpen });
    },
    [location.pathname],
  );

  const {
    filteredNotifications,
    unreadCount,
    loading,
    error,
    filterTab,
    setFilterTab,
    markAsRead,
    markAllRead,
    removeNotification,
    markAllPending,
    itemPendingMap,
    actionError,
    clearActionError,
    refresh,
  } = useNotifications({ autoFetch: false });

  const panelError = actionError ?? error;

  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpenForCurrentPath(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenForCurrentPath(false);
      }
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpenForCurrentPath]);

  useEffect(() => {
    if (!open || !mobile) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobile, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    panelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const shouldShowLoader = !hasLoadedOnceRef.current;
    hasLoadedOnceRef.current = true;

    void refresh({
      showLoader: shouldShowLoader,
      showPageError: true,
    });
  }, [open, refresh]);

  useEffect(() => {
    if (open) return;
    clearActionError();
  }, [clearActionError, open]);

  const handleRetry = useCallback(() => {
    clearActionError();
    void refresh({
      showLoader: true,
      showPageError: true,
      forceRefresh: true,
    });
  }, [clearActionError, refresh]);

  const panelTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2 };
  const unreadDisplay =
    unreadCount > 99 ? "99+" : formatNumber(Math.max(0, unreadCount));
  const unreadLabel = t("notifications.unread", {
    count: unreadDisplay,
  });

  return (
    <div ref={rootRef} className="relative">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {unreadCount > 0
          ? t("notifications.unreadStatus", {
              count: unreadDisplay,
            })
          : t("notifications.noUnreadStatus")}
      </p>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        aria-label={`${t("nav.notifications")}${unreadCount > 0 ? `, ${unreadLabel}` : ""}`}
        onClick={() => setOpenForCurrentPath(!open)}
        className={cn(
          "relative transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          mobile
            ? "flex h-full min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 py-1.5 text-muted-foreground hover:text-foreground"
            : "flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Bell
          className={cn(
            mobile ? "h-5 w-5" : "h-4 w-4",
            open && "text-secondary",
          )}
        />
        <span
          className={cn(
            mobile
              ? "max-w-full truncate text-xs font-medium leading-tight"
              : "hidden lg:inline",
          )}
        >
          {t("nav.notifications")}
        </span>

        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute h-4 min-w-4 px-1 rounded-full bg-secondary text-primary text-[11px] font-bold flex items-center justify-center leading-none shadow-sm",
              mobile
                ? "top-0 [inset-inline-end:0.375rem]"
                : "-top-1 [inset-inline-end:-0.25rem]",
            )}
          >
            {unreadDisplay}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {mobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/72 md:hidden"
                onClick={() => setOpenForCurrentPath(false)}
              />
            )}

            <motion.div
              ref={panelRef}
              id={dialogId}
              role="dialog"
              aria-modal={mobile || undefined}
              aria-busy={loading}
              aria-label={t("notifications.panel")}
              tabIndex={-1}
              initial={
                mobile ? { y: "100%", opacity: 0.6 } : { y: -8, opacity: 0 }
              }
              animate={mobile ? { y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
              exit={
                mobile ? { y: "100%", opacity: 0.4 } : { y: -8, opacity: 0 }
              }
              transition={panelTransition}
              className={cn(
                "border border-border bg-card z-[60] overflow-hidden",
                mobile
                  ? "fixed inset-x-0 bottom-0 rounded-t-2xl max-h-[min(84svh,36rem)] pb-[max(env(safe-area-inset-bottom),0.75rem)] md:hidden"
                  : "absolute top-[calc(100%+10px)] w-[min(92vw,22.5rem)] lg:w-[24rem] rounded-2xl shadow-2xl [inset-inline-end:0]",
              )}
            >
              <div className="border-b border-border bg-background px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-role-secondary font-semibold text-foreground">
                    {t("nav.notifications")}
                  </p>
                  {unreadCount > 0 && (
                    <p className="text-role-caption text-muted-foreground text-numeric-tabular">
                      {unreadLabel}
                    </p>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-end gap-2">
                  {unreadCount > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={markAllRead}
                      disabled={markAllPending || loading}
                      className="min-h-11 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-secondary dark:text-accent hover:bg-secondary/10 dark:hover:bg-accent/10 hover:text-secondary/80 dark:hover:text-accent/80"
                    >
                      {markAllPending ? (
                        <RefreshCw
                          className={cn(
                            "h-3.5 w-3.5",
                            !shouldReduceMotion && "animate-spin",
                          )}
                        />
                      ) : (
                        <CheckCheck className="h-3.5 w-3.5" />
                      )}
                      {markAllPending
                        ? t("notifications.updating")
                        : t("notifications.markAllRead")}
                    </Button>
                  )}
                  {mobile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setOpenForCurrentPath(false)}
                      className="h-11 w-11 rounded-full"
                      aria-label={t("notifications.close")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="px-4 py-2 border-b border-border bg-muted/30">
                <div className="grid grid-cols-2 rounded-full bg-background p-1">
                  {(["all", "unread"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      aria-pressed={filterTab === tab}
                      onClick={() => setFilterTab(tab)}
                      className={cn(
                        "min-h-11 rounded-full px-3 py-1 text-xs font-medium transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        filterTab === tab
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {tab === "all"
                        ? t("notifications.filter.all")
                        : t("notifications.filter.unread")}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  "overflow-y-auto",
                  mobile ? "max-h-[min(60svh,24rem)]" : "max-h-[420px]",
                )}
              >
                {loading && (
                  <div className="py-10">
                    <LoadingSpinner
                      size="sm"
                      text={t("notifications.loading")}
                    />
                  </div>
                )}

                {!loading && panelError && (
                  <Alert
                    variant="destructive"
                    className="m-4 border-destructive/30"
                  >
                    <AlertTitle className="text-role-secondary">
                      {actionError
                        ? t("notifications.updateError")
                        : t("notifications.loadError")}
                    </AlertTitle>
                    <AlertDescription className="mt-2 space-y-2 text-role-secondary">
                      <p className="break-words">{panelError}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="min-h-10"
                          onClick={handleRetry}
                        >
                          {t("common.retry")}
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {!loading &&
                  !panelError &&
                  filteredNotifications.length === 0 && (
                    <div className="py-12 px-6 text-center space-y-2">
                      <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Inbox className="h-6 w-6 text-muted-foreground/60" />
                      </div>
                      <p className="text-role-secondary font-semibold text-foreground">
                        {filterTab === "unread"
                          ? t("notifications.empty.unread")
                          : t("notifications.empty.all")}
                      </p>
                      <p className="text-role-secondary text-muted-foreground">
                        {t("notifications.empty.hint")}
                      </p>
                    </div>
                  )}

                {!loading &&
                  !panelError &&
                  filteredNotifications.length > 0 && (
                    <div className="space-y-2 p-3 [content-visibility:auto] [contain-intrinsic-size:420px]">
                      {filteredNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkRead={markAsRead}
                          onDelete={removeNotification}
                          pending={Boolean(itemPendingMap[notification.id])}
                        />
                      ))}
                    </div>
                  )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
