import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import { useProfile } from "@/features/profile/hooks/useProfile";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@/features/profile/hooks/useProfile", () => ({
  useProfile: jest.fn(),
}));

jest.mock("@/components/theme/ThemeToggle", () => ({
  ThemeToggle: () => <div>theme-toggle</div>,
}));

jest.mock("@/components/ui/LoadingSpinner", () => ({
  __esModule: true,
  default: ({ text }: { text?: string }) => <div>{text ?? "loading"}</div>,
}));

jest.mock("@/components/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    formatNumber: (value: number) => String(value),
    direction: "ltr",
  }),
}));

const mockedUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;

const baseHookState = {
  profile: {
    id: "u1",
    name: "Maher",
    email: "maher@example.com",
    bio: "Bio",
    phoneNumber: "0123",
    birthDate: "2000-01-01",
    age: 24,
    role: 0,
    totalInteractions: 10,
    isBanned: false,
    isEmailVerified: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
  loading: false,
  saving: false,
  error: null,
  selectedInterests: ["cafes"],
  vibe: [50],
  selectedDistricts: ["Maadi"],
  selectedBudget: "mid_range",
  toggleInterest: jest.fn(),
  setVibe: jest.fn(),
  toggleDistrict: jest.fn(),
  setSelectedBudget: jest.fn(),
  savePreferences: jest.fn().mockResolvedValue(undefined),
  handleSignOut: jest.fn().mockResolvedValue(undefined),
  refreshProfile: jest.fn().mockResolvedValue(undefined),
};

describe("ProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseProfile.mockReturnValue(baseHookState as never);
  });

  it("renders loading spinner while profile data is pending", () => {
    mockedUseProfile.mockReturnValue({
      ...baseHookState,
      loading: true,
    } as never);

    render(<ProfilePage />);

    expect(screen.getByText("profile.loading")).toBeInTheDocument();
  });

  it("renders error fallback and retries profile load", () => {
    mockedUseProfile.mockReturnValue({
      ...baseHookState,
      profile: null,
      error: "failed",
    } as never);

    render(<ProfilePage />);

    fireEvent.click(screen.getByRole("button", { name: "common.retry" }));

    expect(baseHookState.refreshProfile).toHaveBeenCalledTimes(1);
  });

  it("saves preferences and signs out from account tab", async () => {
    render(<ProfilePage />);

    fireEvent.click(
      screen.getAllByRole("button", { name: "profile.preferences.save" })[0],
    );
    expect(baseHookState.savePreferences).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("tab", { name: "profile.tab.account" }));
    fireEvent.click(
      screen.getAllByRole("button", { name: "profile.account.signOut" })[0],
    );

    await waitFor(() => {
      expect(baseHookState.handleSignOut).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
