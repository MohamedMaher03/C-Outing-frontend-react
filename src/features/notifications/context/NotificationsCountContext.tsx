import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { notificationsService } from "@/features/notifications/services/notificationsService";
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
      .catch(() => {});

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
