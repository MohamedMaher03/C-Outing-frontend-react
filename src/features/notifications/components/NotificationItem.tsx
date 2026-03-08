/**
 * NotificationItem — Single notification row
 *
 * Presentational component. Parent provides callbacks for actions.
 * Unread items have a highlighted border and background.
 * Clicking an unread item marks it as read and navigates to actionUrl.
 */

import { useNavigate } from "react-router-dom";
import {
  Star,
  Heart,
  MessageSquare,
  ThumbsUp,
  MapPin,
  Bell,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "../types";

// ── Type → visual config ─────────────────────────────────────

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; iconClass: string; bgClass: string }
> = {
  recommendation: {
    icon: Star,
    iconClass: "text-secondary",
    bgClass: "bg-secondary/10",
  },
  favorite_update: {
    icon: Heart,
    iconClass: "text-rose-500",
    bgClass: "bg-rose-100 dark:bg-rose-500/10",
  },
  review_response: {
    icon: MessageSquare,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-100 dark:bg-blue-500/10",
  },
  like: {
    icon: ThumbsUp,
    iconClass: "text-violet-500",
    bgClass: "bg-violet-100 dark:bg-violet-500/10",
  },
  new_place: {
    icon: MapPin,
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-100 dark:bg-emerald-500/10",
  },
  system: {
    icon: Bell,
    iconClass: "text-muted-foreground",
    bgClass: "bg-muted",
  },
};

// ── Relative time helper ─────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return `${diffD}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Component ────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem = ({
  notification,
  onMarkRead,
  onDelete,
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const { icon: Icon, iconClass, bgClass } = TYPE_CONFIG[notification.type];

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className={cn(
        "group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none",
        notification.isRead
          ? "bg-card border-border hover:bg-muted/30"
          : "bg-secondary/5 border-secondary/25 hover:bg-secondary/10",
      )}
    >
      {/* Unread indicator dot */}
      {!notification.isRead && (
        <span className="absolute top-4 right-12 h-2 w-2 rounded-full bg-secondary shrink-0" />
      )}

      {/* Type icon */}
      <div
        className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
          bgClass,
        )}
      >
        <Icon className={cn("h-5 w-5", iconClass)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5 pr-6">
        <p
          className={cn(
            "text-sm leading-snug",
            notification.isRead
              ? "font-medium text-foreground"
              : "font-semibold text-foreground",
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {notification.body}
        </p>
        <p className="text-[11px] text-muted-foreground/70 pt-1">
          {formatRelativeTime(new Date(notification.createdAt))}
        </p>
      </div>

      {/* Delete button */}
      <button
        aria-label="Delete notification"
        onClick={handleDelete}
        className="absolute top-3 right-3 h-6 w-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-muted hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default NotificationItem;
