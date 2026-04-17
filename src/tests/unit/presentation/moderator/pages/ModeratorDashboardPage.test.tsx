import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ModeratorDashboardPage from "../../../../../features/moderator/pages/ModeratorDashboardPage";
import { useModeratorDashboard } from "../../../../../features/moderator/hooks/useModeratorDashboard";

jest.mock("@/features/moderator/hooks/useModeratorDashboard", () => ({
  useModeratorDashboard: jest.fn(),
}));

jest.mock("@/components/ui/LoadingSpinner", () => ({
  __esModule: true,
  default: ({ text }: { text?: string }) => <div>{text ?? "loading"}</div>,
}));

jest.mock("@/components/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "en-US",
  }),
}));

const mockedUseModeratorDashboard =
  useModeratorDashboard as jest.MockedFunction<typeof useModeratorDashboard>;

const baseHookState = {
  stats: {
    pendingReviews: 4,
    flaggedPlaces: 2,
    openReports: 3,
    resolvedToday: 1,
    resolvedThisWeek: 5,
    totalModerated: 42,
  },
  actions: [
    {
      id: "a1",
      action: "removed",
      moderatorName: "Mod",
      itemType: "review",
      itemName: "Spam review",
      timestamp: new Date("2026-04-16T10:00:00.000Z"),
    },
  ],
  loading: false,
  error: null,
  retry: jest.fn().mockResolvedValue(undefined),
};

describe("ModeratorDashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseModeratorDashboard.mockReturnValue(baseHookState as never);
  });

  it("renders loading state", () => {
    mockedUseModeratorDashboard.mockReturnValue({
      ...baseHookState,
      loading: true,
    } as never);

    render(
      <MemoryRouter>
        <ModeratorDashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("moderator.dashboard.loading")).toBeInTheDocument();
  });

  it("shows unavailable state and retries when stats are missing", () => {
    mockedUseModeratorDashboard.mockReturnValue({
      ...baseHookState,
      stats: null,
      error: "down",
    } as never);

    render(
      <MemoryRouter>
        <ModeratorDashboardPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "common.retry" }));

    expect(
      screen.getByText("moderator.dashboard.unavailableTitle"),
    ).toBeInTheDocument();
    expect(baseHookState.retry).toHaveBeenCalledTimes(1);
  });

  it("renders dashboard stats and recent actions", () => {
    render(
      <MemoryRouter>
        <ModeratorDashboardPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("moderator.dashboard.section.quickNavigation.title"),
    ).toBeInTheDocument();
    expect(screen.getByText("Spam review")).toBeInTheDocument();
  });
});
