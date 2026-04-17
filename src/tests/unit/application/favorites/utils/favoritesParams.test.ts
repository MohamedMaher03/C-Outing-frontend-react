import {
  normalizePageIndex,
  normalizePageNumber,
  normalizePageSize,
  normalizePlaceId,
} from "@/features/favorites/utils/favoritesParams";

describe("favorites params normalization", () => {
  it("normalizes and validates place identifiers", () => {
    expect(normalizePlaceId("  place-1 ")).toBe("place-1");
    expect(() => normalizePlaceId("   ")).toThrow(
      "Place identifier is required",
    );
  });

  it("normalizes page size and index values", () => {
    expect(normalizePageSize(undefined)).toBe(10);
    expect(normalizePageSize(3.9)).toBe(3);
    expect(normalizePageSize(999)).toBe(50);
    expect(normalizePageSize(0)).toBe(1);

    expect(normalizePageIndex(undefined)).toBeUndefined();
    expect(normalizePageIndex(2.8)).toBe(2);
    expect(normalizePageIndex(-3)).toBe(0);

    expect(normalizePageNumber(undefined)).toBeUndefined();
    expect(normalizePageNumber(4.7)).toBe(4);
    expect(normalizePageNumber(0)).toBe(1);
  });
});
