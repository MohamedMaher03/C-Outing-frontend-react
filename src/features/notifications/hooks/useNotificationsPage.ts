import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { groupNotificationsByDate } from "@/features/notifications/utils/notificationPresentation";
import { pickFirstSurfaceError } from "@/features/notifications/utils/notificationFeedOps";
import { useI18n } from "@/components/i18n";

export const useNotificationsPage = () => {
  const { t, formatNumber } = useI18n();
  const shouldReduceMotion = useReducedMotion();
  const feed = useNotifications();

  const surfaceError = pickFirstSurfaceError(
    feed.actionError,
    feed.error,
  );
  const groupedNotifications = useMemo(
    () => groupNotificationsByDate(feed.filteredNotifications),
    [feed.filteredNotifications],
  );

  const unreadDisplay =
    feed.unreadCount > 99
      ? "99+"
      : formatNumber(Math.max(0, feed.unreadCount));

  const liveStatusMessage = feed.markAllPending
    ? t("notifications.updating")
    : t("notifications.unreadStatus", { count: unreadDisplay });

  const errorBannerTitle = feed.actionError
    ? t("notifications.updateError")
    : t("notifications.loadError");

  const spinMarkAllIcon = feed.markAllPending && !shouldReduceMotion;

  const retryFeedLoad = () =>
    void feed.refresh({
      showLoader: false,
      showPageError: true,
      forceRefresh: true,
    });

  return {
    t,
    feed,
    surfaceError,
    groupedNotifications,
    liveStatusMessage,
    errorBannerTitle,
    spinMarkAllIcon,
    unreadDisplay,
    retryFeedLoad,
  };
};
