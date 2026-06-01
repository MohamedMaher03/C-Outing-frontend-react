import { getErrorMessage, isApiError } from "@/utils/apiError";

const OFFLINE_COPY = "You are offline. Reconnect and retry.";
const SESSION_EXPIRED_COPY = "Your session expired. Sign in again and retry.";
const FORBIDDEN_COPY = "Your account does not have access to this map data.";
const NOT_FOUND_COPY = "Requested map data was not found.";
const RATE_LIMIT_COPY = "Too many requests. Please wait a moment and retry.";
const SERVER_TIMEOUT_COPY =
  "Server timeout while loading map data. Please try again shortly.";

const SERVER_FAULT_STATUSES = new Set([408, 504]);

const isServerFaultStatus = (statusCode: number | undefined): boolean =>
  typeof statusCode === "number" &&
  (SERVER_FAULT_STATUSES.has(statusCode) || statusCode >= 500);

export const resolveMapAtlasErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return OFFLINE_COPY;
  }

  if (!isApiError(error)) {
    return getErrorMessage(error, fallback);
  }

  const statusCopy: Partial<Record<number, string>> = {
    401: SESSION_EXPIRED_COPY,
    403: FORBIDDEN_COPY,
    404: NOT_FOUND_COPY,
    429: RATE_LIMIT_COPY,
  };

  if (error.statusCode !== undefined && statusCopy[error.statusCode]) {
    return statusCopy[error.statusCode] as string;
  }

  if (isServerFaultStatus(error.statusCode)) {
    return SERVER_TIMEOUT_COPY;
  }

  return getErrorMessage(error, fallback);
};
