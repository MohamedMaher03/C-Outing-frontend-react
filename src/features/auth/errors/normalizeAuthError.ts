/**
 * normalizeAuthError — Converts any thrown error into an AuthError
 *
 * This is the KEY piece that solves the error-handling mismatch between
 * mock data and the real backend.
 *
 * How it works (priority order):
 *
 *   1. If the error is already an AuthError → return it as-is.
 *
 *   2. If it's an ApiError (thrown by the axiosInstance response interceptor):
 *      The interceptor already extracted message from the backend envelope.
 *      Map the HTTP status code to a typed AuthErrorCode.
 *      → The backend ApiResponse does not include an errorCode field.
 *
 *   3. If none of the above, map the HTTP status code to a sensible default:
 *        400 → INVALID_CREDENTIALS
 *        401 → INVALID_CREDENTIALS
 *        409 → EMAIL_ALREADY_EXISTS   (register conflicts)
 *        422 → INVALID_CREDENTIALS    (validation failure)
 *        5xx → UNKNOWN_ERROR
 *
 *   4. If axios received no response at all → NETWORK_ERROR.
 *
 *   5. Anything else → UNKNOWN_ERROR.
 *
 * Usage:
 *   import { normalizeAuthError } from "../errors/normalizeAuthError";
 *
 *   try {
 *     const res = await axiosInstance.post(url, payload);
 *   } catch (err) {
 *     throw normalizeAuthError(err);
 *   }
 */

import axios from "axios";
import { AuthError } from "./AuthError";
import { isApiError } from "@/utils/apiError";
import { AUTH_ERROR_MESSAGES } from "../constants";
import type { AuthErrorCode } from "../constants";

// ── HTTP status → error code mapping ─────────────────────────

/**
 * Fallback mapping when the backend does not include an explicit error code
 * in the response body.  Extend this map as new endpoints / status codes
 * are introduced.
 */
const HTTP_STATUS_TO_AUTH_CODE: Partial<Record<number, AuthErrorCode>> = {
  400: "INVALID_CREDENTIALS",
  401: "INVALID_CREDENTIALS",
  409: "EMAIL_ALREADY_EXISTS",
  422: "INVALID_CREDENTIALS",
};

// ── Normalizer ───────────────────────────────────────────────

export function normalizeAuthError(error: unknown): AuthError {
  // 1. Already an AuthError — pass through.
  if (error instanceof AuthError) {
    return error;
  }

  // 2. ApiError (thrown by the axiosInstance response interceptor).
  //    The interceptor already extracted message + errorCode from the envelope.
  if (isApiError(error)) {
    const code = error.errorCode;
    if (code && isAuthErrorCode(code)) {
      return new AuthError(
        code as AuthErrorCode,
        error.message,
        error.statusCode,
      );
    }
    if (error.statusCode && HTTP_STATUS_TO_AUTH_CODE[error.statusCode]) {
      return new AuthError(
        HTTP_STATUS_TO_AUTH_CODE[error.statusCode]!,
        error.message,
        error.statusCode,
      );
    }
    if (!error.statusCode || error.statusCode >= 500) {
      return new AuthError("UNKNOWN_ERROR", error.message, error.statusCode);
    }
    return new AuthError(
      "INVALID_CREDENTIALS",
      error.message,
      error.statusCode,
    );
  }

  // 3. Raw Axios error — only reached when NOT using the shared axiosInstance
  //    (e.g. unit tests that bypass interceptors).
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const body = error.response?.data as Record<string, unknown> | undefined;

    // 3a. Backend provided an explicit error code in the response body.
    //     Supports both { errorCode } (new envelope) and { error: { code } } (legacy).
    const backendCode =
      body?.errorCode ??
      (body?.error as Record<string, unknown> | undefined)?.code;

    if (typeof backendCode === "string" && isAuthErrorCode(backendCode)) {
      return new AuthError(backendCode, error.message, status);
    }

    // 3b. No explicit code — fallback to status-code mapping.
    if (status && HTTP_STATUS_TO_AUTH_CODE[status]) {
      return new AuthError(
        HTTP_STATUS_TO_AUTH_CODE[status]!,
        error.message,
        status,
      );
    }

    // 3c. No response received at all — network / timeout issue.
    if (!error.response) {
      return new AuthError("NETWORK_ERROR", error.message);
    }
  }

  // 4. Plain Error with a message that matches a known code (legacy / mock compat).
  if (error instanceof Error && isAuthErrorCode(error.message)) {
    return new AuthError(error.message as AuthErrorCode);
  }

  // 5. Anything else — unknown.
  return new AuthError(
    "UNKNOWN_ERROR",
    error instanceof Error ? error.message : String(error),
  );
}

// ── Type guard ───────────────────────────────────────────────

function isAuthErrorCode(value: string): value is AuthErrorCode {
  return value in AUTH_ERROR_MESSAGES;
}
