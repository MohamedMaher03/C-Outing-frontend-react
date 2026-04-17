import { renderHook, waitFor } from "@testing-library/react";
import { useModeratorDashboard } from "@/features/moderator/hooks/useModeratorDashboard";
import { moderatorService } from "@/features/moderator/services/moderatorService";

const mockT = (key: string) => key;

jest.mock("@/features/moderator/services/moderatorService", () => ({
  moderatorService: {
    getStats: jest.fn(),
    getRecentActions: jest.fn(),
  },
}));

jest.mock("@/components/i18n", () => ({
  useI18n: () => ({
    t: mockT,
  }),
}));

const mockedModeratorService = moderatorService as jest.Mocked<
  typeof moderatorService
>;

describe("useModeratorDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedModeratorService.getStats.mockResolvedValue({
      pendingReviews: 4,
      flaggedPlaces: 2,
      openReports: 3,
      resolvedToday: 1,
      resolvedThisWeek: 5,
      totalModerated: 42,
    });

    mockedModeratorService.getRecentActions.mockResolvedValue([
      {
        id: "a1",
        action: "removed",
        moderatorName: "Mod",
        itemType: "review",
        itemName: "Spam review",
        timestamp: new Date("2026-04-16T10:00:00.000Z"),
      },
    ] as never);
  });

  it("loads stats and recent actions", async () => {
    const { result } = renderHook(() => useModeratorDashboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats?.totalModerated).toBe(42);
    expect(result.current.actions).toHaveLength(1);
  });

  it("surfaces error and clears data when load fails", async () => {
    mockedModeratorService.getStats.mockRejectedValueOnce(
      new Error("dashboard down"),
    );

    const { result } = renderHook(() => useModeratorDashboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("dashboard down");
    expect(result.current.stats).toBeNull();
    expect(result.current.actions).toEqual([]);
  });
});
