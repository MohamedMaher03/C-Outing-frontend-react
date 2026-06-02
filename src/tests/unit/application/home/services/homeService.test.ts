import { homeService } from "@/features/home/services/homeService";
import { homeApi } from "@/features/home/api/homeApi";

jest.mock("@/features/home/api/homeApi", () => ({
  homeApi: {
    fetchPersonalizedRecommendations: jest.fn(),
    fetchTrendingRecommendations: jest.fn(),
    fetchSimilarRecommendations: jest.fn(),
    togglePlaceSave: jest.fn(),
    fetchMoodRecommendations: jest.fn(),
    fetchVenuesByDistrict: jest.fn(),
    fetchVenuesByType: jest.fn(),
    fetchVenuesByPriceRange: jest.fn(),
    fetchVenueTopRated: jest.fn(),
    fetchVenueTopRatedInArea: jest.fn(),
  },
}));

jest.mock("@/features/home/mocks/homeMock", () => ({
  homeMock: {
    fetchPersonalizedRecommendations: jest.fn(),
    fetchTrendingRecommendations: jest.fn(),
    fetchSimilarRecommendations: jest.fn(),
    togglePlaceSave: jest.fn(),
    fetchMoodRecommendations: jest.fn(),
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

    mockedHomeApi.fetchPersonalizedRecommendations.mockResolvedValue([]);
    mockedHomeApi.fetchTrendingRecommendations.mockResolvedValue([]);
    mockedHomeApi.togglePlaceSave.mockResolvedValue(undefined);
  });

  it("returns personalized recommendations from datasource", async () => {
    const places = await homeService.fetchPersonalizedRecommendations({ count: 5 });

    expect(places).toEqual([]);
    expect(mockedHomeApi.fetchPersonalizedRecommendations).toHaveBeenCalledWith({ count: 5 });
  });

  it("throws explicit fallback errors when datasource fails", async () => {
    mockedHomeApi.fetchPersonalizedRecommendations.mockRejectedValueOnce(new Error("bad"));
    mockedHomeApi.togglePlaceSave.mockRejectedValueOnce(new Error("bad"));

    await expect(homeService.fetchPersonalizedRecommendations()).rejects.toThrow(
      "Failed to fetch personalized recommendations",
    );

    await expect(homeService.togglePlaceSave("v1", true)).rejects.toThrow(
      "Failed to toggle place save",
    );
  });
});
