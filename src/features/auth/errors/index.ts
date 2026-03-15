/**
 * Auth Errors — Public API
 *
 * Re-exports the custom error class and normalizer so other auth modules
 * can import from a single path:
 *
 *   import { AuthError, normalizeAuthError } from "../errors";
 */

export { AuthError } from "./AuthError";
export { normalizeAuthError } from "./normalizeAuthError";
export { getAuthErrorMessage } from "./getAuthErrorMessage";
export type { AuthErrorCode } from "../constants";
