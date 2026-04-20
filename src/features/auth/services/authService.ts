import { authApi } from "../api/authApi";
import { authMock } from "../mocks/authMock";
import { AUTH_STORAGE_KEYS } from "../constants";
import type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  ResendOtpRequest,
  AuthApiResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../types";
import type { User } from "@/types";
import { buildUserFromAuthToken } from "./jwtClaims";
import { AuthError } from "../errors";
import { selectDataSource } from "@/utils/dataSourceResolver";
import { normalizeEmail } from "@/utils/textNormalization";

const authDataSource = selectDataSource(
  import.meta.env.VITE_AUTH_USE_MOCKS,
  authMock,
  authApi,
);

const canUseStorage = (): boolean =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const getStorageItem = (key: string): string | null => {
  if (!canUseStorage()) return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStorageItem = (key: string, value: string): boolean => {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const removeStorageItem = (key: string): void => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    return;
  }
};

const REGISTER_TIMEOUT_MESSAGE_PATTERN =
  /(timeout|timed\s*out|exceeded|abort)/i;

const isRegisterTimeoutError = (error: AuthError): boolean =>
  error.code === "NETWORK_ERROR" &&
  REGISTER_TIMEOUT_MESSAGE_PATTERN.test(error.message);

const readPendingVerificationEmail = (): string | null => {
  const raw = getStorageItem(AUTH_STORAGE_KEYS.PENDING_VERIFICATION_EMAIL);
  if (!raw) return null;

  const email = normalizeEmail(raw);
  return email.length > 0 ? email : null;
};

const persistPendingVerificationEmail = (email: string): void => {
  const normalized = normalizeEmail(email);
  if (normalized.length === 0) {
    clearPendingVerificationEmailStorage();
    return;
  }

  setStorageItem(AUTH_STORAGE_KEYS.PENDING_VERIFICATION_EMAIL, normalized);
};

const clearPendingVerificationEmailStorage = (): void => {
  removeStorageItem(AUTH_STORAGE_KEYS.PENDING_VERIFICATION_EMAIL);
};

const isUserRole = (value: unknown): value is User["role"] =>
  value === "user" || value === "moderator" || value === "admin";

const isStoredUser = (value: unknown): value is User => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<User>;

  return (
    typeof candidate.userId === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.hasCompletedOnboarding === "boolean" &&
    isUserRole(candidate.role)
  );
};

const persistSession = (token: string, user: User): void => {
  const tokenStored = setStorageItem(AUTH_STORAGE_KEYS.TOKEN, token);
  const userStored = setStorageItem(
    AUTH_STORAGE_KEYS.USER,
    JSON.stringify(user),
  );

  if (!tokenStored || !userStored) {
    removeStorageItem(AUTH_STORAGE_KEYS.TOKEN);
    removeStorageItem(AUTH_STORAGE_KEYS.USER);
  }
};

const clearSession = (): void => {
  removeStorageItem(AUTH_STORAGE_KEYS.TOKEN);
  removeStorageItem(AUTH_STORAGE_KEYS.USER);
};

export const authService = {
  async login(payload: LoginRequest): Promise<AuthApiResponse> {
    const raw = await authDataSource.login(payload);
    const user: User = buildUserFromAuthToken(raw);
    persistSession(raw.token, user);
    clearPendingVerificationEmailStorage();
    return { token: raw.token, user };
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await authDataSource.register(payload);
      persistPendingVerificationEmail(payload.email);
      return response;
    } catch (error) {
      if (error instanceof AuthError) {
        const shouldRecover =
          error.code === "EMAIL_ALREADY_EXISTS" ||
          isRegisterTimeoutError(error);

        if (shouldRecover) {
          try {
            await authDataSource.resendOtp({ email: payload.email });
            persistPendingVerificationEmail(payload.email);
            return "Verification code sent to your email";
          } catch {
            void 0;
          }
        }
      }

      throw error;
    }
  },

  async verifyEmail(payload: VerifyEmailRequest): Promise<AuthApiResponse> {
    const raw = await authDataSource.verifyEmail(payload);
    const user: User = buildUserFromAuthToken(raw);
    persistSession(raw.token, user);
    clearPendingVerificationEmailStorage();
    return { token: raw.token, user };
  },

  async resendOtp(payload: ResendOtpRequest): Promise<void> {
    await authDataSource.resendOtp(payload);
  },

  async logout(): Promise<void> {
    try {
      await authDataSource.logout();
    } finally {
      clearSession();
      clearPendingVerificationEmailStorage();
    }
  },

  setPendingVerificationEmail(email: string): void {
    persistPendingVerificationEmail(email);
  },

  getPendingVerificationEmail(): string | null {
    return readPendingVerificationEmail();
  },

  clearPendingVerificationEmail(): void {
    clearPendingVerificationEmailStorage();
  },

  restoreSession(): { token: string; user: User } | null {
    const token = getStorageItem(AUTH_STORAGE_KEYS.TOKEN);
    const raw = getStorageItem(AUTH_STORAGE_KEYS.USER);

    if (!token || !raw) return null;

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!isStoredUser(parsed)) {
        clearSession();
        return null;
      }

      return { token, user: parsed };
    } catch {
      clearSession();
      return null;
    }
  },

  updateStoredUser(user: User): void {
    setStorageItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    await authDataSource.forgotPassword(payload);
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await authDataSource.resetPassword(payload);
  },
};
