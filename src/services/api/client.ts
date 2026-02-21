/**
 * API Client Service
 * Centralized HTTP client with authentication, error handling, and interceptors
 */

import { API_CONFIG } from "../../config/api";

interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  body?: unknown;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokenFromStorage();
  }

  /**
   * Load JWT token from local storage
   */
  private loadTokenFromStorage(): void {
    this.token = localStorage.getItem("authToken");
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem("authToken", token);
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem("authToken");
  }

  /**
   * Build headers with authentication
   */
  private buildHeaders(
    customHeaders?: Record<string, string>,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make GET request
   */
  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, "GET", config);
  }

  /**
   * Make POST request
   */
  async post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(url, "POST", {
      ...config,
      body: data,
    });
  }

  /**
   * Make PUT request
   */
  async put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(url, "PUT", {
      ...config,
      body: data,
    });
  }

  /**
   * Make DELETE request
   */
  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, "DELETE", config);
  }

  /**
   * Core request method with retry logic
   */
  private async request<T>(
    url: string,
    method: string = "GET",
    config?: RequestConfig,
    attempt: number = 1,
  ): Promise<T> {
    try {
      const headers = this.buildHeaders(config?.headers);
      const fullURL = this.buildFullURL(url, config?.params);

      const response = await fetch(fullURL, {
        method,
        headers,
        body: config?.body ? JSON.stringify(config.body) : undefined,
      });

      // Handle authentication errors
      if (response.status === 401) {
        this.clearToken();
        // Redirect to login would happen in context/provider
        throw new Error("Unauthorized. Please login again.");
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      // Retry logic for network errors
      if (attempt < API_CONFIG.retryAttempts && this.isRetryableError(error)) {
        await new Promise((resolve) =>
          setTimeout(resolve, API_CONFIG.retryDelay * attempt),
        );
        return this.request<T>(url, method, config, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Build full URL with query parameters
   */
  private buildFullURL(
    endpoint: string,
    params?: Record<string, unknown>,
  ): string {
    const url = new URL(
      endpoint.startsWith("http") ? endpoint : `${this.baseURL}${endpoint}`,
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Check if error is retryable (network error, timeout, etc.)
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof TypeError) {
      return (
        error.message.includes("fetch") || error.message.includes("network")
      );
    }
    return false;
  }
}

export const apiClient = new ApiClient(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
);
