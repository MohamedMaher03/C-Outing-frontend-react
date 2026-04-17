import {
  calculateDistance,
  debounce,
  formatDate,
  formatRating,
  formatSentiment,
  formatTime,
  getInitials,
  throttle,
} from "./helpers";

describe("utils/helpers", () => {
  it("formats rating and sentiment", () => {
    expect(formatRating(4.256)).toBe("4.3");
    expect(formatRating(4.256, 2)).toBe("4.26");
    expect(formatSentiment(0.734)).toBe("73%");
  });

  it("formats date and time using provided locale", () => {
    const date = "2026-01-02T15:04:00.000Z";

    expect(formatDate(date, "en-US")).toMatch(/1\/2\/2026|01\/02\/2026/);
    expect(formatTime(date, "en-US")).toContain(":");
  });

  it("calculates geographic distance", () => {
    expect(calculateDistance(30, 31, 30, 31)).toBeCloseTo(0, 5);

    const cairoToAlex = calculateDistance(30.0444, 31.2357, 31.2001, 29.9187);
    expect(cairoToAlex).toBeGreaterThan(100);
  });

  it("debounces function execution", () => {
    jest.useFakeTimers();

    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced("first");
    debounced("second");

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("second");

    jest.useRealTimers();
  });

  it("throttles function execution", () => {
    const nowSpy = jest.spyOn(Date, "now");
    nowSpy
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(150)
      .mockReturnValueOnce(220);

    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled("first");
    throttled("second");
    throttled("third");

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, "first");
    expect(fn).toHaveBeenNthCalledWith(2, "third");

    nowSpy.mockRestore();
  });

  it("builds initials from names", () => {
    expect(getInitials("john doe")).toBe("JD");
    expect(getInitials("single")).toBe("S");
    expect(getInitials("   sara   ali ")).toBe("SA");
  });
});
