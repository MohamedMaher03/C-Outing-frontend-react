import { getLanguageDirection, isAppLanguage } from "./translations";

describe("i18n translation helpers", () => {
  it("returns language direction for supported languages", () => {
    expect(getLanguageDirection("en")).toBe("ltr");
    expect(getLanguageDirection("ar")).toBe("rtl");
  });

  it("validates app language strings", () => {
    expect(isAppLanguage("en")).toBe(true);
    expect(isAppLanguage("ar")).toBe(true);
    expect(isAppLanguage("fr")).toBe(false);
    expect(isAppLanguage(null)).toBe(false);
  });
});
