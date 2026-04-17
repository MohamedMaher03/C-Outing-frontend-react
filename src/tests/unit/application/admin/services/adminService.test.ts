import { ApiError } from "@/utils/apiError";
import { adminService } from "@/features/admin/services/adminService";
import { adminDataSource } from "@/features/admin/services/adminDataSource";

jest.mock("@/features/admin/services/adminDataSource", () => ({
  adminDataSource: {
    getStats: jest.fn(),
    getRecentActivity: jest.fn(),
    getUsers: jest.fn(),
    updateUserStatus: jest.fn(),
    getPlaces: jest.fn(),
    addPlace: jest.fn(),
    updatePlaceStatus: jest.fn(),
    deletePlace: jest.fn(),
    getReviews: jest.fn(),
    updateReviewStatus: jest.fn(),
    deleteReview: jest.fn(),
    getCategories: jest.fn(),
    updateCategory: jest.fn(),
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
  },
}));

const mockedAdminDataSource = adminDataSource as jest.Mocked<
  typeof adminDataSource
>;

describe("adminService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns users page from datasource", async () => {
    mockedAdminDataSource.getUsers.mockResolvedValue({
      items: [
        {
          userId: "u1",
          name: "Alice",
          email: "alice@example.com",
          role: "user",
          status: "active",
          joinedDate: new Date("2026-01-01"),
          lastActive: new Date("2026-01-02"),
          reviewCount: 3,
        },
      ],
      pageIndex: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });

    const response = await adminService.getUsers({ page: 1, count: 10 });

    expect(response.items).toHaveLength(1);
    expect(mockedAdminDataSource.getUsers).toHaveBeenCalledWith({
      page: 1,
      count: 10,
    });
  });

  it("wraps unknown datasource failures with fallback message", async () => {
    mockedAdminDataSource.getUsers.mockRejectedValueOnce(
      new Error("network unavailable"),
    );

    await expect(adminService.getUsers()).rejects.toThrow(
      "Failed to load users. network unavailable",
    );
  });

  it("preserves ApiError from datasource", async () => {
    const apiError = new ApiError("Forbidden", 403);
    mockedAdminDataSource.updateUserStatus.mockRejectedValueOnce(apiError);

    await expect(adminService.updateUserStatus("u1", "banned")).rejects.toBe(
      apiError,
    );
  });
});
