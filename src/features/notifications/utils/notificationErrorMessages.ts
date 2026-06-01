import { getErrorMessage, isApiError } from "@/utils/apiError";

type NotificationFailureContext = "load" | "read" | "read-all" | "delete";

const OFFLINE_MESSAGE =
  "You are offline. Reconnect and try again." as const;

const STATUS_MESSAGES: Readonly<Partial<Record<number, string>>> = {
  401: "Your session expired. Sign in again to load notifications.",
  403: "This account does not have permission to access notifications.",
  404: "Notifications are unavailable right now. Please try again shortly.",
  429: "Too many requests. Please wait a few seconds and retry.",
};

const FALLBACK_BY_CONTEXT: Readonly<
  Record<NotificationFailureContext, string>
> = {
  load: "We could not load your notifications.",
  read: "We could not mark this notification as read.",
  "read-all": "We could not mark all notifications as read.",
  delete: "We could not delete this notification.",
};

const isBrowserOffline = (): boolean =>
  typeof navigator !== "undefined" && navigator.onLine === false;

export const resolveNotificationFailureMessage = (
  error: unknown,
  context: NotificationFailureContext,
): string => {
  if (isBrowserOffline()) return OFFLINE_MESSAGE;

  if (isApiError(error)) {
    const statusMessage = STATUS_MESSAGES[error.statusCode ?? -1];
    if (statusMessage) return statusMessage;

    if (typeof error.statusCode === "number" && error.statusCode >= 500) {
      return "We are having trouble loading notifications. Please try again shortly.";
    }
  }

  return getErrorMessage(error, FALLBACK_BY_CONTEXT[context]);
};
