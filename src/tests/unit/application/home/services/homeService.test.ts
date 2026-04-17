import { homeService } from "@/features/home/services/homeService";
import { homeApi } from "@/features/home/api/homeApi";

jest.mock("@/features/home/api/homeApi", () => ({
  homeApi: {
    fetchHomePageData: jest.fn(),
    fetchPersonalizedRecommendations: jest.fn(),
    fetchTrendingRecommendations: jest.fn(),
    fetchSimilarRecommendations: jest.fn(),
    togglePlaceSave: jest.fn(),
    fetchPlacesByMood: jest.fn(),
    fetchVenuesByDistrict: jest.fn(),
    fetchVenuesByType: jest.fn(),
    fetchVenuesByPriceRange: jest.fn(),
    fetchVenueTopRated: jest.fn(),
    fetchVenueTopRatedInArea: jest.fn(),
  },
}));

jest.mock("@/features/home/mocks/homeMock", () => ({
  homeMock: {
    fetchHomePageData: jest.fn(),
    fetchPersonalizedRecommendations: jest.fn(),
    fetchTrendingRecommendations: jest.fn(),
    fetchSimilarRecommendations: jest.fn(),
    togglePlaceSave: jest.fn(),
    fetchPlacesByMood: jest.fn(),
    fetchVenuesByDistrict: jest.fn(),
    fetchVenuesByType: jest.fn(),
    fetchVenuesByPriceRange: jest.fn(),
    fetchVenueTopRated: jest.fn(),
    fetchVenueTopRatedInArea: jest.fn(),
  },
}));

const mockedHomeApi = homeApi as jest.Mocked<typeof homeApi>;

describe("home service", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedHomeApi.fetchHomePageData.mockResolvedValue({
      curatedPlaces: [],
      trendingPlaces: [],
    });
    mockedHomeApi.togglePlaceSave.mockResolvedValue(undefined);
  });

  it("returns home page data from datasource", async () => {
    const data = await homeService.fetchHomePageData({ count: 5 });

    expect(data).toEqual({ curatedPlaces: [], trendingPlaces: [] });
    expect(mockedHomeApi.fetchHomePageData).toHaveBeenCalledWith({ count: 5 });
  });

  it("throws explicit fallback errors when datasource fails", async () => {
    mockedHomeApi.fetchHomePageData.mockRejectedValueOnce(new Error("bad"));
    mockedHomeApi.togglePlaceSave.mockRejectedValueOnce(new Error("bad"));

    await expect(homeService.fetchHomePageData()).rejects.toThrow(
      "Failed to fetch home page data",
    );

    await expect(homeService.togglePlaceSave("v1", true)).rejects.toThrow(
      "Failed to toggle place save",
    );
  });
});
