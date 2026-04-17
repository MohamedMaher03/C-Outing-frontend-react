import { act, renderHook, waitFor } from "@testing-library/react";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import { submitOnboardingPreferences } from "@/features/onboarding/services/onboardingService";
import { useAuth } from "@/features/auth/context/AuthContext";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@/features/onboarding/services/onboardingService", () => ({
  submitOnboardingPreferences: jest.fn(),
}));

jest.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/components/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const mockedSubmitOnboardingPreferences =
  submitOnboardingPreferences as jest.MockedFunction<
    typeof submitOnboardingPreferences
  >;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("useOnboarding", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      user: { userId: "u1", hasCompletedOnboarding: false },
      updateUser: jest.fn(),
    } as never);

    mockedSubmitOnboardingPreferences.mockResolvedValue(undefined);
  });

  it("requires minimum selections before advancing", () => {
    const { result } = renderHook(() => useOnboarding());

    expect(result.current.canGoNext).toBe(false);

    act(() => {
      result.current.toggleInterest("cafes");
      result.current.toggleInterest("nightlife");
    });

    expect(result.current.canGoNext).toBe(true);

    act(() => {
      result.current.goToNextStep();
    });

    expect(result.current.step).toBe(1);
  });

  it("submits preferences and navigates home on successful completion", async () => {
    const updateUserMock = jest.fn();
    mockedUseAuth.mockReturnValue({
      user: { userId: "u1", hasCompletedOnboarding: false },
      updateUser: updateUserMock,
    } as never);

    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.toggleInterest("cafes");
      result.current.toggleInterest("nightlife");
      result.current.goToNextStep();
      result.current.goToNextStep();
      result.current.toggleDistrict("Maadi");
      result.current.goToNextStep();
      result.current.setBudget("mid_range");
    });

    await act(async () => {
      await result.current.handleComplete();
    });

    expect(mockedSubmitOnboardingPreferences).toHaveBeenCalledWith("u1", {
      interests: ["cafes", "nightlife"],
      vibe: 50,
      districts: ["Maadi"],
      budget: "mid_range",
    });
    expect(updateUserMock).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("sets a session error when no auth user is available", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      updateUser: jest.fn(),
    } as never);

    const { result } = renderHook(() => useOnboarding());

    await act(async () => {
      await result.current.handleComplete();
    });

    await waitFor(() => {
      expect(result.current.error).toBe("onboarding.error.sessionExpired");
    });
  });
});
