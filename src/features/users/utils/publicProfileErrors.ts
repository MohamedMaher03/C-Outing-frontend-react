import { getErrorMessage, isApiError } from "@/utils/apiError";

const OFFLINE_PROFILE_MESSAGE =
  "You are offline. Reconnect and try again.";
const SESSION_EXPIRED_PROFILE_MESSAGE =
  "Your session expired. Please sign in again.";
const FORBIDDEN_PROFILE_MESSAGE =
  "You do not have permission to view this profile.";
const MISSING_PROFILE_MESSAGE =
  "This profile does not exist or is no longer available.";
const RATE_LIMITED_PROFILE_MESSAGE =
  "Too many requests right now. Please wait a few seconds and retry.";
const SERVER_PROFILE_MESSAGE =
  "We are having trouble loading this profile. Please try again shortly.";
const DEFAULT_PROFILE_MESSAGE =
  "We could not load this profile right now.";
export const INVALID_PROFILE_LINK_MESSAGE =
  "This profile link is invalid.";

const PROFILE_ERROR_BY_STATUS: Partial<Record<number, string>> = {
  401: SESSION_EXPIRED_PROFILE_MESSAGE,
  403: FORBIDDEN_PROFILE_MESSAGE,
  404: MISSING_PROFILE_MESSAGE,
  429: RATE_LIMITED_PROFILE_MESSAGE,
};

export const resolvePublicProfileErrorMessage = (
  error: unknown,
  fallback = DEFAULT_PROFILE_MESSAGE,
): string => {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return OFFLINE_PROFILE_MESSAGE;
  }

  if (isApiError(error)) {
    const mapped = PROFILE_ERROR_BY_STATUS[error.statusCode ?? -1];
    if (mapped) return mapped;
    if ((error.statusCode ?? 0) >= 500) return SERVER_PROFILE_MESSAGE;
  }

  return getErrorMessage(error, fallback);
};
