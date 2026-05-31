import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import {
  AUTH_STORAGE_KEYS,
  AUTH_SESSION_CLEARED_EVENT,
} from "@/features/auth/constants";
import {
  ApiError,
  extractBackendErrorMessage,
  extractBackendStatusCode,
  getStatusFallbackMessage,
  isTransportStatusMessage,
  extractValidationErrors,
} from "@/utils/apiError";
import type { ApiResponse } from "@/types";

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

const readStoredAuthToken = (): string | null => {
  const localToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  if (localToken) return localToken;

  return sessionStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
};

const clearStoredAuthSession = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  sessionStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
  sessionStorage.removeItem(AUTH_STORAGE_KEYS.USER);
};

const notifyAuthSessionCleared = (): void => {
  window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT));
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (config.headers && typeof config.headers.set === "function") {
        config.headers.set("Content-Type", undefined);
      } else if (config.headers) {
        const headers = config.headers as Record<string, unknown>;
        delete headers["Content-Type"];
        delete headers["content-type"];
      }
    }

    const token = readStoredAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
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
      response.data = body.data;
    }
    return response;
  },

  (error: AxiosError) => {
    const httpStatus = error.response?.status;

    if (httpStatus === 401) {
      clearStoredAuthSession();
      notifyAuthSessionCleared();
      const isInAuthFlow = AUTH_FLOW_PATHS.has(window.location.pathname);
      if (!isInAuthFlow) {
        window.location.href = "/login";
      }
    }

    const body = error.response?.data;
    const validationErrors = extractValidationErrors(body);
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
