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
 *   404       → EMAIL_NOT_FOUND
 *   409       → EMAIL_ALREADY_EXISTS (register conflict)
 *   undefined → NETWORK_ERROR        (no response received)
 *   5xx / *   → UNKNOWN_ERROR
 */

import { AuthError } from "./AuthError";
import { isApiError } from "@/utils/apiError";
import type { AuthErrorCode } from "../constants";

const HTTP_STATUS_TO_AUTH_CODE: Partial<Record<number, AuthErrorCode>> = {
  400: "INVALID_CREDENTIALS",
  401: "INVALID_CREDENTIALS",
  404: "EMAIL_NOT_FOUND",
  409: "EMAIL_ALREADY_EXISTS",
  422: "INVALID_CREDENTIALS",
};

export function normalizeAuthError(error: unknown): AuthError {
  // 1. Already an AuthError — pass through.
  if (error instanceof AuthError) return error;

  // 2. ApiError thrown by the axios interceptor.
  if (isApiError(error)) {
    const { statusCode, message } = error;
    const mapped =
      statusCode !== undefined
        ? HTTP_STATUS_TO_AUTH_CODE[statusCode]
        : undefined;
    const code: AuthErrorCode =
      mapped ?? (statusCode === undefined ? "NETWORK_ERROR" : "UNKNOWN_ERROR");
    return new AuthError(code, message, statusCode);
  }

  // 3. Network failure or unexpected non-ApiError.
  return new AuthError(
    "UNKNOWN_ERROR",
    error instanceof Error ? error.message : String(error),
  );
}
