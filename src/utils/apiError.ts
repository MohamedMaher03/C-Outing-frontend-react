/**
 * ApiError — Global Standardized Error Class
 *
 * Thrown by the axiosInstance response interceptor whenever the backend
 * returns a non-2xx response OR a 2xx with `success: false`.
 * The interceptor reads the backend’s ApiResponse envelope:
 *
 *   { success: false, statusCode: 400, message: "...", data: null }
 *   → new ApiError(message, statusCode)
 *
 * Components and hooks should use `isApiError` to type-narrow caught
 * errors, then read `.message` for the UI string and `.statusCode` for
 * programmatic branching (e.g. navigating to a specific route).
 *
 * ─── Usage in a hook ─────────────────────────────────────────────────
 *
 *   import { isApiError, getErrorMessage } from "@/utils/apiError";
 *
 *   try {
 *     await someService.doSomething();
 *   } catch (err) {
 *     setError(getErrorMessage(err));    // always a string — safe for toast
 *     if (isApiError(err) && err.statusCode === 409) {
 *       // handle specific conflict case
 *     }
 *   }
 *
 * ─── Usage with a toast library ─────────────────────────────────────────
 *
 *   import { toast } from "sonner";
 *   import { getErrorMessage } from "@/utils/apiError";
 *
 *   catch (err) { toast.error(getErrorMessage(err)); }
 */

// ── Error Class ───────────────────────────────────────────────────────────

export class ApiError extends Error {
  /** Always `true` — lets you skip instanceof in plain-JS contexts. */
  public readonly isApiError = true as const;

  /**
   * HTTP or backend status code.
   * Undefined for network/timeout errors where no server response was received.
   */
  public readonly statusCode?: number;

  /** Raw backend error payload when available. */
  public readonly details?: unknown;

  /** Model-state / validation errors keyed by field name. */
  public readonly validationErrors?: ValidationErrors;

  constructor(
    message: string,
    statusCode?: number,
    options?: {
      details?: unknown;
      validationErrors?: ValidationErrors;
    },
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = options?.details;
    this.validationErrors = options?.validationErrors;

    // Fix prototype chain for reliable `instanceof` checks after TS transpilation.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export type ValidationErrors = Record<string, string[]>;

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asValidationErrors = (value: unknown): ValidationErrors | undefined => {
  if (!isObjectRecord(value)) return undefined;

  const entries = Object.entries(value).reduce<ValidationErrors>(
    (acc, [field, messages]) => {
      if (!Array.isArray(messages)) return acc;
      const filtered = messages.filter(
        (message): message is string =>
          typeof message === "string" && message.trim().length > 0,
      );
      if (filtered.length > 0) {
        acc[field] = filtered;
      }
      return acc;
    },
    {},
  );

  return Object.keys(entries).length > 0 ? entries : undefined;
};

/**
 * Extract validation errors from common backend shapes.
 * Supports ASP.NET model-state format: { errors: { Field: ["..."] } }.
 */
export function extractValidationErrors(
  payload: unknown,
): ValidationErrors | undefined {
  if (!isObjectRecord(payload)) return undefined;

  if ("errors" in payload) {
    return asValidationErrors(payload.errors);
  }

  return asValidationErrors(payload);
}

/** Returns the first validation message found in a validation map. */
export function getFirstValidationErrorMessage(
  validationErrors?: ValidationErrors,
): string | undefined {
  if (!validationErrors) return undefined;

  for (const fieldMessages of Object.values(validationErrors)) {
    const first = fieldMessages[0];
    if (first) return first;
  }

  return undefined;
}

/**
 * Builds a readable error message from backend payloads.
 * Priority: first validation message -> `message` -> `title`.
 */
export function extractBackendErrorMessage(
  payload: unknown,
): string | undefined {
  if (!isObjectRecord(payload)) return undefined;

  const validationMessage = getFirstValidationErrorMessage(
    extractValidationErrors(payload),
  );
  if (validationMessage) return validationMessage;

  if (
    typeof payload.message === "string" &&
    payload.message.trim().length > 0
  ) {
    return payload.message;
  }

  if (typeof payload.title === "string" && payload.title.trim().length > 0) {
    return payload.title;
  }

  return undefined;
}

/** Extract status code from common backend payload shapes. */
export function extractBackendStatusCode(payload: unknown): number | undefined {
  if (!isObjectRecord(payload)) return undefined;

  if (typeof payload.statusCode === "number") return payload.statusCode;
  if (typeof payload.status === "number") return payload.status;
  return undefined;
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
