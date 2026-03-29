/**
 * NotificationItem — Single notification row
 *
 * Presentational component. Parent provides callbacks for actions.
 * Unread items have a highlighted border and background.
 * Clicking an unread item marks it as read and navigates to actionUrl.
 */

import { useNavigate } from "react-router-dom";
import { memo, useCallback } from "react";
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
import { formatRelativeNotificationTime } from "../utils/notificationPresentation";
import type { Notification, NotificationType } from "../types";

// ── Type → visual config ─────────────────────────────────────

const TYPE_ICON: Record<NotificationType, React.ElementType> = {
  recommendation: Star,
  favorite_update: Heart,
  review_response: MessageSquare,
  like: ThumbsUp,
  new_place: MapPin,
  system: Bell,
};

function getTypeIcon(type: string) {
  return TYPE_ICON[type as NotificationType] ?? TYPE_ICON.system;
}

// ── Component ────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  pending?: boolean;
}

const NotificationItem = ({
  notification,
  onMarkRead,
  onDelete,
  pending = false,
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const Icon = getTypeIcon(notification.type);

  const handleClick = useCallback(() => {
    if (pending) return;

    if (!notification.isRead) {
      void onMarkRead(notification.id);
    }

    if (notification.actionUrl?.startsWith("/")) {
      navigate(notification.actionUrl);
    }
  }, [
    navigate,
    notification.actionUrl,
    notification.id,
    notification.isRead,
    onMarkRead,
    pending,
  ]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (pending) return;
      void onDelete(notification.id);
    },
    [notification.id, onDelete, pending],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-busy={pending}
      aria-label={notification.title || "Notification"}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex min-h-24 touch-manipulation items-start gap-3 rounded-xl border p-3 transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-4 sm:p-4",
        notification.isRead
          ? "bg-card border-border hover:bg-muted/30"
          : "bg-secondary/5 border-secondary/25 hover:bg-secondary/10",
        pending && "opacity-80 cursor-wait",
      )}
    >
      {/* Unread indicator dot */}
      {!notification.isRead && (
        <span className="absolute right-14 top-4 h-2 w-2 shrink-0 rounded-full bg-secondary sm:right-12" />
      )}

      {/* Type icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10",
          notification.isRead
            ? "bg-muted text-muted-foreground"
            : "bg-secondary/15 text-secondary-foreground",
        )}
      >
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>

      {/* Content */}
      <div dir="auto" className="flex-1 min-w-0 space-y-0.5 pr-6">
        <p
          className={cn(
            "line-clamp-2 break-words text-role-secondary leading-snug",
            notification.isRead
              ? "font-medium text-foreground"
              : "font-semibold text-foreground",
          )}
        >
          {notification.title}
        </p>
        <p className="line-clamp-2 break-words text-role-secondary text-muted-foreground">
          {notification.message}
        </p>
        <p className="pt-1 text-role-caption text-muted-foreground/80">
          {formatRelativeNotificationTime(notification.createdAt)}
        </p>
      </div>

      {/* Delete button */}
      <button
        aria-label="Delete notification"
        type="button"
        disabled={pending}
        onClick={handleDelete}
        className="absolute right-1 top-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-opacity hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed sm:top-2 sm:right-2 md:opacity-0 md:group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const areEqual = (
  prev: Readonly<NotificationItemProps>,
  next: Readonly<NotificationItemProps>,
): boolean =>
  prev.pending === next.pending && prev.notification === next.notification;

export default memo(NotificationItem, areEqual);
