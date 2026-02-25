/**
 * Auth Feature — Public API
 *
 * Import anything auth-related from this barrel instead of deep paths:
 *   import { useAuth, useLogin, authService } from "@/features/auth";
 */

// Context + hooks
export { AuthContext, useAuth } from "./context/AuthContext";
export type { AuthContextType } from "./context/AuthContext";

// Provider
export { AuthProvider } from "./context/AuthProvider";
export type { AuthProviderProps } from "./context/AuthProvider";

// Services
export { authService } from "./services/authService";

// API layer (exposed for advanced usage / testing)
export { authApi } from "./api/authApi";

// Hooks
export { useLogin } from "./hooks/useLogin";
export { useSignUp } from "./hooks/useSignUp";
export { useLogout } from "./hooks/useLogout";

// Validation schemas + inferred types
export { loginSchema } from "./validation/login.schema";
export { signUpSchema } from "./validation/signUp.schema";
export type { LoginFormData } from "./validation/login.schema";
export type { SignUpFormData } from "./validation/signUp.schema";

// UI Components
export { default as LoginForm } from "./components/LoginForm";
export { default as SignUpForm } from "./components/SignUpForm";

// Types
export type {
  LoginRequest,
  RegisterRequest,
  AuthApiResponse,
  AuthState,
  LoginField,
  SignUpFieldConfig,
  FormFieldProps,
  PasswordInputProps,
} from "./types";

// Constants
export { AUTH_STORAGE_KEYS, AUTH_ERROR_MESSAGES } from "./constants";

// Mocks (development use)
export { authMock } from "./mocks/authMock";
export { LOGIN_FORM_FIELDS, SIGN_UP_FORM_FIELDS } from "./mocks/formFields";
