import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { notificationsService } from "@/features/notifications/services/notificationsService";
import { useNotificationsCount } from "@/features/notifications/hooks/useNotificationsCount";
import type {
  Notification,
  NotificationFilterTab,
} from "@/features/notifications/types";
import { resolveNotificationFailureMessage } from "@/features/notifications/utils/notificationErrorMessages";
import {
  filterNotificationsByTab,
  normalizeNotificationId,
  tallyUnreadNotifications,
} from "@/features/notifications/utils/notificationFeedOps";
import { omitRecordKey } from "@/utils/record";

export type { NotificationFilterTab };

export interface RefreshNotificationsOptions {
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

  const syncUnreadBadge = useCallback(
    (count: number) => {
      if (!mountedRef.current) return;
      setGlobalUnreadCount(Math.max(0, count));
    },
    [setGlobalUnreadCount],
  );

  const decrementUnreadBadge = useCallback(
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
        if (showLoader && mountedRef.current) setLoading(true);
        if (showPageError && mountedRef.current) setError(null);

        const data = await notificationsService.getNotifications(undefined, {
          forceRefresh,
        });

        const unreadTotal = data.hasNextPage
          ? await notificationsService.getUnreadCount({ forceRefresh })
          : tallyUnreadNotifications(data.items ?? []);

        if (!mountedRef.current || requestId !== fetchRequestIdRef.current) {
          return;
        }

        hasFetchedOnceRef.current = true;
        setNotifications(data.items ?? []);
        syncUnreadBadge(unreadTotal ?? 0);
      } catch (err) {
        if (!mountedRef.current || requestId !== fetchRequestIdRef.current) {
          return;
        }

        if (showPageError) {
          setError(resolveNotificationFailureMessage(err, "load"));

          if (!hasFetchedOnceRef.current) {
            setNotifications([]);
            syncUnreadBadge(0);
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
    [syncUnreadBadge],
  );

  useEffect(() => {
    mountedRef.current = true;
    const itemActionsInFlight = itemActionsInFlightRef.current;

    if (autoFetch && !hasFetchedOnceRef.current) {
      void fetchNotifications();
    } else if (!autoFetch) {
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

      const target = notifications.find((entry) => entry.id === id);
      if (!target || target.isRead) return;

      try {
        setActionError(null);
        setError(null);
        itemActionsInFlightRef.current.add(id);
        setItemPendingMap((prev) => ({ ...prev, [id]: true }));

        setNotifications((prev) =>
          prev.map((entry) =>
            entry.id === id ? { ...entry, isRead: true } : entry,
          ),
        );
        decrementUnreadBadge(1);

        await notificationsService.markAsRead(id);
      } catch (err) {
        setActionError(resolveNotificationFailureMessage(err, "read"));
        await fetchNotifications({ showLoader: false, showPageError: false });
      } finally {
        itemActionsInFlightRef.current.delete(id);
        if (mountedRef.current) {
          setItemPendingMap((prev) => omitRecordKey(prev, id));
        }
      }
    },
    [decrementUnreadBadge, fetchNotifications, notifications],
  );

  const markAllRead = useCallback(async () => {
    if (markAllInFlightRef.current || unreadCount <= 0) return;

    try {
      setActionError(null);
      setError(null);
      markAllInFlightRef.current = true;
      setMarkAllPending(true);

      setNotifications((prev) =>
        prev.map((entry) => ({ ...entry, isRead: true })),
      );
      syncUnreadBadge(0);

      await notificationsService.markAllAsRead();
    } catch (err) {
      setActionError(resolveNotificationFailureMessage(err, "read-all"));
      await fetchNotifications({ showLoader: false, showPageError: false });
    } finally {
      markAllInFlightRef.current = false;
      if (mountedRef.current) setMarkAllPending(false);
    }
  }, [fetchNotifications, syncUnreadBadge, unreadCount]);

  const removeNotification = useCallback(
    async (rawId: string) => {
      const id = normalizeNotificationId(rawId);
      if (!id || itemActionsInFlightRef.current.has(id)) return;

      const target = notifications.find((entry) => entry.id === id);
      if (!target) return;

      try {
        setActionError(null);
        setError(null);
        itemActionsInFlightRef.current.add(id);
        setItemPendingMap((prev) => ({ ...prev, [id]: true }));

        setNotifications((prev) => prev.filter((entry) => entry.id !== id));

        if (!target.isRead) decrementUnreadBadge(1);

        await notificationsService.deleteNotification(id);
      } catch (err) {
        setActionError(resolveNotificationFailureMessage(err, "delete"));
        await fetchNotifications({ showLoader: false, showPageError: false });
      } finally {
        itemActionsInFlightRef.current.delete(id);
        if (mountedRef.current) {
          setItemPendingMap((prev) => omitRecordKey(prev, id));
        }
      }
    },
    [decrementUnreadBadge, fetchNotifications, notifications],
  );

  const clearActionError = useCallback(() => setActionError(null), []);

  const filteredNotifications = useMemo(
    () => filterNotificationsByTab(notifications, filterTab),
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
