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

const getStorageItem = (storage: Storage, key: string): string | null => {
  if (!canUseStorage()) return null;

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const setStorageItem = (
  storage: Storage,
  key: string,
  value: string,
): boolean => {
  if (!canUseStorage()) return false;

  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const removeStorageItem = (storage: Storage, key: string): void => {
  if (!canUseStorage()) return;

  try {
    storage.removeItem(key);
  } catch {
    return;
  }
};

const getLocalStorage = (): Storage | null => {
  if (!canUseStorage()) return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const getSessionStorage = (): Storage | null => {
  if (!canUseStorage()) return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const REGISTER_TIMEOUT_MESSAGE_PATTERN =
  /(timeout|timed\s*out|exceeded|abort)/i;

const isRegisterTimeoutError = (error: AuthError): boolean =>
  error.code === "NETWORK_ERROR" &&
  REGISTER_TIMEOUT_MESSAGE_PATTERN.test(error.message);

const readPendingVerificationEmail = (): string | null => {
  const storage = getLocalStorage();
  if (!storage) return null;

  const raw = getStorageItem(
    storage,
    AUTH_STORAGE_KEYS.PENDING_VERIFICATION_EMAIL,
  );
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

  const storage = getLocalStorage();
  if (!storage) return;

  setStorageItem(
    storage,
    AUTH_STORAGE_KEYS.PENDING_VERIFICATION_EMAIL,
    normalized,
  );
};

const clearPendingVerificationEmailStorage = (): void => {
  const storage = getLocalStorage();
  if (!storage) return;

  removeStorageItem(storage, AUTH_STORAGE_KEYS.PENDING_VERIFICATION_EMAIL);
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

const clearStorageSession = (storage: Storage | null): void => {
  if (!storage) return;

  removeStorageItem(storage, AUTH_STORAGE_KEYS.TOKEN);
  removeStorageItem(storage, AUTH_STORAGE_KEYS.USER);
};

const persistSession = (
  token: string,
  user: User,
  staySignedIn: boolean,
): void => {
  const primaryStorage = staySignedIn ? getLocalStorage() : getSessionStorage();
  const secondaryStorage = staySignedIn
    ? getSessionStorage()
    : getLocalStorage();

  if (!primaryStorage) {
    clearSession();
    return;
  }

  const tokenStored = setStorageItem(
    primaryStorage,
    AUTH_STORAGE_KEYS.TOKEN,
    token,
  );
  const userStored = setStorageItem(
    primaryStorage,
    AUTH_STORAGE_KEYS.USER,
    JSON.stringify(user),
  );

  if (!tokenStored || !userStored) {
    clearSession();
    return;
  }

  clearStorageSession(secondaryStorage);
};

const readSessionFromStorage = (
  storage: Storage | null,
): { token: string; user: User } | null => {
  if (!storage) return null;

  const token = getStorageItem(storage, AUTH_STORAGE_KEYS.TOKEN);
  const raw = getStorageItem(storage, AUTH_STORAGE_KEYS.USER);

  if (!token || !raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isStoredUser(parsed)) {
      clearStorageSession(storage);
      return null;
    }

    return { token, user: parsed };
  } catch {
    clearStorageSession(storage);
    return null;
  }
};

const clearSession = (): void => {
  clearStorageSession(getLocalStorage());
  clearStorageSession(getSessionStorage());
};

export const authService = {
  async login(payload: LoginRequest): Promise<AuthApiResponse> {
    const raw = await authDataSource.login(payload);
    const user: User = buildUserFromAuthToken(raw);
    persistSession(raw.token, user, payload.staySignedIn);
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
            await authDataSource.resendVerificationOtp({
              email: payload.email,
            });
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
    persistSession(raw.token, user, true);
    clearPendingVerificationEmailStorage();
    return { token: raw.token, user };
  },

  async resendVerificationOtp(payload: ResendOtpRequest): Promise<void> {
    await authDataSource.resendVerificationOtp(payload);
  },

  async resendResetPasswordOtp(payload: ResendOtpRequest): Promise<void> {
    await authDataSource.resendResetPasswordOtp(payload);
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
    return (
      readSessionFromStorage(getLocalStorage()) ??
      readSessionFromStorage(getSessionStorage())
    );
  },

  updateStoredUser(user: User): void {
    const local = getLocalStorage();
    const session = getSessionStorage();

    const activeStorage =
      local && getStorageItem(local, AUTH_STORAGE_KEYS.TOKEN)
        ? local
        : session && getStorageItem(session, AUTH_STORAGE_KEYS.TOKEN)
          ? session
          : null;

    if (!activeStorage) return;
    setStorageItem(activeStorage, AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  },

  promoteSessionForNewTab(): void {
    const session = getSessionStorage();
    if (!session) return;

    const token = getStorageItem(session, AUTH_STORAGE_KEYS.TOKEN);
    const userRaw = getStorageItem(session, AUTH_STORAGE_KEYS.USER);

    // Only promote if session lives in sessionStorage (not already in localStorage)
    const local = getLocalStorage();
    if (!token || !userRaw || !local) return;
    if (getStorageItem(local, AUTH_STORAGE_KEYS.TOKEN)) return; // already in localStorage

    setStorageItem(local, AUTH_STORAGE_KEYS.TOKEN, token);
    setStorageItem(local, AUTH_STORAGE_KEYS.USER, userRaw);
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    await authDataSource.forgotPassword(payload);
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await authDataSource.resetPassword(payload);
  },
};
