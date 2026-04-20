export { AuthContext, useAuth } from "./context/AuthContext";
export type { AuthContextType } from "./context/AuthContext";

export { AuthProvider } from "./context/AuthProvider";
export type { AuthProviderProps } from "./context/AuthProvider";

export { authService } from "./services/authService";

export { authApi } from "./api/authApi";

export { useLogin } from "./hooks/useLogin";
export { useSignUp } from "./hooks/useSignUp";
export { useLogout } from "./hooks/useLogout";
export { useVerifyEmail } from "./hooks/useVerifyEmail";
export { useForgotPassword } from "./hooks/useForgotPassword";
export { useResetPassword } from "./hooks/useResetPassword";

export { loginSchema } from "./validation/login.schema";
export { signUpSchema } from "./validation/signUp.schema";
export { verifyEmailSchema } from "./validation/verifyEmail.schema";
export { forgotPasswordSchema } from "./validation/forgotPassword.schema";
export { resetPasswordSchema } from "./validation/resetPassword.schema";
export type { LoginFormData } from "./validation/login.schema";
export type { SignUpFormData } from "./validation/signUp.schema";
export type { VerifyEmailFormData } from "./validation/verifyEmail.schema";
export type { ForgotPasswordFormData } from "./validation/forgotPassword.schema";
export type { ResetPasswordFormData } from "./validation/resetPassword.schema";

export { default as LoginForm } from "./components/LoginForm";
export { default as SignUpForm } from "./components/SignUpForm";
export { default as VerifyEmailPage } from "./pages/VerifyEmailPage";
export { default as ForgotPasswordPage } from "./pages/ForgotPasswordPage";
export { default as ResetPasswordPage } from "./pages/ResetPasswordPage";

export type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  AuthTokenApiData,
  VerifyEmailRequest,
  VerifyEmailOtpResponse,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthApiResponse,
  AuthState,
  LoginField,
  SignUpFieldConfig,
  FormFieldProps,
  PasswordInputProps,
} from "./types";

export { AUTH_STORAGE_KEYS, AUTH_ERROR_MESSAGES } from "./constants";

export { AuthError, normalizeAuthError } from "./errors";
export type { AuthErrorCode } from "./errors";

export { authMock } from "./mocks/authMock";
export { LOGIN_FORM_FIELDS, SIGN_UP_FORM_FIELDS } from "./mocks/formFields";
