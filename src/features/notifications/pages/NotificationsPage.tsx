import { CheckCheck, Inbox, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import NotificationItem from "@/features/notifications/components/NotificationItem";
import { useNotificationsPage } from "@/features/notifications/hooks/useNotificationsPage";
import {
  NOTIFICATION_EMPTY_STATE_KEY,
  NOTIFICATION_FILTER_TAB_LABEL_KEY,
  NOTIFICATION_FILTER_TABS,
} from "@/features/notifications/utils/notificationFilterTabs";

const NotificationsPage = () => {
  const {
    t,
    feed,
    surfaceError,
    groupedNotifications,
    liveStatusMessage,
    errorBannerTitle,
    spinMarkAllIcon,
    unreadDisplay,
    retryFeedLoad,
  } = useNotificationsPage();

  if (feed.loading) {
    return (
      <PageLoading
        text={t("notifications.loading")}
        subText={t("notifications.empty.hint")}
      />
    );
  }

  const emptyCopy = NOTIFICATION_EMPTY_STATE_KEY[feed.filterTab];

  return (
    <div className="min-h-screen bg-background">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveStatusMessage}
      </p>

      <div className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-role-heading text-foreground leading-tight">
                {t("nav.notifications")}
              </h1>
              {feed.unreadCount > 0 && (
                <p className="text-role-secondary text-muted-foreground text-numeric-tabular">
                  {t("notifications.unread", { count: unreadDisplay })}
                </p>
              )}
            </div>

            {feed.unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={feed.markAllRead}
                disabled={feed.markAllPending}
                className="min-h-11 w-full justify-center gap-1.5 text-xs font-semibold text-secondary hover:bg-secondary/10 hover:text-secondary/80 sm:w-auto"
              >
                {feed.markAllPending ? (
                  <RefreshCw
                    className={cn("h-3.5 w-3.5", spinMarkAllIcon && "animate-spin")}
                  />
                ) : (
                  <CheckCheck className="h-3.5 w-3.5" />
                )}
                {feed.markAllPending
                  ? t("notifications.updating")
                  : t("notifications.markAllRead")}
              </Button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-muted/60 p-1 sm:inline-grid sm:min-w-[240px]">
            {NOTIFICATION_FILTER_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                aria-pressed={feed.filterTab === tab}
                onClick={() => feed.setFilterTab(tab)}
                className={cn(
                  "relative min-h-11 rounded-full px-4 py-1.5 text-sm font-medium transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  feed.filterTab === tab
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {t(NOTIFICATION_FILTER_TAB_LABEL_KEY[tab])}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-6">
        {surfaceError && (
          <Alert variant="destructive" className="border-destructive/30">
            <AlertTitle>{errorBannerTitle}</AlertTitle>
            <AlertDescription className="mt-2 space-y-2 text-role-secondary">
              <p className="break-words">{surfaceError}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-10"
                  onClick={retryFeedLoad}
                >
                  {t("common.retry")}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {feed.filteredNotifications.length === 0 && !surfaceError && (
          <div className="flex flex-col items-center justify-center space-y-3 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-role-subheading text-foreground">
              {t(emptyCopy.title)}
            </p>
            <p className="max-w-xs text-role-secondary text-muted-foreground">
              {t(emptyCopy.hint)}
            </p>
          </div>
        )}

        {groupedNotifications.map(([group, items]) => (
          <section
            key={group}
            className="space-y-3 [content-visibility:auto] [contain-intrinsic-size:560px]"
          >
            <div className="flex items-center gap-3">
              <span className="text-role-caption text-muted-foreground uppercase">
                {group}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-2">
              {items.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={feed.markAsRead}
                  onDelete={feed.removeNotification}
                  pending={Boolean(feed.itemPendingMap[notification.id])}
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
