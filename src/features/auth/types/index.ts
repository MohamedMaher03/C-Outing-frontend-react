/**
 * Auth Feature — Type Definitions
 */

import type React from "react";
import type { LucideIcon } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import type { SignUpFormData } from "../validation/signUp.schema";
import type { User } from "@/types";

// ── API Request / Response ────────────────────────────────────

/** Payload sent to POST /users/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Payload sent to POST /users/register */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  /** RFC3339 date-time string sent as DateOfBirth query parameter. */
  dateOfBirth: string;
  /** Optional user-selected avatar image; fallback is generated if missing. */
  avatar?: File;
}

/** Backend returns `data: "…"` string on successful registration */
export type RegisterResponse = string;

/**
 * Backend returns a token-based auth payload on successful OTP verification,
 * identical in shape to the login response.
 */
export type VerifyEmailOtpResponse = AuthTokenApiData;

/** Payload sent to POST /verify-email */
export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

/** Payload sent to POST /resend-otp */
export interface ResendOtpRequest {
  email: string;
}

/** Payload sent to POST /forgot-password */
export interface ForgotPasswordRequest {
  email: string;
}

/** Payload sent to POST /reset-password */
export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

/**
 * Raw shape returned by auth endpoints (e.g. login / verify-email) after
 * the ApiResponse envelope is unwrapped by the axios interceptor.
 */
export interface AuthTokenApiData {
  token: string;
  hasCompletedOnboarding?: boolean;
}

/**
 * Internal auth session shape passed between authService and AuthProvider.
 * The service maps the raw backend response into this before returning.
 */
export interface AuthApiResponse {
  token: string;
  user: User;
}

// ── Auth Context State ────────────────────────────────────────

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ── Form Field Config ─────────────────────────────────────────

/** Login form field configuration */
export interface LoginField {
  id: "email";
  label: string;
  placeholder: string;
  type?: string;
}

/** Sign-up form field configuration (icon stored as component reference) */
export interface SignUpFieldConfig {
  id: keyof Omit<
    SignUpFormData,
    "password" | "confirmPassword" | "acceptTerms" | "avatar"
  >;
  label: string;
  placeholder: string;
  type?: string;
  Icon?: LucideIcon;
}

/** Shared props for a generic form field */
export interface FormFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  error?: string;
  register: UseFormRegisterReturn;
}

/** Shared props for the password input component */
export interface PasswordInputProps {
  id: string;
  placeholder?: string;
  error?: boolean;
  register: UseFormRegisterReturn;
}
