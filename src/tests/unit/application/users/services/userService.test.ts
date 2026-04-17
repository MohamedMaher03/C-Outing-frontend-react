import { ApiError } from "@/utils/apiError";
import {
  clearPublicProfileBundleCache,
  getPublicProfileBundle,
} from "@/features/users/services/userService";
import { usersDataSource } from "@/features/users/services/userDataSource";

jest.mock("@/features/users/services/userDataSource", () => ({
  usersDataSource: {
    getCurrentProfile: jest.fn(),
    getPublicProfile: jest.fn(),
    getUserReviews: jest.fn(),
  },
}));

const mockedDataSource = usersDataSource as jest.Mocked<typeof usersDataSource>;

const reviewsPageFixture = {
  items: [
    {
      id: "r1",
      venueId: "v1",
      venueName: "Venue",
      userId: "u1",
      userName: "Reviewer",
      comment: "Great",
      rating: 4,
      createdAt: "2026-04-16T10:00:00.000Z",
    },
  ],
  pageIndex: 1,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe("user service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearPublicProfileBundleCache();

    mockedDataSource.getPublicProfile.mockResolvedValue({
      id: "u1",
      name: "Public User",
      email: "user@example.com",
      createdAt: "2026-04-01T00:00:00.000Z",
    });
    mockedDataSource.getCurrentProfile.mockResolvedValue({
      id: "u1",
      name: "Current User",
      email: "current@example.com",
      createdAt: "2026-04-01T00:00:00.000Z",
    });
    mockedDataSource.getUserReviews.mockResolvedValue(
      reviewsPageFixture as never,
    );
  });

  it("throws for invalid user id input", async () => {
    await expect(getPublicProfileBundle("   ")).rejects.toThrow(
      "profile link is invalid",
    );
  });

  it("returns profile bundle and caches repeated requests", async () => {
    const first = await getPublicProfileBundle("u1");
    const second = await getPublicProfileBundle("u1");

    expect(first.profile.userId).toBe("u1");
    expect(first.reviews).toHaveLength(1);
    expect(second).toEqual(first);
    expect(mockedDataSource.getPublicProfile).toHaveBeenCalledTimes(1);
    expect(mockedDataSource.getUserReviews).toHaveBeenCalledTimes(1);
  });

  it("returns profile with reviews warning when reviews endpoint fails", async () => {
    mockedDataSource.getUserReviews.mockRejectedValueOnce(new Error("down"));

    const bundle = await getPublicProfileBundle("u1", undefined, {
      forceRefresh: true,
    });

    expect(bundle.profile.userId).toBe("u1");
    expect(bundle.reviews).toEqual([]);
    expect(bundle.reviewsWarning).toContain("unavailable");
  });

  it("uses current profile endpoint when requested user is current user", async () => {
    const bundle = await getPublicProfileBundle("u1", "u1", {
      forceRefresh: true,
    });

    expect(bundle.profile.name).toBe("Current User");
    expect(mockedDataSource.getCurrentProfile).toHaveBeenCalledTimes(1);
    expect(mockedDataSource.getPublicProfile).toHaveBeenCalledTimes(0);
  });

  it("surfaces ApiError from profile endpoint", async () => {
    mockedDataSource.getPublicProfile.mockRejectedValueOnce(
      new ApiError("Forbidden", 403),
    );
    mockedDataSource.getUserReviews.mockRejectedValueOnce(new Error("down"));

    await expect(
      getPublicProfileBundle("u1", undefined, { forceRefresh: true }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
