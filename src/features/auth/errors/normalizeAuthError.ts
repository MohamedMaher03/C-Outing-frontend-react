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
import { AUTH_ERROR_MESSAGES, type AuthErrorCode } from "../constants";

const HTTP_STATUS_TO_AUTH_CODE: Partial<Record<number, AuthErrorCode>> = {
  400: "INVALID_CREDENTIALS",
  401: "INVALID_CREDENTIALS",
  403: "ACCESS_DENIED",
  404: "EMAIL_NOT_FOUND",
  409: "EMAIL_ALREADY_EXISTS",
  429: "RATE_LIMITED",
  422: "INVALID_CREDENTIALS",
};

const AUTH_CODE_ALIASES: Record<string, AuthErrorCode> = {
  EMAIL_UNVERIFIED: "EMAIL_NOT_VERIFIED",
  UNVERIFIED_EMAIL: "EMAIL_NOT_VERIFIED",
  EMAIL_NOT_CONFIRMED: "EMAIL_NOT_VERIFIED",
  ACCOUNT_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
};

const EMAIL_NOT_VERIFIED_MESSAGE_PATTERN =
  /(email.*not\s*verif|verify\s*your\s*email|unverified\s*email|confirm\s*your\s*email|account\s*not\s*verified)/i;

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeCodeToken = (value: string): string =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const toAuthErrorCode = (value?: string): AuthErrorCode | undefined => {
  if (!value) return undefined;

  const normalized = normalizeCodeToken(value);
  if (!normalized) return undefined;

  if (normalized in AUTH_ERROR_MESSAGES) {
    return normalized as AuthErrorCode;
  }

  return AUTH_CODE_ALIASES[normalized];
};

const extractBackendErrorCode = (details: unknown): string | undefined => {
  if (!isObjectRecord(details)) return undefined;

  const code = details.code;
  if (typeof code === "string" && code.trim().length > 0) return code;

  const errorCode = details.errorCode;
  if (typeof errorCode === "string" && errorCode.trim().length > 0) {
    return errorCode;
  }

  const nestedError = details.error;
  if (isObjectRecord(nestedError)) {
    const nestedCode = nestedError.code;
    if (typeof nestedCode === "string" && nestedCode.trim().length > 0) {
      return nestedCode;
    }

    const nestedErrorCode = nestedError.errorCode;
    if (
      typeof nestedErrorCode === "string" &&
      nestedErrorCode.trim().length > 0
    ) {
      return nestedErrorCode;
    }
  }

  return undefined;
};

const isTransportStatusMessage = (message?: string): boolean =>
  typeof message === "string" &&
  /^Request failed with status code \d+$/i.test(message);

const isLikelyNetworkFailure = (message?: string): boolean =>
  typeof message === "string" &&
  /(network|timeout|timed out|failed to fetch|load failed|abort)/i.test(
    message,
  );

const isLikelyEmailNotVerified = (message?: string): boolean =>
  typeof message === "string" &&
  EMAIL_NOT_VERIFIED_MESSAGE_PATTERN.test(message);

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

    const backendCode = toAuthErrorCode(extractBackendErrorCode(error.details));
    if (backendCode) {
      return new AuthError(
        backendCode,
        normalizedMessage,
        statusCode,
        validationErrors,
      );
    }

    if (isLikelyEmailNotVerified(normalizedMessage ?? message)) {
      return new AuthError(
        "EMAIL_NOT_VERIFIED",
        normalizedMessage,
        statusCode,
        validationErrors,
      );
    }

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
