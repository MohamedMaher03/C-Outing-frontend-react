/**
 * Axios Configuration
 * Shared axios instance with request / response interceptors.
 *
 * Request interceptor  — injects the JWT access token on every outgoing call.
 * Response interceptor — handles 401 Unauthorized globally (clear session + redirect).
 */

import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

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
// On 401: clear the stale session and redirect to /login.
// All other errors are re-thrown for callers to handle.

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      // Only redirect if not already on the login page to avoid loops.
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
export { axiosInstance };
