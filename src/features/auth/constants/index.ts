/**
 * Auth Feature — Constants
 */

/** LocalStorage key names used by auth. Centralised so every layer reads from one place. */
export const AUTH_STORAGE_KEYS = {
  TOKEN: "authToken",
  USER: "authUser",
} as const;

/** Shared auth input constraints used across validation schemas and pages. */
export const AUTH_PASSWORD_RULES = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 100,
  COMPLEXITY_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  COMPLEXITY_MESSAGE:
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
} as const;

export const AUTH_AVATAR_RULES = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  MAX_SIZE_MB: 5,
  MIME_PREFIX: "image/",
} as const;

export const AUTH_OTP_LENGTH = 6;

/** Human-readable error messages surfaced to the UI. */
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists.",
  PHONE_ALREADY_EXISTS: "An account with this phone number already exists.",
  ACCESS_DENIED: "You do not have permission to perform this action.",
  RATE_LIMITED: "Too many attempts. Please wait a moment and try again.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  INVALID_OTP: "Invalid or expired code. Please check and try again.",
  OTP_EXPIRED: "Your verification code has expired. Please request a new one.",
  EMAIL_NOT_FOUND: "No account found with this email address.",
  INVALID_RESET_OTP: "Invalid or expired reset code. Please request a new one.",
  PASSWORD_RESET_FAILED: "Password reset failed. Please try again.",
  VALIDATION_ERROR: "Please review your input and try again.",
} as const;

export type AuthErrorKey = keyof typeof AUTH_ERROR_MESSAGES;

/** Alias — preferred name in the errors/ module. */
export type AuthErrorCode = AuthErrorKey;
