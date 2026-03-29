import { CheckCheck, Inbox, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import NotificationItem from "../components/NotificationItem";
import { useNotifications } from "../hooks/useNotifications";
import { groupNotificationsByDate } from "../utils/notificationPresentation";

// ── Page ─────────────────────────────────────────────────────

const NotificationsPage = () => {
  const shouldReduceMotion = useReducedMotion();
  const {
    filteredNotifications,
    unreadCount,
    loading,
    error,
    actionError,
    filterTab,
    markAllPending,
    itemPendingMap,
    setFilterTab,
    markAsRead,
    markAllRead,
    removeNotification,
    refresh,
  } = useNotifications();

  if (loading) {
    return (
      <PageLoading
        text="Loading notifications"
        subText="Getting your latest updates..."
      />
    );
  }

  const displayError = actionError ?? error;
  const groupedNotifications = useMemo(
    () => groupNotificationsByDate(filteredNotifications),
    [filteredNotifications],
  );

  return (
    <div className="min-h-screen bg-background">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {markAllPending
          ? "Marking notifications as read"
          : `${unreadCount} unread notifications`}
      </p>

      {/* ── Sticky Header ─────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-role-heading text-foreground leading-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-role-secondary text-muted-foreground text-numeric-tabular">
                  {unreadCount} unread
                </p>
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllRead}
                disabled={markAllPending}
                className="min-h-11 w-full justify-center gap-1.5 text-xs font-semibold text-secondary hover:bg-secondary/10 hover:text-secondary/80 sm:w-auto"
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
                {markAllPending ? "Updating..." : "Mark all read"}
              </Button>
            )}
          </div>

          {/* ── Filter Tabs ─────────────────────────────────── */}
          <div className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-muted/60 p-1 sm:inline-grid sm:min-w-[240px]">
            {(["all", "unread"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                aria-pressed={filterTab === tab}
                onClick={() => setFilterTab(tab)}
                className={`relative min-h-11 rounded-full px-4 py-1.5 text-sm font-medium transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  filterTab === tab
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab === "all" ? "All" : "Unread"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-6">
        {/* Error banner */}
        {displayError && (
          <Alert variant="destructive" className="border-destructive/30">
            <AlertTitle>
              {actionError
                ? "Could not update notifications"
                : "Could not load notifications"}
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-2 text-role-secondary">
              <p className="break-words">{displayError}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-10"
                  onClick={() =>
                    void refresh({
                      showLoader: false,
                      showPageError: true,
                      forceRefresh: true,
                    })
                  }
                >
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty state */}
        {filteredNotifications.length === 0 && !displayError && (
          <div className="flex flex-col items-center justify-center space-y-3 py-24 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Inbox className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-role-subheading text-foreground">
              {filterTab === "unread"
                ? "You're all caught up!"
                : "No notifications yet"}
            </p>
            <p className="max-w-xs text-role-secondary text-muted-foreground">
              {filterTab === "unread"
                ? "All notifications have been read."
                : "New activity will appear here."}
            </p>
          </div>
        )}

        {/* Grouped notification list */}
        {groupedNotifications.map(([group, items]) => (
          <section
            key={group}
            className="space-y-3 [content-visibility:auto] [contain-intrinsic-size:560px]"
          >
            {/* Date group header */}
            <div className="flex items-center gap-3">
              <span className="text-role-caption text-muted-foreground uppercase">
                {group}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Notification items */}
            <div className="space-y-2">
              {items.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markAsRead}
                  onDelete={removeNotification}
                  pending={Boolean(itemPendingMap[notification.id])}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
