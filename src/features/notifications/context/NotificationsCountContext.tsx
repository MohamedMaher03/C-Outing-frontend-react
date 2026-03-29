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

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { notificationsService } from "@/features/notifications/services/notificationsService";
import { NotificationsCountContext } from "./notificationsCount.context";

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
    let active = true;

    notificationsService
      .getUnreadCount()
      .then((count) => {
        if (!active) return;
        setUnreadCount(Math.max(0, count));
      })
      .catch(() => {
        // Silently ignore — the badge will just stay at 0
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <NotificationsCountContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </NotificationsCountContext.Provider>
  );
}
