import { useContext } from "react";
import {
  NotificationsCountContext,
  type NotificationsCountContextType,
} from "../context/notificationsCount.context";

/**
 * useNotificationsCount — read or update the global unread badge count.
 * Must be used inside NotificationsCountProvider.
 */
export function useNotificationsCount(): NotificationsCountContextType {
  const ctx = useContext(NotificationsCountContext);

  if (ctx === undefined) {
    throw new Error(
      "useNotificationsCount must be used within NotificationsCountProvider",
    );
  }

  return ctx;
}
