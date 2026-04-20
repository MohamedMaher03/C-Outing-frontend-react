import type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  ResendOtpRequest,
  AuthTokenApiData,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../types";
import type { User } from "@/types";
import { AuthError } from "../errors";

const MOCK_USER: User = {
  userId: "00000000-0000-0000-0000-000000000001",
  name: "maher Smith",
  email: "jane@example.com",
  hasCompletedOnboarding: true,
  role: "user",
};

const MOCK_ADMIN: User = {
  userId: "00000000-0000-0000-0000-000000000099",
  name: "Admin User",
  email: "admin@example.com",
  hasCompletedOnboarding: true,
  role: "admin",
};

const MOCK_MODERATOR: User = {
  userId: "00000000-0000-0000-0000-000000000050",
  name: "Moderator User",
  email: "mod@example.com",
  hasCompletedOnboarding: true,
  role: "moderator",
};

const encodeBase64Url = (value: string): string =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const createMockToken = (user: User): string => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier":
      user.userId,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress":
      user.email,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": user.name,
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": user.role,
    exp: now + 60 * 60,
    iat: now,
  };

  return [
    encodeBase64Url(JSON.stringify(header)),
    encodeBase64Url(JSON.stringify(payload)),
    "mock_signature",
  ].join(".");
};

const MOCK_OTP = "123456";

const pendingVerifications = new Map<string, User>();

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const authMock = {
  async login(payload: LoginRequest): Promise<AuthTokenApiData> {
    await delay(900);

    if (payload.password === "wrongpass") {
      throw new AuthError("INVALID_CREDENTIALS");
    }

    if (pendingVerifications.has(payload.email)) {
      throw new AuthError(
        "EMAIL_NOT_VERIFIED",
        "Your email is not verified yet. Verify your account to continue.",
      );
    }

    let mockUser: User;
    if (payload.email === "admin@example.com") {
      mockUser = { ...MOCK_ADMIN, email: payload.email };
    } else if (payload.email === "mod@example.com") {
      mockUser = { ...MOCK_MODERATOR, email: payload.email };
    } else {
      mockUser = { ...MOCK_USER, email: payload.email };
    }

    return {
      token: createMockToken(mockUser),
      hasCompletedOnboarding: mockUser.hasCompletedOnboarding,
    };
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    await delay(1100);

    if (payload.email === "exists@example.com") {
      throw new AuthError("EMAIL_ALREADY_EXISTS");
    }

    if (payload.phoneNumber === "0000000000") {
      throw new AuthError("PHONE_ALREADY_EXISTS");
    }

    const newUser: User = {
      ...MOCK_USER,
      userId: `mock-${Math.floor(Math.random() * 9000) + 100}`,
      name: payload.name,
      email: payload.email,
      hasCompletedOnboarding: false,
      role: "user",
    };

    pendingVerifications.set(payload.email, newUser);

    return "OTP sent to your email";
  },

  async verifyEmail(payload: VerifyEmailRequest): Promise<AuthTokenApiData> {
    await delay(900);

    if (payload.otp !== MOCK_OTP) {
      throw new AuthError("INVALID_OTP");
    }

    let user = pendingVerifications.get(payload.email);
    if (!user) {
      user = {
        ...MOCK_USER,
        email: payload.email,
        hasCompletedOnboarding: false,
      };
    }
    pendingVerifications.delete(payload.email);

    return {
      token: createMockToken(user),
      hasCompletedOnboarding: user.hasCompletedOnboarding,
    };
  },

  async resendOtp(_payload: ResendOtpRequest): Promise<void> {
    await delay(800);
    if (_payload.email === "unregistered@example.com") {
      throw new AuthError("EMAIL_NOT_FOUND");
    }
  },

  async logout(): Promise<void> {
    await delay(300);
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    await delay(900);
    if (payload.email === "unknown@example.com") {
      throw new AuthError("EMAIL_NOT_FOUND");
    }
    pendingVerifications.set(payload.email, {
      ...MOCK_USER,
      email: payload.email,
    });
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await delay(900);
    if (payload.otp !== MOCK_OTP) {
      throw new AuthError("INVALID_RESET_OTP");
    }
    pendingVerifications.delete(payload.email);
  },
};
