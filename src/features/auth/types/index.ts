import type React from "react";
import type { LucideIcon } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import type { SignUpFormData } from "../validation/signUp.schema";
import type { User } from "@/types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: string;
  avatar?: File;
}

export type RegisterResponse = string;

export type VerifyEmailOtpResponse = AuthTokenApiData;

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AuthTokenApiData {
  token: string;
  hasCompletedOnboarding?: boolean;
}

export interface AuthApiResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginField {
  id: "email";
  label: string;
  placeholder: string;
  type?: string;
}

export interface SignUpFieldConfig {
  id: keyof Omit<SignUpFormData, "password" | "confirmPassword" | "avatar">;
  label: string;
  placeholder: string;
  type?: string;
  Icon?: LucideIcon;
}

export interface FormFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  register: UseFormRegisterReturn;
}

export interface PasswordInputProps {
  id: string;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  register: UseFormRegisterReturn;
}
