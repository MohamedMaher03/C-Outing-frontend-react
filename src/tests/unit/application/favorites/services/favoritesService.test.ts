import {
  addToFavorites,
  checkIsFavorite,
  favoritesService,
  getFavorites,
  removeFromFavorites,
  toggleFavorite,
} from "@/features/favorites/services/favoritesService";
import { favoritesDataSource } from "@/features/favorites/services/favoritesDataSource";

jest.mock("@/features/favorites/services/favoritesDataSource", () => ({
  favoritesDataSource: {
    getFavorites: jest.fn(),
    addToFavorites: jest.fn(),
    removeFromFavorites: jest.fn(),
    checkIsFavorite: jest.fn(),
  },
}));

const mockedDataSource = favoritesDataSource as jest.Mocked<
  typeof favoritesDataSource
>;

describe("favorites service", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedDataSource.getFavorites.mockResolvedValue({
      items: [
        {
          venue: { id: "v1", name: "Place" } as never,
          createdAt: "2026-04-16T10:00:00.000Z",
        },
      ],
      pageIndex: 0,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
    mockedDataSource.addToFavorites.mockResolvedValue(undefined);
    mockedDataSource.removeFromFavorites.mockResolvedValue(undefined);
    mockedDataSource.checkIsFavorite.mockResolvedValue(true);
  });

  it("gets favorites with normalized pagination args", async () => {
    const response = await getFavorites({ pageIndex: 2.8, pageSize: 999 });

    expect(response.items).toHaveLength(1);
    expect(mockedDataSource.getFavorites).toHaveBeenCalledWith({
      pageIndex: 2,
      page: undefined,
      pageSize: 50,
    });
  });

  it("adds/removes favorites and toggles based on current state", async () => {
    await addToFavorites(" v1 ");
    await removeFromFavorites(" v1 ");

    expect(mockedDataSource.addToFavorites).toHaveBeenCalledWith("v1");
    expect(mockedDataSource.removeFromFavorites).toHaveBeenCalledWith("v1");

    await toggleFavorite("v2", false);
    await toggleFavorite("v3", true);

    expect(mockedDataSource.addToFavorites).toHaveBeenCalledWith("v2");
    expect(mockedDataSource.removeFromFavorites).toHaveBeenCalledWith("v3");
  });

  it("checks favorite state and exports service facade", async () => {
    await expect(checkIsFavorite(" v1 ")).resolves.toBe(true);
    expect(favoritesService.toggleFavorite).toBe(toggleFavorite);
  });
});
