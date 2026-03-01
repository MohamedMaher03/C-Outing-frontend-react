/**
 * ApiError — Global Standardized Error Class
 *
 * Thrown by the axiosInstance response interceptor whenever the backend
 * returns a non-2xx response.  The interceptor extracts `message` and
 * `errorCode` from our agreed ApiResponse envelope before rejecting:
 *
 *   { success: false, message: "...", errorCode: "...", data: null }
 *   → new ApiError(message, statusCode, errorCode)
 *
 * Components and hooks should use `isApiError` to type-narrow caught
 * errors, then read `.message` for the UI string and `.errorCode` for
 * programmatic branching (e.g. navigating to a specific route).
 *
 * ─── Usage in a component / hook ────────────────────────────────────────
 *
 *   import { isApiError, getErrorMessage } from "@/utils/apiError";
 *
 *   try {
 *     await someService.doSomething();
 *   } catch (err) {
 *     const msg = getErrorMessage(err);          // always a string — safe for toast
 *     if (isApiError(err) && err.errorCode === "RATE_LIMITED") {
 *       // handle specific case
 *     }
 *   }
 *
 * ─── Usage with a toast library ─────────────────────────────────────────
 *
 *   import { toast } from "sonner"; // or any other toast lib
 *   import { getErrorMessage } from "@/utils/apiError";
 *
 *   catch (err) {
 *     toast.error(getErrorMessage(err));
 *   }
 */

// ── Error Class ───────────────────────────────────────────────────────────

export class ApiError extends Error {
  /** Always `true` — lets you skip instanceof in plain-JS contexts. */
  public readonly isApiError = true as const;

  /** HTTP status code (undefined for network/timeout errors). */
  public readonly statusCode?: number;

  /**
   * Machine-readable error code sent by the backend.
   * Maps to backend-defined constants, e.g. "EMAIL_ALREADY_EXISTS".
   * Use this for programmatic branching, not for display.
   */
  public readonly errorCode?: string;

  constructor(message: string, statusCode?: number, errorCode?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;

    // Fix prototype chain for reliable `instanceof` checks after TS transpilation.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// ── Type Guards & Helpers ─────────────────────────────────────────────────

/**
 * Type-narrows `error` to `ApiError`.
 * Prefers `instanceof` but also accepts duck-typed objects with `isApiError`
 * so errors that crossed iframe / module boundaries still work.
 */
export function isApiError(error: unknown): error is ApiError {
  if (error instanceof ApiError) return true;
  return (
    typeof error === "object" &&
    error !== null &&
    (error as Record<string, unknown>).isApiError === true
  );
}

/**
 * Extracts a human-readable message from any caught value.
 *
 * Priority:
 *   1. ApiError.message  (already user-friendly, set by the interceptor from backend)
 *   2. Error.message     (JS native errors, e.g. network timeout)
 *   3. `fallback`        (last resort)
 *
 * @param fallback - Shown when the error yields no meaningful message.
 *                   Defaults to "An unexpected error occurred."
 */
export function getErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred.",
): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === "string" && error.length > 0) return error;
  return fallback;
}

/**
 * Returns the `errorCode` from an ApiError, or `undefined` for all other
 * error types.  Use this for programmatic feature logic without having to
 * call `isApiError` first.
 *
 * @example
 *   const code = getErrorCode(err);
 *   if (code === "SUBSCRIPTION_REQUIRED") navigate("/upgrade");
 */
export function getErrorCode(error: unknown): string | undefined {
  return isApiError(error) ? error.errorCode : undefined;
}
