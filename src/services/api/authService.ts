/**
 * Authentication Service
 * Handles user login, registration, and JWT token management
 */

import { apiClient } from "./client";
import { API_ENDPOINTS } from "../../config/api";
import { AuthResponse, ApiResponse } from "../../types";

export const authService = {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.auth.login,
      { email, password },
    );

    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }

    return response.data!;
  },

  /**
   * Register new user
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    age?: number;
  }): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.auth.register,
      data,
    );

    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }

    return response.data!;
  },

  /**
   * Logout user and clear token
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } finally {
      apiClient.clearToken();
    }
  },

  /**
   * Verify and restore session from stored token
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return false;

      apiClient.setToken(token);
      return true;
    } catch {
      apiClient.clearToken();
      return false;
    }
  },
};
