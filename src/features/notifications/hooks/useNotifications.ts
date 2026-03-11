/**
 * useNotifications Hook
 *
 * Manages the notification feed, filter state, and async actions.
 * All data flows through notificationsService → (mock | API).
 */

import { useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/features/notifications/services/notificationsService";
import { useNotificationsCount } from "@/features/notifications/context/NotificationsCountContext";
import type { Notification } from "@/features/notifications/types";
import { getErrorMessage } from "@/utils/apiError";

export type NotificationFilterTab = "all" | "unread";

interface UseNotificationsReturn {
  /** Full notification list (un-filtered) */
  notifications: Notification[];
  /** Notification list after applying the active filter tab */
  filteredNotifications: Notification[];
  /** Total number of unread notifications */
  unreadCount: number;
  /** True while the initial data is being fetched */
  loading: boolean;
  /** Error message, if any */
  error: string | null;
  /** Active filter tab */
  filterTab: NotificationFilterTab;
  /** Switch between "all" and "unread" */
  setFilterTab: (tab: NotificationFilterTab) => void;
  /** Mark a single notification as read (optimistic) */
  markAsRead: (id: string) => Promise<void>;
  /** Mark all notifications as read (optimistic) */
  markAllRead: () => Promise<void>;
  /** Delete a notification (optimistic) */
  removeNotification: (id: string) => Promise<void>;
  /** Re-fetch the notification feed */
  refresh: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<NotificationFilterTab>("all");

  // Sync local unread count into the shared global context so NotificationBell
  // updates its badge immediately without an extra network call.
  const { setUnreadCount: setGlobalUnreadCount } = useNotificationsCount();

  const syncCount = useCallback(
    (count: number) => {
      setUnreadCount(count);
      setGlobalUnreadCount(count);
    },
    [setGlobalUnreadCount],
  );

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications();
      setNotifications(data.notifications);
      syncCount(data.unreadCount);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load notifications"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.isRead) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    const newCount = Math.max(0, unreadCount - 1);
    syncCount(newCount);

    try {
      await markNotificationAsRead(id);
    } catch {
      // Revert on failure
      await fetchNotifications();
    }
  };

  const markAllRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    syncCount(0);

    try {
      await markAllNotificationsAsRead();
    } catch {
      await fetchNotifications();
    }
  };

  const removeNotification = async (id: string) => {
    const removed = notifications.find((n) => n.id === id);

    // Optimistic update
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (removed && !removed.isRead) {
      syncCount(Math.max(0, unreadCount - 1));
    }

    try {
      await deleteNotification(id);
    } catch {
      await fetchNotifications();
    }
  };

  const filteredNotifications =
    filterTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return {
    notifications,
    filteredNotifications,
    unreadCount,
    loading,
    error,
    filterTab,
    setFilterTab,
    markAsRead,
    markAllRead,
    removeNotification,
    refresh: fetchNotifications,
  };
};
