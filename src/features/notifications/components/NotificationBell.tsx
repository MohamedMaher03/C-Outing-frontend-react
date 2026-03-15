import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, CheckCheck, Inbox, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import NotificationItem from "@/features/notifications/components/NotificationItem";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";

interface NotificationBellProps {
  mobile?: boolean;
}

const NotificationBell = ({ mobile = false }: NotificationBellProps) => {
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement | null>(null);
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
  } = useNotifications();

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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        onClick={() => setOpenForCurrentPath(!open)}
        className={cn(
          "relative transition-colors",
          mobile
            ? "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[60px] text-muted-foreground hover:text-foreground"
            : "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
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
            mobile ? "text-[10px] font-medium" : "hidden lg:inline",
          )}
        >
          Notifications
        </span>

        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute h-4 min-w-4 px-1 rounded-full bg-secondary text-primary text-[10px] font-bold flex items-center justify-center leading-none shadow-sm",
              mobile ? "top-0 right-2" : "-top-1 -right-1",
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
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
                className="fixed inset-0 bg-black/40 z-50 md:hidden"
                onClick={() => setOpenForCurrentPath(false)}
              />
            )}

            <motion.div
              role="dialog"
              aria-label="Notifications panel"
              initial={
                mobile ? { y: "100%", opacity: 0.6 } : { y: -8, opacity: 0 }
              }
              animate={mobile ? { y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
              exit={
                mobile ? { y: "100%", opacity: 0.4 } : { y: -8, opacity: 0 }
              }
              transition={{ duration: 0.2 }}
              className={cn(
                "border border-border bg-card z-[60] overflow-hidden",
                mobile
                  ? "fixed inset-x-0 bottom-0 rounded-t-2xl max-h-[78vh] md:hidden"
                  : "absolute right-0 top-[calc(100%+10px)] w-[360px] rounded-2xl shadow-2xl",
              )}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/70">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "You are all caught up"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-secondary/80"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                  {mobile && (
                    <button
                      type="button"
                      onClick={() => setOpenForCurrentPath(false)}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-full hover:bg-muted"
                      aria-label="Close notifications"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="px-4 py-2 border-b border-border bg-muted/30">
                <div className="inline-flex rounded-full bg-background p-1">
                  {(["all", "unread"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFilterTab(tab)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                        filterTab === tab
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {tab === "all" ? "All" : "Unread"}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  "overflow-y-auto",
                  mobile ? "max-h-[56vh]" : "max-h-[420px]",
                )}
              >
                {loading && (
                  <div className="py-10">
                    <LoadingSpinner size="sm" text="Loading notifications..." />
                  </div>
                )}

                {!loading && error && (
                  <div className="m-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive text-center">
                    {error}
                  </div>
                )}

                {!loading && !error && filteredNotifications.length === 0 && (
                  <div className="py-12 px-6 text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Inbox className="h-6 w-6 text-muted-foreground/60" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {filterTab === "unread"
                        ? "No unread notifications"
                        : "No notifications yet"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      We will notify you when something important happens.
                    </p>
                  </div>
                )}

                {!loading && !error && filteredNotifications.length > 0 && (
                  <div className="space-y-2 p-3">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={markAsRead}
                        onDelete={removeNotification}
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
