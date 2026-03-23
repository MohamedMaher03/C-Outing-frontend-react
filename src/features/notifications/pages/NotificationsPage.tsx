import { Bell, CheckCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import NotificationItem from "../components/NotificationItem";
import { useNotifications } from "../hooks/useNotifications";
import { groupNotificationsByDate } from "../utils/notificationPresentation";

// ── Page ─────────────────────────────────────────────────────

const NotificationsPage = () => {
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

  if (loading) {
    return (
      <LoadingSpinner size="md" text="Loading notifications..." fullScreen />
    );
  }

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Header ─────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground leading-tight">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllRead}
                className="text-secondary hover:text-secondary/80 hover:bg-secondary/10 text-xs font-semibold gap-1.5"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
          </div>

          {/* ── Filter Tabs ─────────────────────────────────── */}
          <div className="flex gap-1 mt-4">
            {(["all", "unread"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filterTab === tab
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab === "all" ? "All" : "Unread"}
                {tab === "unread" && unreadCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-secondary text-primary text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Error banner */}
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {filteredNotifications.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Inbox className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-base font-semibold text-foreground">
              {filterTab === "unread"
                ? "You're all caught up!"
                : "No notifications yet"}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {filterTab === "unread"
                ? "All notifications have been read."
                : "We'll let you know when something interesting happens."}
            </p>
          </div>
        )}

        {/* Grouped notification list */}
        {groupedNotifications.map(([group, items]) => (
          <section key={group} className="space-y-3">
            {/* Date group header */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                />
              ))}
            </div>
          </section>
        ))}

        {/* Footer tip */}
        {filteredNotifications.length > 0 && (
          <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
            <p className="text-sm text-foreground">
              <span className="font-medium">💡 Tip:</span> Tap any notification
              to jump straight to the related content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
