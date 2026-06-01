import { getErrorMessage, isApiError } from "@/utils/apiError";

type FavoritesFailureContext = "load" | "save";

const OFFLINE_MESSAGE =
  "You are offline. Reconnect and try again." as const;

const STATUS_MESSAGES: Readonly<Partial<Record<number, string>>> = {
  401: "Your session expired. Sign in again to view saved places.",
  403: "This account cannot access saved places.",
  404: "Saved places are unavailable right now. Please try again soon.",
  429: "Too many requests. Please wait a few seconds and retry.",
};

const FALLBACK_BY_CONTEXT: Readonly<Record<FavoritesFailureContext, string>> = {
  load: "We could not load your saved places.",
  save: "We could not update your saved places.",
};

const isBrowserOffline = (): boolean =>
  typeof navigator !== "undefined" && navigator.onLine === false;

export const resolveFavoritesFailureMessage = (
  error: unknown,
  context: FavoritesFailureContext,
): string => {
  if (isBrowserOffline()) return OFFLINE_MESSAGE;

  if (isApiError(error)) {
    const statusMessage = STATUS_MESSAGES[error.statusCode ?? -1];
    if (statusMessage) return statusMessage;

    if (typeof error.statusCode === "number" && error.statusCode >= 500) {
      return "We are having trouble loading saved places. Please try again shortly.";
    }
  }

  return getErrorMessage(error, FALLBACK_BY_CONTEXT[context]);
};
