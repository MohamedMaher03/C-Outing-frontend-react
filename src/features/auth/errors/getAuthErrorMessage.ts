import { AUTH_ERROR_MESSAGES } from "../constants";
import { AuthError } from "./AuthError";

const EMAIL_NOT_VERIFIED_MESSAGE_PATTERN =
  /(email.*not\s*verif|verify\s*your\s*email|unverified\s*email|confirm\s*your\s*email|account\s*not\s*verified)/i;
const TIMEOUT_MESSAGE_PATTERN = /(timeout|timed\s*out|exceeded)/i;

/**
 * Converts any auth-domain error into a user-facing string.
 * Prefers backend messages when present, otherwise falls back to mapped copy.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    if (
      error.code === "NETWORK_ERROR" &&
      TIMEOUT_MESSAGE_PATTERN.test(error.message)
    ) {
      return "This request is taking longer than expected. If your account was created, continue with email verification.";
    }

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

export function isEmailNotVerifiedError(error: unknown): boolean {
  if (error instanceof AuthError) {
    if (error.code === "EMAIL_NOT_VERIFIED") return true;
    return EMAIL_NOT_VERIFIED_MESSAGE_PATTERN.test(error.message);
  }

  if (error instanceof Error) {
    return EMAIL_NOT_VERIFIED_MESSAGE_PATTERN.test(error.message);
  }

  return false;
}
