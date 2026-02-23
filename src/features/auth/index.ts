/**
 * Auth Feature — Public API
 */
export { AuthProvider, AuthContext, useAuth } from "./context/AuthContext";
export { authService } from "./services/authService";
export { useLogin } from "./hooks/useLogin";
export { useSignUp } from "./hooks/useSignUp";
export { loginSchema } from "./validation/login.schema";
export { signUpSchema } from "./validation/signUp.schema";
export type { LoginFormData } from "./validation/login.schema";
export type { SignUpFormData } from "./validation/signUp.schema";
export { default as LoginForm } from "./components/LoginForm";
export { default as SignUpForm } from "./components/SignUpForm";
export type {
  LoginField,
  SignUpFieldConfig,
  FormFieldProps,
  PasswordInputProps,
} from "./types";
export { LOGIN_FORM_FIELDS, SIGN_UP_FORM_FIELDS } from "./mocks";
