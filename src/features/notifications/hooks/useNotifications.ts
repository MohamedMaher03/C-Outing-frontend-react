import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { notificationsService } from "@/features/notifications/services/notificationsService";
import { useNotificationsCount } from "@/features/notifications/hooks/useNotificationsCount";
import type { Notification } from "@/features/notifications/types";
import { getErrorMessage, isApiError } from "@/utils/apiError";

export type NotificationFilterTab = "all" | "unread";

interface RefreshNotificationsOptions {
  showLoader?: boolean;
  showPageError?: boolean;
  forceRefresh?: boolean;
}

interface UseNotificationsOptions {
  autoFetch?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  filteredNotifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  actionError: string | null;
  filterTab: NotificationFilterTab;
  markAllPending: boolean;
  itemPendingMap: Record<string, boolean>;
  setFilterTab: (tab: NotificationFilterTab) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearActionError: () => void;
  refresh: (options?: RefreshNotificationsOptions) => Promise<void>;
}

const toFriendlyErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "You are offline. Reconnect and try again.";
  }

  if (isApiError(error)) {
    if (error.statusCode === 401) {
      return "Your session expired. Sign in again to load notifications.";
    }
    if (error.statusCode === 403) {
      return "This account does not have permission to access notifications.";
    }
    if (error.statusCode === 404) {
      return "Notifications are unavailable right now. Please try again shortly.";
    }
    if (error.statusCode === 429) {
      return "Too many requests. Please wait a few seconds and retry.";
    }
    if (typeof error.statusCode === "number" && error.statusCode >= 500) {
      return "We are having trouble loading notifications. Please try again shortly.";
    }
  }

  return getErrorMessage(error, fallback);
};

const normalizeNotificationId = (rawId: string): string => rawId.trim();

const countUnreadFromFeed = (items: Notification[]): number =>
  items.reduce(
    (total, notification) => total + (notification.isRead ? 0 : 1),
    0,
  );

export const useNotifications = (
  options: UseNotificationsOptions = {},
): UseNotificationsReturn => {
  const { autoFetch = true } = options;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<NotificationFilterTab>("all");
  const [markAllPending, setMarkAllPending] = useState(false);
  const [itemPendingMap, setItemPendingMap] = useState<Record<string, boolean>>(
    {},
  );
  const mountedRef = useRef(true);
  const fetchRequestIdRef = useRef(0);
  const hasFetchedOnceRef = useRef(false);
  const itemActionsInFlightRef = useRef(new Set<string>());
  const markAllInFlightRef = useRef(false);
  const { unreadCount, setUnreadCount: setGlobalUnreadCount } =
    useNotificationsCount();

  const syncCount = useCallback(
    (count: number) => {
      if (!mountedRef.current) return;
      setGlobalUnreadCount(Math.max(0, count));
    },
    [setGlobalUnreadCount],
  );

  const decrementUnreadCount = useCallback(
    (delta = 1) => {
      if (!mountedRef.current) return;

      setGlobalUnreadCount((prev) => Math.max(0, prev - delta));
    },
    [setGlobalUnreadCount],
  );

  const fetchNotifications = useCallback(
    async ({
      showLoader = true,
      showPageError = true,
      forceRefresh = false,
    }: RefreshNotificationsOptions = {}): Promise<void> => {
      const requestId = ++fetchRequestIdRef.current;

      try {
        if (showLoader && mountedRef.current) {
          setLoading(true);
        }
        if (showPageError && mountedRef.current) {
          setError(null);
        }

        const data = await notificationsService.getNotifications(undefined, {
          forceRefresh,
        });

        const unread = data.hasNextPage
          ? await notificationsService.getUnreadCount({ forceRefresh })
          : countUnreadFromFeed(data.items ?? []);

        if (!mountedRef.current || requestId !== fetchRequestIdRef.current) {
          return;
        }

        hasFetchedOnceRef.current = true;
        setNotifications(data.items ?? []);
        syncCount(unread ?? 0);
      } catch (err) {
        if (!mountedRef.current || requestId !== fetchRequestIdRef.current) {
          return;
        }

        if (showPageError) {
          setError(
            toFriendlyErrorMessage(
              err,
              "We could not load your notifications.",
            ),
          );

          if (!hasFetchedOnceRef.current) {
            setNotifications([]);
            syncCount(0);
          }
        }
      } finally {
        if (
          mountedRef.current &&
          requestId === fetchRequestIdRef.current &&
          showLoader
        ) {
          setLoading(false);
        }
      }
    },
    [syncCount],
  );

  useEffect(() => {
    mountedRef.current = true;
    const itemActionsInFlight = itemActionsInFlightRef.current;

    try {
      if (autoFetch && !hasFetchedOnceRef.current) {
        void fetchNotifications();
      } else if (!autoFetch) {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }

    return () => {
      mountedRef.current = false;
      fetchRequestIdRef.current += 1;
      itemActionsInFlight.clear();
      markAllInFlightRef.current = false;
    };
  }, [autoFetch, fetchNotifications]);

  const markAsRead = useCallback(
    async (rawId: string) => {
      const id = normalizeNotificationId(rawId);
      if (!id || itemActionsInFlightRef.current.has(id)) return;

      const target = notifications.find(
        (notification) => notification.id === id,
      );
      if (!target || target.isRead) return;

      try {
        setActionError(null);
        setError(null);
        itemActionsInFlightRef.current.add(id);
        setItemPendingMap((prev) => ({ ...prev, [id]: true }));

        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification,
          ),
        );
        decrementUnreadCount(1);

        await notificationsService.markAsRead(id);
      } catch (err) {
        setActionError(
          toFriendlyErrorMessage(
            err,
            "We could not mark this notification as read.",
          ),
        );
        await fetchNotifications({ showLoader: false, showPageError: false });
      } finally {
        itemActionsInFlightRef.current.delete(id);
        if (mountedRef.current) {
          setItemPendingMap((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      }
    },
    [decrementUnreadCount, fetchNotifications, notifications],
  );

  const markAllRead = useCallback(async () => {
    if (markAllInFlightRef.current || unreadCount <= 0) return;

    try {
      setActionError(null);
      setError(null);
      markAllInFlightRef.current = true;
      setMarkAllPending(true);

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
      syncCount(0);

      await notificationsService.markAllAsRead();
    } catch (err) {
      setActionError(
        toFriendlyErrorMessage(
          err,
          "We could not mark all notifications as read.",
        ),
      );
      await fetchNotifications({ showLoader: false, showPageError: false });
    } finally {
      markAllInFlightRef.current = false;
      if (mountedRef.current) {
        setMarkAllPending(false);
      }
    }
  }, [fetchNotifications, syncCount, unreadCount]);

  const removeNotification = useCallback(
    async (rawId: string) => {
      const id = normalizeNotificationId(rawId);
      if (!id || itemActionsInFlightRef.current.has(id)) return;

      const target = notifications.find(
        (notification) => notification.id === id,
      );
      if (!target) return;

      try {
        setActionError(null);
        setError(null);
        itemActionsInFlightRef.current.add(id);
        setItemPendingMap((prev) => ({ ...prev, [id]: true }));

        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== id),
        );

        if (!target.isRead) {
          decrementUnreadCount(1);
        }

        await notificationsService.deleteNotification(id);
      } catch (err) {
        setActionError(
          toFriendlyErrorMessage(err, "We could not delete this notification."),
        );
        await fetchNotifications({ showLoader: false, showPageError: false });
      } finally {
        itemActionsInFlightRef.current.delete(id);
        if (mountedRef.current) {
          setItemPendingMap((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      }
    },
    [decrementUnreadCount, fetchNotifications, notifications],
  );

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const filteredNotifications = useMemo(
    () =>
      filterTab === "unread"
        ? notifications.filter((n) => !n.isRead)
        : notifications,
    [filterTab, notifications],
  );

  return {
    notifications,
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
    clearActionError,
    refresh: fetchNotifications,
  };
};
