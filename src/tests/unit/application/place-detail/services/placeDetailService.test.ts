import { placeDetailService } from "@/features/place-detail/services/placeDetailService";
import { placeDetailDataSource } from "@/features/place-detail/services/placeDetailDataSource";
import { getCurrentAuthUserProfile } from "@/features/place-detail/utils/authUser";

jest.mock("@/features/place-detail/services/placeDetailDataSource", () => ({
  placeDetailDataSource: {
    getPlaceById: jest.fn(),
    toggleLike: jest.fn(),
    getPlaceReviews: jest.fn(),
    getSocialMediaReviews: jest.fn(),
    submitReview: jest.fn(),
    updateReview: jest.fn(),
    deleteReview: jest.fn(),
    getReviewById: jest.fn(),
    getUserReviews: jest.fn(),
    getMyReview: jest.fn(),
    getAverageRating: jest.fn(),
    reportReview: jest.fn(),
    recordInteraction: jest.fn(),
  },
}));

jest.mock("@/features/place-detail/utils/authUser", () => ({
  getCurrentAuthUserProfile: jest.fn(),
}));

const mockedDataSource = placeDetailDataSource as jest.Mocked<
  typeof placeDetailDataSource
>;
const mockedGetCurrentAuthUserProfile =
  getCurrentAuthUserProfile as jest.MockedFunction<
    typeof getCurrentAuthUserProfile
  >;

describe("placeDetailService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetCurrentAuthUserProfile.mockReturnValue({
      userId: "u1",
      userName: "Maher",
      userAvatar: "avatar.png",
    });
  });

  it("enriches submitted reviews for immediate UI rendering", async () => {
    mockedDataSource.submitReview.mockResolvedValue({
      id: "r1",
      venueId: "",
      venueName: "",
      userId: "unknown-user",
      userName: "Anonymous",
      rating: 0,
      comment: "   ",
      createdAt: "2026-04-16T10:00:00.000Z",
    } as never);

    const result = await placeDetailService.submitReview("venue-1", 4, "Great");

    expect(result.venueId).toBe("venue-1");
    expect(result.userId).toBe("u1");
    expect(result.userName).toBe("Maher");
    expect(result.userAvatar).toBe("avatar.png");
    expect(result.rating).toBe(4);
    expect(result.comment).toBe("Great");
  });

  it("keeps interaction tracking non-blocking on datasource failures", async () => {
    mockedDataSource.recordInteraction.mockRejectedValueOnce(new Error("down"));

    await expect(
      placeDetailService.recordInteraction({
        venueId: "venue-1",
        actionType: "view",
      }),
    ).resolves.toBeUndefined();
  });
});
