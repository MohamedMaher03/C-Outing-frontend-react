/**
 * AuthError — Unified Error Class for the Auth Feature
 *
 * Every layer (mock, real API, service) throws this same error class so that
 * the UI hooks can always read `error.code` to look up a user-friendly message.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  Why a custom error?                                                     │
 * │                                                                          │
 * │  • axios throws Error("Request failed with status code 401")             │
 * │  • Mocks throw Error("INVALID_CREDENTIALS")                              │
 * │  • The backend may return { error: { code: "INVALID_CREDENTIALS" } }     │
 * │                                                                          │
 * │  AuthError standardises all of these into one shape so the UI never      │
 * │  needs to know *where* the error came from.                              │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Usage:
 *   throw new AuthError("INVALID_CREDENTIALS");
 *   throw new AuthError("NETWORK_ERROR", "Could not reach server");
 */

import type { AuthErrorCode } from "../constants";
import type { ValidationErrors } from "@/utils/apiError";

export class AuthError extends Error {
  /** Error code that maps 1-to-1 with AUTH_ERROR_MESSAGES keys */
  public readonly code: AuthErrorCode;

  /**
   * Optional HTTP status code — useful for logging / debugging.
   * Undefined when the error did not originate from an HTTP response.
   */
  public readonly statusCode?: number;

  /** Field-level validation errors, if provided by backend. */
  public readonly validationErrors?: ValidationErrors;

  constructor(
    code: AuthErrorCode,
    message?: string,
    statusCode?: number,
    validationErrors?: ValidationErrors,
  ) {
    super(message ?? code);
    this.name = "AuthError";
    this.code = code;
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;

    // Fix prototype chain for instanceof checks (TS class extending builtins)
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}
