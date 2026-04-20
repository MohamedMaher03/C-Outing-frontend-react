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

import { isObjectRecord } from "./typeGuards";

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

export type ApiUiErrorKind = "forbidden" | "load-failure" | "generic";

export interface ApiUiErrorMessages {
  forbiddenMessage: string;
  loadFailureMessage: string;
  genericMessage: string;
}

export interface ApiUiErrorState {
  kind: ApiUiErrorKind;
  message: string;
  statusCode?: number;
}

const TRANSPORT_STATUS_MESSAGE_PATTERN =
  /^Request failed with status code \d+$/i;
const LOAD_FAILURE_MESSAGE_PATTERN =
  /(network|timeout|timed out|failed to fetch|load failed|abort|network error|err_network|econnaborted)/i;

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

export const isTransportStatusMessage = (message?: string): boolean =>
  typeof message === "string" &&
  TRANSPORT_STATUS_MESSAGE_PATTERN.test(message.trim());

export const getStatusFallbackMessage = (
  statusCode?: number,
): string | undefined => {
  if (statusCode === undefined) return undefined;

  if (statusCode === 401) {
    return "Your session expired. Please sign in again.";
  }
  if (statusCode === 403) {
    return "Access denied. You do not have permission to perform this action.";
  }
  if (statusCode === 404) {
    return "We couldn't find what you were looking for.";
  }
  if (statusCode === 429) {
    return "Too many requests right now. Please try again shortly.";
  }
  if (statusCode >= 500) {
    return "We're having trouble reaching the server. Please check your connection or try refreshing the page.";
  }

  return undefined;
};

export const isLoadFailureError = (error: unknown): boolean => {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return true;
  }

  if (isApiError(error)) {
    if (error.statusCode === 408 || error.statusCode === 504) {
      return true;
    }

    if (typeof error.statusCode === "number" && error.statusCode >= 500) {
      return true;
    }

    return LOAD_FAILURE_MESSAGE_PATTERN.test(error.message.trim());
  }

  if (error instanceof Error) {
    return LOAD_FAILURE_MESSAGE_PATTERN.test(error.message.trim());
  }

  if (typeof error === "string") {
    return LOAD_FAILURE_MESSAGE_PATTERN.test(error.trim());
  }

  return false;
};

export const resolveApiUiErrorState = (
  error: unknown,
  messages: ApiUiErrorMessages,
): ApiUiErrorState => {
  if (isApiError(error) && error.statusCode === 403) {
    return {
      kind: "forbidden",
      message: messages.forbiddenMessage,
      statusCode: 403,
    };
  }

  if (isLoadFailureError(error)) {
    return {
      kind: "load-failure",
      message: messages.loadFailureMessage,
      statusCode: isApiError(error) ? error.statusCode : undefined,
    };
  }

  return {
    kind: "generic",
    message: getErrorMessage(error, messages.genericMessage),
    statusCode: isApiError(error) ? error.statusCode : undefined,
  };
};

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
  if (isApiError(error)) {
    const message = error.message.trim();
    if (message.length > 0 && !isTransportStatusMessage(message)) {
      return message;
    }

    const statusFallback = getStatusFallbackMessage(error.statusCode);
    if (statusFallback) {
      return statusFallback;
    }
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    if (message.length > 0 && !isTransportStatusMessage(message)) {
      return message;
    }
  }

  if (typeof error === "string" && error.length > 0) return error;
  return fallback;
}
