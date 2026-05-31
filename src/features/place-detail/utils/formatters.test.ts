import {
  formatMetroStationName,
  formatMetroStationTime,
  isMetroMetricMissing,
} from "./formatters";

describe("isMetroMetricMissing", () => {
  it("treats empty and dash values as missing", () => {
    expect(isMetroMetricMissing("")).toBe(true);
    expect(isMetroMetricMissing("-")).toBe(true);
    expect(isMetroMetricMissing("  -  ")).toBe(true);
    expect(isMetroMetricMissing(undefined)).toBe(true);
  });

  it("treats valid values as present", () => {
    expect(isMetroMetricMissing("5 min")).toBe(false);
    expect(isMetroMetricMissing("1.2 km")).toBe(false);
  });
});

describe("formatMetroStationTime", () => {
  it("keeps the original value for non-Arabic locales", () => {
    expect(formatMetroStationTime("5 min", "en-US")).toBe("5 min");
  });

  it("translates metro duration into Arabic", () => {
    expect(formatMetroStationTime("5 min", "ar-EG")).toBe("٥ دقائق");
    expect(formatMetroStationTime("1 min", "ar-EG")).toBe("١ دقيقة");
    expect(formatMetroStationTime("1.2 km", "ar-EG")).toBe("١٫٢ كم");
  });

  it("translates known metro station names into Arabic", () => {
    expect(formatMetroStationName("Helwan", "ar-EG")).toBe("حلوان");
    expect(formatMetroStationName("Kit Kat", "ar-EG")).toBe("الكيت كات");
    expect(formatMetroStationName("Cairo University", "ar-EG")).toBe(
      "جامعة القاهرة",
    );
    expect(formatMetroStationName("Rod El-Farag Axes", "ar-EG")).toBe(
      "محور روض الفرج",
    );
    expect(formatMetroStationName("Omm El Misryeen", "ar-EG")).toBe(
      "أم المصريين",
    );
  });

  it("keeps unknown metro station names as-is", () => {
    expect(formatMetroStationName("Unknown Station", "ar-EG")).toBe(
      "Unknown Station",
    );
  });

  it("returns the trimmed value when the duration cannot be parsed", () => {
    expect(formatMetroStationTime("about 5 min", "ar-EG")).toBe("about 5 min");
  });
});
