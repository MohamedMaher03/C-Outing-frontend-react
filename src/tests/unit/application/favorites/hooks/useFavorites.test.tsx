import { act, renderHook, waitFor } from "@testing-library/react";
import { useFavorites } from "@/features/favorites/hooks/useFavorites";
import {
  getFavorites,
  toggleFavorite,
} from "@/features/favorites/services/favoritesService";

jest.mock("@/features/favorites/services/favoritesService", () => ({
  getFavorites: jest.fn(),
  toggleFavorite: jest.fn(),
}));

const mockedGetFavorites = getFavorites as jest.MockedFunction<
  typeof getFavorites
>;
const mockedToggleFavorite = toggleFavorite as jest.MockedFunction<
  typeof toggleFavorite
>;

const favoritesFixture = {
  items: [
    {
      venue: {
        id: "v1",
        name: "Venue 1",
      },
      createdAt: "2026-04-16T10:00:00.000Z",
    },
  ],
  pageIndex: 0,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe("useFavorites", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetFavorites.mockResolvedValue(favoritesFixture as never);
    mockedToggleFavorite.mockResolvedValue(undefined);
  });

  it("loads favorites on mount and exposes pagination state", async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.pageSize).toBe(10);
  });

  it("rejects empty place ids in toggleSave and sets action error", async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.toggleSave("   ")).rejects.toThrow(
        "could not be identified",
      );
    });

    await waitFor(() => {
      expect(result.current.actionError).toContain("could not be identified");
    });
  });

  it("optimistically removes favorite and calls service toggle", async () => {
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleSave("v1");
    });

    expect(mockedToggleFavorite).toHaveBeenCalledWith("v1", true);
    expect(result.current.favorites).toEqual([]);
  });
});
