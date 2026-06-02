import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { notificationsService } from "@/features/notifications/services/notificationsService";
import { getErrorMessage } from "@/utils/apiError";
import { NotificationsCountContext } from "./notificationsCount.context";

export function NotificationsCountProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;

    notificationsService
      .getUnreadCount()
      .then((count) => {
        if (!active) return;
        setUnreadCount(Math.max(0, count));
      })
      .catch((error: unknown) => {
        const message = getErrorMessage(
          error,
          "Unable to load unread notifications count.",
        );
        console.error(
          "[NotificationsCountProvider] Failed to fetch unread count.",
          {
            error: error instanceof Error ? error : new Error(message),
            message,
          },
        );
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
