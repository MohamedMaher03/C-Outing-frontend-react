import { isObjectRecord } from "./typeGuards";


export class ApiError extends Error {
  public readonly isApiError = true as const;
  public readonly statusCode?: number;
  public readonly details?: unknown;
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
const STATUS_FALLBACK_MESSAGES: Record<number, string> = {
  401: "Your session expired. Please sign in again.",
  403: "Access denied. You do not have permission to perform this action.",
  404: "We couldn't find what you were looking for.",
  429: "Too many requests right now. Please try again shortly.",
};

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


export function extractValidationErrors(
  payload: unknown,
): ValidationErrors | undefined {
  if (!isObjectRecord(payload)) return undefined;

  if ("errors" in payload) {
    return asValidationErrors(payload.errors);
  }

  return asValidationErrors(payload);
}

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

export function extractBackendStatusCode(payload: unknown): number | undefined {
  if (!isObjectRecord(payload)) return undefined;

  return [payload.statusCode, payload.status].find(
    (statusCandidate): statusCandidate is number =>
      typeof statusCandidate === "number",
  );
}

export const isTransportStatusMessage = (message?: string): boolean =>
  typeof message === "string" &&
  TRANSPORT_STATUS_MESSAGE_PATTERN.test(message.trim());

export const getStatusFallbackMessage = (
  statusCode?: number,
): string | undefined => {
  if (statusCode === undefined) return undefined;

  const messageByStatus = STATUS_FALLBACK_MESSAGES[statusCode];
  if (messageByStatus) return messageByStatus;

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
    const transportStatusCode = error.statusCode;
    if (
      [408, 504].includes(transportStatusCode ?? -1) ||
      (transportStatusCode ?? 0) >= 500
    ) {
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
  const resolvedStatusCode = isApiError(error) ? error.statusCode : undefined;

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
      statusCode: resolvedStatusCode,
    };
  }

  return {
    kind: "generic",
    message: getErrorMessage(error, messages.genericMessage),
    statusCode: resolvedStatusCode,
  };
};

export function isApiError(error: unknown): error is ApiError {
  if (error instanceof ApiError) return true;
  return (
    typeof error === "object" &&
    error !== null &&
    (error as Record<string, unknown>).isApiError === true
  );
}


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
