import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  isInternalAppPath,
  resolveInAppNotificationDestination,
} from "@/features/notifications/utils/notificationNavigation";
import type { Notification } from "@/features/notifications/types";

interface UseNotificationItemParams {
  notification: Notification;
  onMarkRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  pending: boolean;
}

export const useNotificationItem = ({
  notification,
  onMarkRead,
  onDelete,
  pending,
}: UseNotificationItemParams) => {
  const navigate = useNavigate();
  const destinationPath = resolveInAppNotificationDestination(
    notification.actionUrl,
  );

  const openNotificationTarget = useCallback(() => {
    if (pending) return;

    if (!notification.isRead) {
      void onMarkRead(notification.id);
    }

    if (isInternalAppPath(destinationPath)) {
      navigate(destinationPath);
    }
  }, [
    destinationPath,
    navigate,
    notification.id,
    notification.isRead,
    onMarkRead,
    pending,
  ]);

  const dismissNotification = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (pending) return;
      void onDelete(notification.id);
    },
    [notification.id, onDelete, pending],
  );

  const activateFromKeyboard = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openNotificationTarget();
      }
    },
    [openNotificationTarget],
  );

  return {
    openNotificationTarget,
    dismissNotification,
    activateFromKeyboard,
  };
};
