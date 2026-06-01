import { memo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeNotificationTime } from "@/features/notifications/utils/notificationPresentation";
import { renderNotificationTypeGlyph } from "@/features/notifications/utils/notificationTypeGlyph";
import { useNotificationItem } from "@/features/notifications/hooks/useNotificationItem";
import type { Notification } from "@/features/notifications/types";
import { useI18n } from "@/components/i18n";

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
  const { t } = useI18n();
  const { openNotificationTarget, dismissNotification, activateFromKeyboard } =
    useNotificationItem({ notification, onMarkRead, onDelete, pending });

  return (
    <div
      role="button"
      tabIndex={0}
      aria-busy={pending}
      aria-label={notification.title || t("notifications.item")}
      onClick={openNotificationTarget}
      onKeyDown={activateFromKeyboard}
      className={cn(
        "group relative flex min-h-24 cursor-pointer touch-manipulation select-none items-start gap-3 rounded-xl border p-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-4 sm:p-4",
        notification.isRead
          ? "border-border bg-card hover:bg-muted/30"
          : "border-secondary/25 bg-secondary/5 hover:bg-secondary/10",
        pending && "cursor-wait opacity-80",
      )}
    >
      {!notification.isRead && (
        <span className="absolute top-4 h-2 w-2 shrink-0 rounded-full bg-secondary [inset-inline-end:3.5rem] sm:[inset-inline-end:3rem]" />
      )}

      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10",
          notification.isRead
            ? "bg-muted text-muted-foreground"
            : "bg-secondary/15 text-secondary-foreground",
        )}
      >
        {renderNotificationTypeGlyph(
          notification.type,
          "h-4 w-4 sm:h-5 sm:w-5",
        )}
      </div>

      <div dir="auto" className="min-w-0 flex-1 space-y-0.5 pr-6">
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

      <button
        aria-label={t("notifications.delete")}
        type="button"
        disabled={pending}
        onClick={dismissNotification}
        className="absolute top-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-opacity hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed sm:top-2 md:opacity-0 md:group-hover:opacity-100 group-focus-within:opacity-100 [inset-inline-end:0.25rem] sm:[inset-inline-end:0.5rem]"
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
