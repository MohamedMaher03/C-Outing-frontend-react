import { authService } from "./authService";
import { authApi } from "../api/authApi";
import type { AuthTokenApiData } from "../types";
import type { User } from "@/types";

jest.mock("../api/authApi", () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerificationOtp: jest.fn(),
    resendResetPasswordOtp: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

jest.mock("../mocks/authMock", () => ({
  authMock: {
    login: jest.fn(),
    register: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerificationOtp: jest.fn(),
    resendResetPasswordOtp: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

jest.mock("@/utils/dataSourceResolver", () => ({
  selectDataSource: jest.fn(() => jest.requireMock("../api/authApi").authApi),
}));

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

const userFixture: User = {
  userId: "user-1",
  name: "Demo User",
  email: "demo@example.com",
  role: "user",
  hasCompletedOnboarding: true,
};

const encodeBase64Url = (value: string): string =>
  btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const createMockToken = (user: User): string => {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier":
      user.userId,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress":
      user.email,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": user.name,
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    iat: Math.floor(Date.now() / 1000),
  };

  return [
    encodeBase64Url(JSON.stringify(header)),
    encodeBase64Url(JSON.stringify(payload)),
    "mock_signature",
  ].join(".");
};

const mockToken = createMockToken(userFixture);

describe("authService session persistence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();

    mockedAuthApi.login.mockResolvedValue({
      token: mockToken,
      hasCompletedOnboarding: true,
    } satisfies AuthTokenApiData);
    mockedAuthApi.logout.mockResolvedValue(undefined);
  });

  it("stores a persistent session in localStorage when staySignedIn is true", async () => {
    await authService.login({
      email: "demo@example.com",
      password: "Pass1234",
      staySignedIn: true,
    });

    expect(window.localStorage.getItem("authToken")).toBe(mockToken);
    expect(window.sessionStorage.getItem("authToken")).toBeNull();
  });

  it("stores a temporary session in sessionStorage when staySignedIn is false", async () => {
    await authService.login({
      email: "demo@example.com",
      password: "Pass1234",
      staySignedIn: false,
    });

    expect(window.sessionStorage.getItem("authToken")).toBe(mockToken);
    expect(window.localStorage.getItem("authToken")).toBeNull();
  });

  it("restores a temporary session from sessionStorage", () => {
    window.sessionStorage.setItem("authToken", "session-token");
    window.sessionStorage.setItem("authUser", JSON.stringify(userFixture));

    expect(authService.restoreSession()).toEqual({
      token: "session-token",
      user: userFixture,
    });
  });

  it("clears both storage scopes on logout", async () => {
    window.localStorage.setItem("authToken", "local-token");
    window.localStorage.setItem("authUser", JSON.stringify(userFixture));
    window.sessionStorage.setItem("authToken", "session-token");
    window.sessionStorage.setItem("authUser", JSON.stringify(userFixture));

    await authService.logout();

    expect(mockedAuthApi.logout).toHaveBeenCalled();
    expect(window.localStorage.getItem("authToken")).toBeNull();
    expect(window.sessionStorage.getItem("authToken")).toBeNull();
    expect(window.localStorage.getItem("authUser")).toBeNull();
    expect(window.sessionStorage.getItem("authUser")).toBeNull();
  });
});
