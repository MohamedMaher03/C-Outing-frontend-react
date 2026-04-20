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
import { buildRegisterPayload } from "../utils/registerPayload";
import { AUTH_TIMEOUTS } from "../constants";

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthTokenApiData> {
    try {
      const { data } = await axiosInstance.post<AuthTokenApiData>(
        API_ENDPOINTS.auth.login,
        payload,
      );
      return data;
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    try {
      const registerPayload = buildRegisterPayload(payload);
      const { data } = await axiosInstance.post<RegisterResponse>(
        API_ENDPOINTS.auth.register,
        registerPayload.formData,
        {
          timeout: AUTH_TIMEOUTS.REGISTER_REQUEST_MS,
          params: registerPayload.params,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return data;
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

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

  async resendOtp(payload: ResendOtpRequest): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.auth.resendOtp, payload);
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.auth.forgotPassword, payload);
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.auth.resetPassword, payload);
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },
};
