import { moderatorService } from "@/features/moderator/services/moderatorService";
import { moderatorDataSource } from "@/features/moderator/services/moderatorDataSource";
import { adminService } from "@/features/admin/services/adminService";

jest.mock("@/features/moderator/services/moderatorDataSource", () => ({
  moderatorDataSource: {
    getStats: jest.fn(),
    getReportedContent: jest.fn(),
    updateReportStatus: jest.fn(),
    getRecentActions: jest.fn(),
    deleteReview: jest.fn(),
    warnUser: jest.fn(),
    banUser: jest.fn(),
  },
}));

jest.mock("@/features/admin/services/adminService", () => ({
  adminService: {
    getPlaces: jest.fn(),
    getCategories: jest.fn(),
    updatePlaceStatus: jest.fn(),
    deletePlace: jest.fn(),
    addPlace: jest.fn(),
    getReviews: jest.fn(),
    updateReviewStatus: jest.fn(),
  },
}));

const mockedModeratorDataSource = moderatorDataSource as jest.Mocked<
  typeof moderatorDataSource
>;
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

describe("moderatorService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates place retrieval to admin service", async () => {
    mockedAdminService.getPlaces.mockResolvedValue([
      {
        id: "p1",
        name: "Nile Spot",
        category: "Cafe",
        district: "Maadi",
        rating: 4.2,
        reviewCount: 10,
        status: "active",
        createdAt: new Date("2026-01-01"),
        image: "img.png",
      },
    ] as never);

    const places = await moderatorService.getPlaces();

    expect(places).toHaveLength(1);
    expect(mockedAdminService.getPlaces).toHaveBeenCalledTimes(1);
  });

  it("reads stats from moderator datasource", async () => {
    mockedModeratorDataSource.getStats.mockResolvedValue({
      pendingReviews: 4,
      flaggedPlaces: 2,
      openReports: 3,
      resolvedToday: 1,
      resolvedThisWeek: 5,
      totalModerated: 99,
    });

    const stats = await moderatorService.getStats();

    expect(stats.totalModerated).toBe(99);
  });

  it("wraps non-ApiError failures with fallback message", async () => {
    mockedModeratorDataSource.getRecentActions.mockRejectedValueOnce(
      new Error("service unavailable"),
    );

    await expect(moderatorService.getRecentActions()).rejects.toThrow(
      "Failed to load recent actions. service unavailable",
    );
  });
});
