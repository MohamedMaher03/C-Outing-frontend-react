import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { pickFirstSurfaceError } from "@/features/notifications/utils/notificationFeedOps";
import { useI18n } from "@/components/i18n";

interface UseNotificationBellParams {
  mobile: boolean;
}

export const useNotificationBell = ({ mobile }: UseNotificationBellParams) => {
  const { t, formatNumber } = useI18n();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const dialogId = mobile
    ? "notifications-panel-mobile"
    : "notifications-panel-desktop";

  const [panelOpenState, setPanelOpenState] = useState({
    path: location.pathname,
    open: false,
  });

  const panelOpen =
    panelOpenState.path === location.pathname && panelOpenState.open;

  const setPanelOpen = useCallback(
    (nextOpen: boolean) => {
      setPanelOpenState({ path: location.pathname, open: nextOpen });
    },
    [location.pathname],
  );

  const {
    filteredNotifications,
    unreadCount,
    loading,
    error,
    filterTab,
    setFilterTab,
    markAsRead,
    markAllRead,
    removeNotification,
    markAllPending,
    itemPendingMap,
    actionError,
    clearActionError,
    refresh,
  } = useNotifications({ autoFetch: false });

  const panelError = pickFirstSurfaceError(actionError, error);

  useEffect(() => {
    if (!panelOpen) return;

    const closeOnOutsidePointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setPanelOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanelOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsidePointer);
    document.addEventListener("touchstart", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsidePointer);
      document.removeEventListener("touchstart", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [panelOpen, setPanelOpen]);

  useEffect(() => {
    if (!panelOpen || !mobile) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobile, panelOpen]);

  useEffect(() => {
    if (!panelOpen) return;
    panelRef.current?.focus();
  }, [panelOpen]);

  useEffect(() => {
    if (!panelOpen) return;

    const shouldShowLoader = !hasLoadedOnceRef.current;
    hasLoadedOnceRef.current = true;

    void refresh({
      showLoader: shouldShowLoader,
      showPageError: true,
    });
  }, [panelOpen, refresh]);

  useEffect(() => {
    if (panelOpen) return;
    clearActionError();
  }, [clearActionError, panelOpen]);

  const retryPanelLoad = useCallback(() => {
    clearActionError();
    void refresh({
      showLoader: true,
      showPageError: true,
      forceRefresh: true,
    });
  }, [clearActionError, refresh]);

  const togglePanel = useCallback(() => {
    setPanelOpen(!panelOpen);
  }, [panelOpen, setPanelOpen]);

  const unreadDisplay =
    unreadCount > 99 ? "99+" : formatNumber(Math.max(0, unreadCount));

  const unreadLabel = t("notifications.unread", { count: unreadDisplay });
  const liveUnreadMessage =
    unreadCount > 0
      ? t("notifications.unreadStatus", { count: unreadDisplay })
      : t("notifications.noUnreadStatus");

  const panelTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2 };

  const spinMarkAllIcon = markAllPending && !shouldReduceMotion;

  const feed = {
    filteredNotifications,
    unreadCount,
    loading,
    actionError,
    filterTab,
    setFilterTab,
    markAsRead,
    markAllRead,
    removeNotification,
    markAllPending,
    itemPendingMap,
  };

  return {
    t,
    mobile,
    rootRef,
    panelRef,
    dialogId,
    panelOpen,
    togglePanel,
    closePanel: () => setPanelOpen(false),
    feed,
    panelError,
    retryPanelLoad,
    unreadDisplay,
    unreadLabel,
    liveUnreadMessage,
    panelTransition,
    spinMarkAllIcon,
  };
};
