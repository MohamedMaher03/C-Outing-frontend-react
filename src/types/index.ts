/**
 * Core TypeScript types and interfaces
 */

// ============ User Types ============

/** Possible user roles in the system */
export type UserRole = "user" | "moderator" | "admin";

export interface User {
  userId: string;
  name: string;
  email: string;
  hasCompletedOnboarding: boolean;
  role: UserRole;
}

// ============ API Response Wrapper ============

/**
 * Standard backend envelope for ALL API responses.
 *
 * Success shape:  { success: true,  statusCode: 200, data: T,    message: "OK" }
 * Error shape:    { success: false, statusCode: 4xx, data: null, message: "..." }
 *
 * The axiosInstance response interceptor (src/config/axios.config.ts) unwraps
 * this automatically on success, so components always receive `T` directly.
 * On error the interceptor rejects with `ApiError` (src/utils/apiError.ts).
 *
 * Matches backend: Website.Presentation.Responses.ApiResponse<T>
 */
export interface ApiResponse<T> {
  /** `true` on 2xx, `false` on any error. */
  success: boolean;
  /** HTTP status code mirrored by the backend inside the envelope. */
  statusCode?: number;
  /** The actual payload.  `T` on success, `null` on error (matches C# `T?`). */
  data: T | null;
  /** Human-readable message from the server (success or error). */
  message: string;
  /** Optional title used by validation/problem-details style errors. */
  title?: string;
  /** Optional HTTP status mirror used by problem-details responses. */
  status?: number;
  /** Optional field-level validation errors keyed by backend field name. */
  errors?: Record<string, string[]>;
}

// ============ Paginated Response ============

/**
 * Standard paginated result envelope returned by list endpoints.
 *
 * Matches backend: Website.Presentation.Responses.PaginatedResultResponse<T>
 *
 * Wrapped inside ApiResponse<PaginatedResponse<T>> by the backend, but the
 * axiosInstance interceptor unwraps the outer envelope automatically, so
 * callers receive `PaginatedResponse<T>` directly.
 */
export interface PaginatedResponse<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface QueryParams {
  page?: number;
  count?: number;
}
