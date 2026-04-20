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
import {
  ApiError,
  extractBackendErrorMessage,
  extractBackendStatusCode,
  getStatusFallbackMessage,
  isTransportStatusMessage,
  extractValidationErrors,
} from "@/utils/apiError";
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

const AUTH_FLOW_PATHS = new Set([
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
]);

// ── Request Interceptor ──────────────────────────────────────
// Attach the stored JWT bearer token to every outgoing request.

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Let the browser set multipart boundaries for FormData payloads.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (config.headers && typeof config.headers.set === "function") {
        config.headers.set("Content-Type", undefined);
      } else if (config.headers) {
        const headers = config.headers as Record<string, unknown>;
        delete headers["Content-Type"];
        delete headers["content-type"];
      }
    }

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
  // The backend always wraps responses in ApiResponse<T>.
  // On success=true  → strip the envelope, expose T directly.
  // On success=false → the backend returned an application error on a 2xx
  //                    HTTP status; reject with ApiError so hooks handle it
  //                    the same way as a 4xx/5xx response.
  (response: AxiosResponse) => {
    const body = response.data as ApiResponse<unknown>;
    if (body !== null && typeof body === "object" && "success" in body) {
      if (!body.success) {
        const validationErrors = extractValidationErrors(body);
        return Promise.reject(
          new ApiError(
            extractBackendErrorMessage(body) ??
              body.message ??
              "Request failed.",
            extractBackendStatusCode(body) ?? response.status,
            {
              details: body,
              validationErrors,
            },
          ),
        );
      }
      // Replace the envelope with the inner payload.
      response.data = body.data;
    }
    return response;
  },

  // ── ERROR: standardize into ApiError ────────────────────────
  // The backend may embed its own statusCode inside the body that can
  // differ from the HTTP transport code, so prefer body.statusCode.
  (error: AxiosError) => {
    const httpStatus = error.response?.status;

    // 401: clear stale session and redirect to login.
    if (httpStatus === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      const isInAuthFlow = AUTH_FLOW_PATHS.has(window.location.pathname);
      if (!isInAuthFlow) {
        window.location.href = "/login";
      }
    }

    const body = error.response?.data;
    const validationErrors = extractValidationErrors(body);
    // Prefer the status code embedded in the backend body.
    const statusCode = extractBackendStatusCode(body) ?? httpStatus;

    const backendMessage = extractBackendErrorMessage(body);
    const transportMessage =
      typeof error.message === "string" ? error.message.trim() : "";
    const statusFallbackMessage = getStatusFallbackMessage(statusCode);

    const message =
      backendMessage ??
      (transportMessage.length > 0 &&
      !isTransportStatusMessage(transportMessage)
        ? transportMessage
        : (statusFallbackMessage ?? "An unexpected error occurred."));

    return Promise.reject(
      new ApiError(message, statusCode, {
        details: body,
        validationErrors,
      }),
    );
  },
);

export default axiosInstance;
export { axiosInstance };
