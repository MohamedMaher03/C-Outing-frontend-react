import { AUTH_ERROR_MESSAGES } from "../constants";
import { AuthError } from "./AuthError";

/**
 * Converts any auth-domain error into a user-facing string.
 * Prefers backend messages when present, otherwise falls back to mapped copy.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    const explicitMessage = error.message?.trim();
    if (explicitMessage && explicitMessage !== error.code) {
      return explicitMessage;
    }

    return AUTH_ERROR_MESSAGES[error.code] ?? AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
}
