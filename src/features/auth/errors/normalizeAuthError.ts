/**
 * normalizeAuthError — Converts any thrown error into an AuthError
 *
 * The axios interceptor always converts server errors into ApiError before
 * they reach this function, so the only cases we need to handle are:
 *
 *   1. Already an AuthError → pass through.
 *   2. ApiError (from interceptor) → map statusCode → AuthErrorCode.
 *   3. Plain Error or unknown → network failure before any response.
 *
 * Status-code mapping:
 *   400 / 422 → INVALID_CREDENTIALS  (bad request / validation)
 *   401       → INVALID_CREDENTIALS  (wrong password / unauthenticated)
 *   403       → ACCESS_DENIED
 *   404       → EMAIL_NOT_FOUND
 *   409       → EMAIL_ALREADY_EXISTS (register conflict)
 *   429       → RATE_LIMITED
 *   undefined → NETWORK_ERROR        (no response received)
 *   5xx / *   → UNKNOWN_ERROR
 */

import { AuthError } from "./AuthError";
import { isApiError, getFirstValidationErrorMessage } from "@/utils/apiError";
import type { AuthErrorCode } from "../constants";

const HTTP_STATUS_TO_AUTH_CODE: Partial<Record<number, AuthErrorCode>> = {
  400: "INVALID_CREDENTIALS",
  401: "INVALID_CREDENTIALS",
  403: "ACCESS_DENIED",
  404: "EMAIL_NOT_FOUND",
  409: "EMAIL_ALREADY_EXISTS",
  429: "RATE_LIMITED",
  422: "INVALID_CREDENTIALS",
};

const isTransportStatusMessage = (message?: string): boolean =>
  typeof message === "string" &&
  /^Request failed with status code \d+$/i.test(message);

const isLikelyNetworkFailure = (message?: string): boolean =>
  typeof message === "string" &&
  /(network|timeout|timed out|failed to fetch|load failed|abort)/i.test(
    message,
  );

export function normalizeAuthError(error: unknown): AuthError {
  // 1. Already an AuthError — pass through.
  if (error instanceof AuthError) return error;

  // 2. ApiError thrown by the axios interceptor.
  if (isApiError(error)) {
    const { statusCode, message, validationErrors } = error;

    const validationMessage = getFirstValidationErrorMessage(validationErrors);
    if (validationMessage) {
      return new AuthError(
        "VALIDATION_ERROR",
        validationMessage,
        statusCode,
        validationErrors,
      );
    }

    const mapped =
      statusCode !== undefined
        ? HTTP_STATUS_TO_AUTH_CODE[statusCode]
        : undefined;
    const code: AuthErrorCode =
      mapped ?? (statusCode === undefined ? "NETWORK_ERROR" : "UNKNOWN_ERROR");

    const normalizedMessage = isTransportStatusMessage(message)
      ? undefined
      : message;

    return new AuthError(code, normalizedMessage, statusCode, validationErrors);
  }

  // 3. Network failure or unexpected non-ApiError.
  const fallbackMessage =
    error instanceof Error ? error.message : String(error);
  const code: AuthErrorCode = isLikelyNetworkFailure(fallbackMessage)
    ? "NETWORK_ERROR"
    : "UNKNOWN_ERROR";

  return new AuthError(code, fallbackMessage);
}
