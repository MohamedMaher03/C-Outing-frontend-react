/**
 * Core TypeScript types and interfaces
 */

// ============ User Types ============

/** Possible user roles in the system */
export type UserRole = "user" | "moderator" | "admin";

export interface User {
  userId: number;
  name: string;
  email: string;
  age: number;
  preferences: number[]; // Preference vector (e.g., [0.8, 0.5])
  lastUpdated: Date;
  totalInteractions: number;
  hasCompletedOnboarding: boolean;
  role: UserRole;
}

// ============ API Response Wrapper ============

/**
 * Standard backend envelope for ALL API responses.
 *
 * Success shape:  { success: true,  data: T,    message: "OK" }
 * Error shape:    { success: false, data: null, message: "...", errorCode: "..." }
 *
 * The axiosInstance response interceptor (src/config/axios.config.ts) unwraps
 * this automatically on success, so components always receive `T` directly.
 * On error the interceptor rejects with `ApiError` (src/utils/apiError.ts).
 */
export interface ApiResponse<T> {
  /** `true` on 2xx, `false` on any error. */
  success: boolean;
  /** The actual payload.  Typed as `T` on success, `null` on error. */
  data: T;
  /** Human-readable message from the server (success or error). */
  message: string;
  /** Pagination info or any extra metadata. */
  meta?: unknown;
  /** Machine-readable error code (e.g. "EMAIL_ALREADY_EXISTS"). */
  errorCode?: string;
}
