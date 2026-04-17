import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./AuthContext";
import { authService } from "../services/authService";
import type { User } from "@/types";

jest.mock("../services/authService", () => ({
  authService: {
    restoreSession: jest.fn(),
    getPendingVerificationEmail: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    verifyEmail: jest.fn(),
    resendOtp: jest.fn(),
    setPendingVerificationEmail: jest.fn(),
    clearPendingVerificationEmail: jest.fn(),
    logout: jest.fn(),
    updateStoredUser: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;

const userFixture: User = {
  userId: "1",
  name: "Demo User",
  email: "demo@example.com",
  role: "user",
  hasCompletedOnboarding: true,
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedAuthService.restoreSession.mockReturnValue(null);
    mockedAuthService.getPendingVerificationEmail.mockReturnValue(null);
    mockedAuthService.login.mockResolvedValue({
      token: "token-login",
      user: userFixture,
    });
    mockedAuthService.register.mockResolvedValue(
      "Verification code sent to your email",
    );
    mockedAuthService.verifyEmail.mockResolvedValue({
      token: "token-verify",
      user: userFixture,
    });
    mockedAuthService.resendOtp.mockResolvedValue(undefined);
    mockedAuthService.logout.mockResolvedValue(undefined);
  });

  it("restores session and pending verification email on mount", async () => {
    mockedAuthService.restoreSession.mockReturnValue({
      token: "persisted-token",
      user: userFixture,
    });
    mockedAuthService.getPendingVerificationEmail.mockReturnValue(
      "pending@example.com",
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(userFixture);
    expect(result.current.token).toBe("persisted-token");
    expect(result.current.pendingVerificationEmail).toBe("pending@example.com");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("updates auth state after login and clears pending verification", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login("demo@example.com", "Pass1234");
    });

    expect(mockedAuthService.login).toHaveBeenCalledWith({
      email: "demo@example.com",
      password: "Pass1234",
    });
    expect(result.current.token).toBe("token-login");
    expect(result.current.user).toEqual(userFixture);
    expect(result.current.pendingVerificationEmail).toBeNull();
  });

  it("sets and clears pending verification email through context actions", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setPendingVerificationEmail("  TEST@Example.com ");
    });

    expect(mockedAuthService.setPendingVerificationEmail).toHaveBeenCalledWith(
      "test@example.com",
    );
    expect(result.current.pendingVerificationEmail).toBe("test@example.com");

    act(() => {
      result.current.clearPendingVerificationEmail();
    });

    expect(mockedAuthService.clearPendingVerificationEmail).toHaveBeenCalled();
    expect(result.current.pendingVerificationEmail).toBeNull();
  });

  it("register and resend flows normalize and store pending email", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register({
        name: "User Name",
        email: "Register@Test.com",
        password: "Pass1234",
        phoneNumber: "+201234567890",
        dateOfBirth: "2000-01-01",
      });
    });

    expect(result.current.pendingVerificationEmail).toBe("register@test.com");

    await act(async () => {
      await result.current.resendOtp(" RESEND@EXAMPLE.COM ");
    });

    expect(mockedAuthService.resendOtp).toHaveBeenCalledWith({
      email: " RESEND@EXAMPLE.COM ",
    });
    expect(result.current.pendingVerificationEmail).toBe("resend@example.com");
  });

  it("verify, updateUser, and logout keep state and storage in sync", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.verifyEmail("demo@example.com", "123456");
    });

    expect(result.current.token).toBe("token-verify");
    expect(result.current.user).toEqual(userFixture);

    const updatedUser: User = {
      ...userFixture,
      name: "Updated Name",
    };

    act(() => {
      result.current.updateUser(updatedUser);
    });

    expect(mockedAuthService.updateStoredUser).toHaveBeenCalledWith(updatedUser);
    expect(result.current.user).toEqual(updatedUser);

    await act(async () => {
      await result.current.logout();
    });

    expect(mockedAuthService.logout).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.pendingVerificationEmail).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
