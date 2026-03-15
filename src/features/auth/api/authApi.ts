/**
 * Auth API Layer
 *
 * Pure HTTP functions — no business logic, no side effects, no storage.
 * Each function maps 1-to-1 with a backend endpoint.
 *
 * Error handling:
 *   Every method wraps its axios call in a try-catch and re-throws a
 *   normalised AuthError so that upstream layers (hooks, UI) always
 *   receive a predictable error shape with a `.code` that maps straight
 *   to AUTH_ERROR_MESSAGES.
 *
 * The shared axios instance (src/config/axios.config.ts) handles:
 *   • Attaching the Authorization header on every request
 *   • Handling 401 responses globally
 *
 * To switch to mocks during development replace the import in authService.ts:
 *   import { authMock as authApi } from "../mocks/authMock";
 */

import axiosInstance from "@/config/axios.config";
import { API_ENDPOINTS } from "@/config/api";
import type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  VerifyEmailOtpResponse,
  ResendOtpRequest,
  AuthTokenApiData,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../types";
import { normalizeAuthError } from "../errors";

export const authApi = {
  /**
   * POST /users/login
   * Authenticates with email + password, returns token payload.
   *
   * The axiosInstance response interceptor unwraps the ApiResponse envelope,
   * so `data` here is already the endpoint payload — no `.data.data` needed.
   */
  async login(payload: LoginRequest): Promise<AuthTokenApiData> {
    try {
      const { data } = await axiosInstance.post<AuthTokenApiData>(
        API_ENDPOINTS.auth.login,
        payload,
      );
      return data;
    } catch (error) {
      console.error("Login API error:", error);
      throw normalizeAuthError(error);
    }
  },

  /**
   * POST /users/register
   * Creates a new account and triggers an OTP email — does NOT return a session.
   * The user must verify their email before they can log in.
   */
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    try {
      const { data } = await axiosInstance.post<RegisterResponse>(
        API_ENDPOINTS.auth.register,
        payload,
      );
      return data;
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  /**
   * POST /verify-email
   * Verifies the OTP sent to the user's email.
   * Returns the same token payload shape as login on success.
   */
  async verifyEmail(
    payload: VerifyEmailRequest,
  ): Promise<VerifyEmailOtpResponse> {
    try {
      const { data } = await axiosInstance.post<VerifyEmailOtpResponse>(
        API_ENDPOINTS.auth.verifyEmail,
        payload,
      );
      return data;
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  /**
   * POST /resend-otp
   * Sends a new OTP to the given email address.
   */
  async resendOtp(payload: ResendOtpRequest): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.auth.resendOtp, payload);
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  /**
   * POST /users/logout
   * Invalidates the server-side session / refresh token (best-effort).
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  /**
   * POST /forgot-password
   * Sends an OTP to the given email for password reset.
   */
  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.auth.forgotPassword, payload);
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  /**
   * POST /reset-password
   * Resets the password using the OTP sent to the email.
   */
  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.auth.resetPassword, payload);
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },
};
