import { Bell, CheckCheck, Inbox, RefreshCw, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import NotificationItem from "@/features/notifications/components/NotificationItem";
import { useNotificationBell } from "@/features/notifications/hooks/useNotificationBell";
import {
  NOTIFICATION_FILTER_TAB_LABEL_KEY,
  NOTIFICATION_FILTER_TABS,
} from "@/features/notifications/utils/notificationFilterTabs";

interface NotificationBellProps {
  mobile?: boolean;
}

const NotificationBell = ({ mobile = false }: NotificationBellProps) => {
  const {
    t,
    rootRef,
    panelRef,
    dialogId,
    panelOpen,
    togglePanel,
    closePanel,
    feed,
    panelError,
    retryPanelLoad,
    unreadDisplay,
    unreadLabel,
    liveUnreadMessage,
    panelTransition,
    spinMarkAllIcon,
  } = useNotificationBell({ mobile });

  return (
    <div ref={rootRef} className="relative h-full">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveUnreadMessage}
      </p>
      <button
        type="button"
        aria-expanded={panelOpen}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        aria-label={`${t("nav.notifications")}${feed.unreadCount > 0 ? `, ${unreadLabel}` : ""}`}
        onClick={togglePanel}
        className={cn(
          "relative touch-manipulation transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          mobile
            ? "flex h-full w-full min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 py-1.5 text-muted-foreground hover:text-foreground"
            : "flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Bell
          className={cn(
            mobile ? "h-5 w-5" : "h-4 w-4",
            panelOpen && "text-secondary",
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

        {feed.unreadCount > 0 && (
          <span
            className={cn(
              "absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[11px] font-bold leading-none text-primary shadow-sm",
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
        {panelOpen && (
          <>
            {mobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/72 md:hidden"
                onClick={closePanel}
              />
            )}

            <motion.div
              ref={panelRef}
              id={dialogId}
              role="dialog"
              aria-modal={mobile || undefined}
              aria-busy={feed.loading}
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
                "z-[60] overflow-hidden border border-border bg-card",
                mobile
                  ? "fixed inset-x-0 bottom-0 max-h-[min(84svh,36rem)] rounded-t-2xl pb-[max(env(safe-area-inset-bottom),0.75rem)] md:hidden"
                  : "absolute top-[calc(100%+10px)] w-[min(92vw,22.5rem)] rounded-2xl shadow-2xl lg:w-[24rem] [inset-inline-end:0]",
              )}
            >
              <div className="border-b border-border bg-background px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-role-secondary font-semibold text-foreground">
                    {t("nav.notifications")}
                  </p>
                  {feed.unreadCount > 0 && (
                    <p className="text-role-caption text-muted-foreground text-numeric-tabular">
                      {unreadLabel}
                    </p>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-end gap-2">
                  {feed.unreadCount > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={feed.markAllRead}
                      disabled={feed.markAllPending || feed.loading}
                      className="min-h-11 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-secondary hover:bg-secondary/10 hover:text-secondary/80 dark:text-accent dark:hover:bg-accent/10 dark:hover:text-accent/80"
                    >
                      {feed.markAllPending ? (
                        <RefreshCw
                          className={cn(
                            "h-3.5 w-3.5",
                            spinMarkAllIcon && "animate-spin",
                          )}
                        />
                      ) : (
                        <CheckCheck className="h-3.5 w-3.5" />
                      )}
                      {feed.markAllPending
                        ? t("notifications.updating")
                        : t("notifications.markAllRead")}
                    </Button>
                  )}
                  {mobile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={closePanel}
                      className="h-11 w-11 rounded-full"
                      aria-label={t("notifications.close")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="border-b border-border bg-muted/30 px-4 py-2">
                <div className="grid grid-cols-2 rounded-full bg-background p-1">
                  {NOTIFICATION_FILTER_TABS.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      aria-pressed={feed.filterTab === tab}
                      onClick={() => feed.setFilterTab(tab)}
                      className={cn(
                        "min-h-11 rounded-full px-3 py-1 text-xs font-medium transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        feed.filterTab === tab
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t(NOTIFICATION_FILTER_TAB_LABEL_KEY[tab])}
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
                {feed.loading && (
                  <div className="py-10">
                    <LoadingSpinner
                      size="sm"
                      text={t("notifications.loading")}
                    />
                  </div>
                )}

                {!feed.loading && panelError && (
                  <Alert
                    variant="destructive"
                    className="m-4 border-destructive/30"
                  >
                    <AlertTitle className="text-role-secondary">
                      {feed.actionError
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
                          onClick={retryPanelLoad}
                        >
                          {t("common.retry")}
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {!feed.loading &&
                  !panelError &&
                  feed.filteredNotifications.length === 0 && (
                    <div className="space-y-2 px-6 py-12 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Inbox className="h-6 w-6 text-muted-foreground/60" />
                      </div>
                      <p className="text-role-secondary font-semibold text-foreground">
                        {feed.filterTab === "unread"
                          ? t("notifications.empty.unread")
                          : t("notifications.empty.all")}
                      </p>
                      <p className="text-role-secondary text-muted-foreground">
                        {t("notifications.empty.hint")}
                      </p>
                    </div>
                  )}

                {!feed.loading &&
                  !panelError &&
                  feed.filteredNotifications.length > 0 && (
                    <div className="space-y-2 p-3 [content-visibility:auto] [contain-intrinsic-size:420px]">
                      {feed.filteredNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkRead={feed.markAsRead}
                          onDelete={feed.removeNotification}
                          pending={Boolean(
                            feed.itemPendingMap[notification.id],
                          )}
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
