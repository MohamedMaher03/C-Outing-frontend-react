/**
 * Auth Feature — Constants
 */

/** LocalStorage key names used by auth. Centralised so every layer reads from one place. */
export const AUTH_STORAGE_KEYS = {
  TOKEN: "authToken",
  USER: "authUser",
} as const;

/** Human-readable error messages surfaced to the UI. */
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists.",
  PHONE_ALREADY_EXISTS: "An account with this phone number already exists.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
} as const;

export type AuthErrorKey = keyof typeof AUTH_ERROR_MESSAGES;

/** Alias — preferred name in the errors/ module. */
export type AuthErrorCode = AuthErrorKey;
