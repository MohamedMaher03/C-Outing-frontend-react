import {
  BUDGET_OPTIONS,
  PRICE_LEVEL_META,
  PRICE_LEVEL_OPTIONS,
  PRICE_LEVEL_VALUES,
} from "./priceLevels";

describe("utils/priceLevels", () => {
  it("exposes canonical price values in expected order", () => {
    expect(PRICE_LEVEL_VALUES).toEqual([
      "price_cheapest",
      "cheap",
      "mid_range",
      "expensive",
      "luxury",
    ]);
  });

  it("builds options and metadata for each canonical value", () => {
    expect(PRICE_LEVEL_OPTIONS).toHaveLength(PRICE_LEVEL_VALUES.length);

    for (const value of PRICE_LEVEL_VALUES) {
      expect(PRICE_LEVEL_META[value]).toBeDefined();
      const option = PRICE_LEVEL_OPTIONS.find((entry) => entry.value === value);
      expect(option).toBeDefined();
      expect(option?.label).toBeTruthy();
      expect(option?.symbol).toMatch(/^\$+$/);
    }
  });

  it("exposes budget options with combined label and symbol", () => {
    expect(BUDGET_OPTIONS).toHaveLength(PRICE_LEVEL_VALUES.length);
    expect(BUDGET_OPTIONS[0]?.label).toContain("(");
    expect(BUDGET_OPTIONS[0]?.label).toContain("$");
  });
});
