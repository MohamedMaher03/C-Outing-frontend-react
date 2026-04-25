import {
  normalizeEmail,
  normalizeLowercase,
  normalizeSearchTerm,
  normalizeTrimmed,
} from "./textNormalization";

describe("text normalization", () => {
  it("normalizes whitespace and casing for string inputs", () => {
    expect(normalizeTrimmed("  Cairo  ")).toBe("Cairo");
    expect(normalizeLowercase("  HELLO  ")).toBe("hello");
    expect(normalizeEmail("  USER@EXAMPLE.COM  ")).toBe("user@example.com");
    expect(normalizeSearchTerm("  Nile Walk  ")).toBe("nile walk");
  });

  it("returns an empty string for nullish values", () => {
    expect(normalizeTrimmed(undefined)).toBe("");
    expect(normalizeLowercase(null)).toBe("");
    expect(normalizeEmail(undefined)).toBe("");
    expect(normalizeSearchTerm(null)).toBe("");
  });

  it("returns an empty string for non-string values", () => {
    expect(normalizeTrimmed(42)).toBe("");
    expect(normalizeLowercase({ value: "test" })).toBe("");
    expect(normalizeSearchTerm(["tag"])).toBe("");
  });
});
