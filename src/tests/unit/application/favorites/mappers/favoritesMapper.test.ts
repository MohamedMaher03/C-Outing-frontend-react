import { mapFavoritesPage } from "@/features/favorites/mappers/favoritesMapper";

describe("favorites mapper", () => {
  it("deduplicates favorites by venue id and normalizes pagination metadata", () => {
    const result = mapFavoritesPage({
      items: [
        {
          venue: { id: " v1 ", name: "A" } as never,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
        {
          venue: { id: "v1", name: "Duplicate" } as never,
          createdAt: "2026-01-02T00:00:00.000Z",
        },
        {
          venue: { id: "v2", name: "B" } as never,
          createdAt: "2026-01-03T00:00:00.000Z",
        },
      ],
      pageIndex: 99,
      pageSize: 0,
      totalCount: 2,
      totalPages: 1,
      hasPreviousPage: true,
      hasNextPage: true,
    });

    expect(result.items).toHaveLength(2);
    expect(result.items[0]?.venue.id).toBe("v1");
    expect(result.pageSize).toBe(1);
    expect(result.pageIndex).toBe(0);
    expect(result.hasPreviousPage).toBe(false);
    expect(result.hasNextPage).toBe(false);
  });

  it("handles invalid items and empty pages safely", () => {
    const result = mapFavoritesPage({
      items: null as never,
      pageIndex: undefined as never,
      pageSize: undefined as never,
      totalCount: undefined as never,
      totalPages: undefined as never,
      hasPreviousPage: false,
      hasNextPage: false,
    });

    expect(result.items).toEqual([]);
    expect(result.pageSize).toBe(10);
    expect(result.totalCount).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.pageIndex).toBe(0);
  });
});
