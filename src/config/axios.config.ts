/**
 * Axios Configuration
 * Shared axios instance with request / response interceptors.
 *
 * Request interceptor  — injects the JWT access token on every outgoing call.
 *
 * Response interceptor (SUCCESS) — unwraps our standard ApiResponse envelope.
 *   Backend sends: { success: true, statusCode: 200, data: T, message: "OK" }
 *   Caller receives: response.data === T   (envelope is transparent to the UI)
 *
 * Response interceptor (ERROR) — converts any HTTP error into a typed ApiError.
 *   Backend sends: { success: false, statusCode: 4xx, message: "...", data: null }
 *   Caller receives: Promise.reject(new ApiError(message, statusCode))
 *
 * This means ALL feature API files can type their calls as:
 *   axiosInstance.get<T>(url)  →  AxiosResponse<T>  →  { data: T }
 * without any manual .data.data access.
 */

import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiError } from "@/utils/apiError";
import type { ApiResponse } from "@/types";

// ── Instance ─────────────────────────────────────────────────

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request Interceptor ──────────────────────────────────────
// Attach the stored JWT bearer token to every outgoing request.

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("authToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ── Response Interceptor ─────────────────────────────────────

axiosInstance.interceptors.response.use(
  // ── SUCCESS: unwrap the ApiResponse envelope ────────────────
  // Mutate response.data from ApiResponse<T> → T so that callers
  // can do `const { data } = await axiosInstance.get<T>(url)` and
  // get T directly.  Non-envelope responses (e.g. blob downloads)
  // are returned unchanged.
  (response: AxiosResponse) => {
    const body = response.data as ApiResponse<unknown>;
    if (
      body !== null &&
      typeof body === "object" &&
      "success" in body &&
      "data" in body
    ) {
      // Replace the envelope with the inner payload.
      response.data = body.data;
    }
    return response;
  },

  // ── ERROR: standardize into ApiError ────────────────────────
  // Extract message + errorCode from our standard error envelope
  // (or fall back to axios defaults) and reject with a typed ApiError.
  (error: AxiosError) => {
    const status = error.response?.status;

    // 401: clear stale session and redirect to login.
    if (status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    // Extract message from the standard envelope.
    const body = error.response?.data as
      | Partial<ApiResponse<never>>
      | undefined;
    const message =
      body?.message ?? error.message ?? "An unexpected error occurred.";

    return Promise.reject(new ApiError(message, status));
  },
);

export default axiosInstance;
export { axiosInstance };
