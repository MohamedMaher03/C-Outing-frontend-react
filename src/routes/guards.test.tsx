import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { ProtectedRoute, PublicRoute, OnboardingRoute } from "./index";
import { RoleBasedRoute } from "./RoleBasedRoute";
import { AuthContext, type AuthContextType } from "@/features/auth/context/AuthContext";
import type { User } from "@/types";

jest.mock("@/components/ui/LoadingSpinner", () => ({
  PageLoading: () => <div data-testid="page-loading">loading</div>,
}));

const baseUser: User = {
  userId: "1",
  name: "Test User",
  email: "test@example.com",
  role: "user",
  hasCompletedOnboarding: true,
};

const createAuthValue = (
  overrides: Partial<AuthContextType> = {},
): AuthContextType => ({
  user: null,
  token: null,
  pendingVerificationEmail: null,
  isLoading: false,
  isAuthenticated: false,
  login: jest.fn(async () => undefined),
  register: jest.fn(async () => undefined),
  verifyEmail: jest.fn(async () => undefined),
  resendOtp: jest.fn(async () => undefined),
  setPendingVerificationEmail: jest.fn(),
  clearPendingVerificationEmail: jest.fn(),
  logout: jest.fn(async () => undefined),
  updateUser: jest.fn(),
  ...overrides,
});

const renderGuard = ({
  initialPath,
  routePath,
  element,
  authOverrides,
}: {
  initialPath: string;
  routePath: string;
  element: ReactNode;
  authOverrides?: Partial<AuthContextType>;
}) => {
  const authValue = createAuthValue(authOverrides);

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path={routePath} element={<>{element}</>} />
          <Route path="/" element={<div>home-screen</div>} />
          <Route path="/login" element={<div>login-screen</div>} />
          <Route path="/onboarding" element={<div>onboarding-screen</div>} />
          <Route path="/admin" element={<div>admin-screen</div>} />
          <Route path="/moderator" element={<div>moderator-screen</div>} />
          <Route path="/not-found" element={<div>not-found-screen</div>} />
          <Route path="*" element={<div>fallback-screen</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
};

describe("route guards", () => {
  it("shows loading state while auth state is loading", () => {
    renderGuard({
      initialPath: "/protected",
      routePath: "/protected",
      element: (
        <ProtectedRoute>
          <div>protected-content</div>
        </ProtectedRoute>
      ),
      authOverrides: { isLoading: true },
    });

    expect(screen.getByTestId("page-loading")).toBeInTheDocument();
  });

  it("redirects unauthenticated users from protected routes to login", () => {
    renderGuard({
      initialPath: "/protected",
      routePath: "/protected",
      element: (
        <ProtectedRoute>
          <div>protected-content</div>
        </ProtectedRoute>
      ),
      authOverrides: { user: null },
    });

    expect(screen.getByText("login-screen")).toBeInTheDocument();
  });

  it("redirects incomplete user onboarding to onboarding route", () => {
    renderGuard({
      initialPath: "/protected",
      routePath: "/protected",
      element: (
        <ProtectedRoute>
          <div>protected-content</div>
        </ProtectedRoute>
      ),
      authOverrides: {
        user: {
          ...baseUser,
          role: "user",
          hasCompletedOnboarding: false,
        },
      },
    });

    expect(screen.getByText("onboarding-screen")).toBeInTheDocument();
  });

  it("allows admin users through protected routes even if onboarding flag is false", () => {
    renderGuard({
      initialPath: "/protected",
      routePath: "/protected",
      element: (
        <ProtectedRoute>
          <div>protected-content</div>
        </ProtectedRoute>
      ),
      authOverrides: {
        user: {
          ...baseUser,
          role: "admin",
          hasCompletedOnboarding: false,
        },
      },
    });

    expect(screen.getByText("protected-content")).toBeInTheDocument();
  });

  it("redirects authenticated users away from public route based on role", () => {
    renderGuard({
      initialPath: "/public",
      routePath: "/public",
      element: (
        <PublicRoute>
          <div>public-content</div>
        </PublicRoute>
      ),
      authOverrides: {
        user: {
          ...baseUser,
          role: "moderator",
        },
      },
    });

    expect(screen.getByText("moderator-screen")).toBeInTheDocument();
  });

  it("allows unauthenticated users on public route", () => {
    renderGuard({
      initialPath: "/public",
      routePath: "/public",
      element: (
        <PublicRoute>
          <div>public-content</div>
        </PublicRoute>
      ),
      authOverrides: { user: null },
    });

    expect(screen.getByText("public-content")).toBeInTheDocument();
  });

  it("onboarding route rejects non-user roles", () => {
    renderGuard({
      initialPath: "/onboard-check",
      routePath: "/onboard-check",
      element: (
        <OnboardingRoute>
          <div>onboarding-content</div>
        </OnboardingRoute>
      ),
      authOverrides: {
        user: {
          ...baseUser,
          role: "admin",
          hasCompletedOnboarding: false,
        },
      },
    });

    expect(screen.getByText("not-found-screen")).toBeInTheDocument();
  });

  it("onboarding route allows user role with incomplete onboarding", () => {
    renderGuard({
      initialPath: "/onboard-check",
      routePath: "/onboard-check",
      element: (
        <OnboardingRoute>
          <div>onboarding-content</div>
        </OnboardingRoute>
      ),
      authOverrides: {
        user: {
          ...baseUser,
          hasCompletedOnboarding: false,
        },
      },
    });

    expect(screen.getByText("onboarding-content")).toBeInTheDocument();
  });

  it("role-based route redirects unauthorized roles to provided path", () => {
    renderGuard({
      initialPath: "/admin-only",
      routePath: "/admin-only",
      element: (
        <RoleBasedRoute allowedRoles={["admin"]} redirectTo="/not-found">
          <div>admin-only-content</div>
        </RoleBasedRoute>
      ),
      authOverrides: {
        user: {
          ...baseUser,
          role: "user",
        },
      },
    });

    expect(screen.getByText("not-found-screen")).toBeInTheDocument();
  });

  it("role-based route allows authorized role", () => {
    renderGuard({
      initialPath: "/admin-only",
      routePath: "/admin-only",
      element: (
        <RoleBasedRoute allowedRoles={["admin"]}>
          <div>admin-only-content</div>
        </RoleBasedRoute>
      ),
      authOverrides: {
        user: {
          ...baseUser,
          role: "admin",
        },
      },
    });

    expect(screen.getByText("admin-only-content")).toBeInTheDocument();
  });
});
