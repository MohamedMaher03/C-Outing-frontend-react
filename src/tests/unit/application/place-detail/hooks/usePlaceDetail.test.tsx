import { act, renderHook, waitFor } from "@testing-library/react";
import { usePlaceDetail } from "@/features/place-detail/hooks/usePlaceDetail";
import {
  getAverageRating,
  getMyReview,
  getPlaceById,
  getPlaceReviews,
  getSocialMediaReviews,
  recordInteraction,
  toggleLike,
} from "@/features/place-detail/services/placeDetailService";
import { favoriteAdapter } from "@/features/place-detail/services/favoriteAdapter";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@/features/place-detail/services/placeDetailService", () => ({
  getPlaceById: jest.fn(),
  getPlaceReviews: jest.fn(),
  getSocialMediaReviews: jest.fn(),
  submitReview: jest.fn(),
  updateReview: jest.fn(),
  deleteReview: jest.fn(),
  reportReview: jest.fn(),
  getMyReview: jest.fn(),
  getAverageRating: jest.fn(),
  toggleLike: jest.fn(),
  recordInteraction: jest.fn(),
}));

jest.mock("@/features/place-detail/services/favoriteAdapter", () => ({
  favoriteAdapter: {
    isFavorite: jest.fn(),
    toggle: jest.fn(),
  },
}));

jest.mock("@/features/place-detail/utils/sessionManager", () => ({
  getOrCreateSessionId: () => "session-1",
}));

jest.mock("@/features/place-detail/utils/authUser", () => ({
  getCurrentAuthUserId: () => "u1",
}));

const mockedGetPlaceById = getPlaceById as jest.MockedFunction<
  typeof getPlaceById
>;
const mockedGetPlaceReviews = getPlaceReviews as jest.MockedFunction<
  typeof getPlaceReviews
>;
const mockedGetSocialMediaReviews =
  getSocialMediaReviews as jest.MockedFunction<typeof getSocialMediaReviews>;
const mockedGetMyReview = getMyReview as jest.MockedFunction<
  typeof getMyReview
>;
const mockedGetAverageRating = getAverageRating as jest.MockedFunction<
  typeof getAverageRating
>;
const mockedToggleLike = toggleLike as jest.MockedFunction<typeof toggleLike>;
const mockedRecordInteraction = recordInteraction as jest.MockedFunction<
  typeof recordInteraction
>;
const mockedFavoriteAdapter = favoriteAdapter as jest.Mocked<
  typeof favoriteAdapter
>;

describe("usePlaceDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetPlaceById.mockResolvedValue({
      id: "p1",
      name: "Nile Spot",
      category: "Cafe",
      latitude: 30,
      longitude: 31,
      address: "Maadi",
      rating: 4.5,
      reviewCount: 12,
      description: "Great place",
      image: "img.png",
      isFavorited: false,
      isLiked: false,
    } as never);

    mockedGetPlaceReviews.mockResolvedValue({
      items: [],
      pageIndex: 0,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    });

    mockedGetSocialMediaReviews.mockResolvedValue({
      items: [],
      pageIndex: 0,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    });

    mockedGetMyReview.mockResolvedValue(null);
    mockedGetAverageRating.mockResolvedValue({
      venueId: "p1",
      averageRating: 4.5,
    });
    mockedToggleLike.mockResolvedValue(true);
    mockedRecordInteraction.mockResolvedValue(undefined);
    mockedFavoriteAdapter.isFavorite.mockResolvedValue(false);
    mockedFavoriteAdapter.toggle.mockResolvedValue(undefined);
  });

  it("loads place details and reviews on mount", async () => {
    const { result } = renderHook(() => usePlaceDetail("p1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.place?.id).toBe("p1");
    expect(mockedGetPlaceById).toHaveBeenCalledWith("p1");
    expect(mockedGetPlaceReviews).toHaveBeenCalledWith("p1", {
      pageIndex: 0,
      pageSize: 10,
    });
  });

  it("toggles favorite state through adapter", async () => {
    const { result } = renderHook(() => usePlaceDetail("p1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleFavorite();
    });

    expect(mockedFavoriteAdapter.toggle).toHaveBeenCalledWith("p1", false);
    expect(result.current.isFavorite).toBe(true);
  });
});
