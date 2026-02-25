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
  phone: string;
  age?: number;
}

/** Shape the backend returns after a successful login / register */
export interface AuthApiResponse {
  userId: number;
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
    "password" | "confirmPassword" | "acceptTerms"
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
