/**
 * NotificationsCountContext
 *
 * Shares the live unread notification count across the component tree
 * without prop-drilling.  The context is provided by AppLayout so it is
 * available to both:
 *   • NotificationBell  (reads unreadCount to render the badge)
 *   • useNotifications  (writes unreadCount after every optimistic action)
 *
 * ┌────────────────────────────────────────────────────────────┐
 * │  AppLayout (NotificationsCountProvider)                    │
 * │    ├── NotificationBell   → reads  unreadCount             │
 * │    └── NotificationsPage → useNotifications               │
 * │              └── writes setGlobalUnreadCount               │
 * └────────────────────────────────────────────────────────────┘
 */

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getNotifications } from "@/features/notifications/services/notificationsService";

// ── Context type ─────────────────────────────────────────────

interface NotificationsCountContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

// ── Context ──────────────────────────────────────────────────

const NotificationsCountContext = createContext<
  NotificationsCountContextType | undefined
>(undefined);

// ── Provider ─────────────────────────────────────────────────

export function NotificationsCountProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch the initial unread count on mount so the bell badge is correct
  // on every page, not just after visiting NotificationsPage.
  useEffect(() => {
    getNotifications()
      .then((data) => setUnreadCount(data.unreadCount))
      .catch(() => {
        // Silently ignore — the badge will just stay at 0
      });
  }, []);

  return (
    <NotificationsCountContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </NotificationsCountContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────

/**
 * useNotificationsCount — read or update the global unread badge count.
 * Must be used inside NotificationsCountProvider.
 */
export function useNotificationsCount(): NotificationsCountContextType {
  const ctx = useContext(NotificationsCountContext);
  if (ctx === undefined) {
    throw new Error(
      "useNotificationsCount must be used within NotificationsCountProvider",
    );
  }
  return ctx;
}
