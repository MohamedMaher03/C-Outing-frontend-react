import { act, renderHook, waitFor } from "@testing-library/react";
import { ApiError } from "@/utils/apiError";
import { usePublicProfile } from "@/features/users/hooks/usePublicProfile";
import { getPublicProfileBundle } from "@/features/users/services/userService";
import { useAuth } from "@/features/auth/context/AuthContext";

jest.mock("@/features/users/services/userService", () => ({
  getPublicProfileBundle: jest.fn(),
}));

jest.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockedGetPublicProfileBundle =
  getPublicProfileBundle as jest.MockedFunction<typeof getPublicProfileBundle>;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const bundleFixture = {
  profile: {
    userId: "u1",
    name: "Maher",
    email: "maher@example.com",
    joinedDate: "2026-04-01T00:00:00.000Z",
    reviewCount: 1,
    totalInteractions: 8,
  },
  reviews: [
    {
      reviewId: "r1",
      placeId: "p1",
      placeName: "Nile Spot",
      rating: 4,
      comment: "Great",
      date: "2026-04-01T00:00:00.000Z",
    },
  ],
  reviewsWarning: null,
};

describe("usePublicProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      user: {
        userId: "u1",
      },
    } as never);

    mockedGetPublicProfileBundle.mockResolvedValue(bundleFixture as never);
  });

  it("loads profile bundle and detects own profile", async () => {
    const { result } = renderHook(() => usePublicProfile(" u1 "));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile?.userId).toBe("u1");
    expect(result.current.reviews).toHaveLength(1);
    expect(result.current.isOwnProfile).toBe(true);
    expect(mockedGetPublicProfileBundle).toHaveBeenCalledWith("u1", "u1", {
      forceRefresh: false,
    });
  });

  it("reloads profile with forceRefresh enabled", async () => {
    const { result } = renderHook(() => usePublicProfile("u1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.reload();
    });

    expect(mockedGetPublicProfileBundle).toHaveBeenLastCalledWith("u1", "u1", {
      forceRefresh: true,
    });
  });

  it("maps service failures to user-friendly errors", async () => {
    mockedGetPublicProfileBundle.mockRejectedValueOnce(
      new ApiError("Forbidden", 403),
    );

    const { result } = renderHook(() => usePublicProfile("u2"));

    await waitFor(() => {
      expect(result.current.error).toBe(
        "You do not have permission to view this profile.",
      );
    });
  });
});
