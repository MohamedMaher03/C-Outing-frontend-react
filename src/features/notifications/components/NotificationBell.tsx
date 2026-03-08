/**
 * NotificationBell — Header bell icon with unread-count badge
 *
 * Reads unreadCount from the shared NotificationsCountContext so the badge
 * updates instantly whenever the user marks items read on NotificationsPage,
 * without any extra network request.
 */

import { useNavigate, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationsCount } from "@/features/notifications/context/NotificationsCountContext";

const NotificationBell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotificationsCount();

  const isActive = location.pathname === "/notifications";

  return (
    <button
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      onClick={() => navigate("/notifications")}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Bell className="h-4 w-4" />
      <span className="hidden lg:inline">Notifications</span>

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-secondary text-primary text-[10px] font-bold flex items-center justify-center leading-none shadow-sm">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
