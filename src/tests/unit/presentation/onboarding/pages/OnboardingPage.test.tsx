import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import OnboardingPage from "@/features/onboarding/pages/OnboardingPage";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";

jest.mock("@/features/onboarding/hooks/useOnboarding", () => ({
  useOnboarding: jest.fn(),
}));

jest.mock("@/components/layout/AuthShell", () => ({
  AuthShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AuthSurface: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    formatNumber: (value: number) => String(value),
  }),
}));

jest.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    section: ({ children, ...props }: React.ComponentProps<"section">) => (
      <section {...props}>{children}</section>
    ),
  },
  useReducedMotion: () => false,
}));

const mockedUseOnboarding = useOnboarding as jest.MockedFunction<
  typeof useOnboarding
>;

const baseHookState = {
  step: 0,
  selectedInterests: ["cafes", "nightlife"],
  vibe: [50],
  selectedDistricts: ["Maadi"],
  budget: "mid_range",
  isSubmitting: false,
  error: null,
  canGoNext: true,
  toggleInterest: jest.fn(),
  setVibe: jest.fn(),
  toggleDistrict: jest.fn(),
  setBudget: jest.fn(),
  goToNextStep: jest.fn(),
  goToPreviousStep: jest.fn(),
  handleComplete: jest.fn().mockResolvedValue(undefined),
};

describe("OnboardingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseOnboarding.mockReturnValue(baseHookState as never);
  });

  it("goes to next step when next action is clicked", () => {
    render(<OnboardingPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "onboarding.action.next" }),
    );

    expect(baseHookState.goToNextStep).toHaveBeenCalledTimes(1);
  });

  it("retries completion from error banner on final step", () => {
    mockedUseOnboarding.mockReturnValue({
      ...baseHookState,
      step: 3,
      error: "submit failed",
    } as never);

    render(<OnboardingPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "onboarding.action.retry" }),
    );

    expect(baseHookState.handleComplete).toHaveBeenCalledTimes(1);
  });
});
