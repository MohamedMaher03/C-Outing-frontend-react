import { act, renderHook, waitFor } from "@testing-library/react";
import { useHomeSeeAll } from "@/features/home/hooks/useHomeSeeAll";
import { homeService } from "@/features/home/services/homeService";
import { useUserLocation } from "@/features/home/hooks/useUserLocation";

jest.mock("@/features/home/services/homeService", () => ({
  homeService: {
    fetchPersonalizedRecommendations: jest.fn(),
    fetchTrendingRecommendations: jest.fn(),
  },
}));

jest.mock("@/features/home/hooks/useUserLocation", () => ({
  useUserLocation: jest.fn(),
}));

const mockedHomeService = homeService as jest.Mocked<typeof homeService>;
const mockedUseUserLocation = useUserLocation as jest.MockedFunction<
  typeof useUserLocation
>;

const placeFixture = {
  id: "p1",
  name: "Nile Spot",
  category: "Cafe",
  latitude: 30,
  longitude: 31,
  address: "Maadi",
  rating: 4.5,
  reviewCount: 10,
  image: "img.png",
  priceLevel: "mid_range",
  isOpen: true,
  atmosphereTags: ["cozy"],
  hasWifi: true,
  isSaved: false,
  matchScore: 0.8,
};

describe("useHomeSeeAll", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseUserLocation.mockReturnValue({
      status: "idle",
      coordinates: null,
      message: null,
      errorCode: null,
      requestLocation: jest.fn(),
    });

    mockedHomeService.fetchPersonalizedRecommendations.mockResolvedValue([
      placeFixture,
    ] as never);
    mockedHomeService.fetchTrendingRecommendations.mockResolvedValue([
      { ...placeFixture, id: "p2" },
    ] as never);
  });

  it("loads curated recommendations and refetches when count changes", async () => {
    const { result } = renderHook(() =>
      useHomeSeeAll({ collection: "curated" }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.safeCollection).toBe("curated");
    expect(result.current.places).toHaveLength(1);
    expect(
      mockedHomeService.fetchPersonalizedRecommendations,
    ).toHaveBeenCalledWith({ count: 20 });

    await act(async () => {
      result.current.setCount(30);
    });

    await waitFor(() => {
      expect(
        mockedHomeService.fetchPersonalizedRecommendations,
      ).toHaveBeenCalledWith({ count: 30 });
    });
  });

  it("returns null safeCollection for unsupported route params", () => {
    const { result } = renderHook(() =>
      useHomeSeeAll({ collection: "invalid" }),
    );

    expect(result.current.safeCollection).toBeNull();
    expect(result.current.places).toEqual([]);
  });

  it("refreshes data when retryFetch is called", async () => {
    const { result } = renderHook(() =>
      useHomeSeeAll({ collection: "trending" }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const callsBeforeRetry =
      mockedHomeService.fetchTrendingRecommendations.mock.calls.length;

    await act(async () => {
      result.current.retryFetch();
    });

    await waitFor(() => {
      expect(
        mockedHomeService.fetchTrendingRecommendations.mock.calls.length,
      ).toBeGreaterThan(callsBeforeRetry);
    });
  });
});
