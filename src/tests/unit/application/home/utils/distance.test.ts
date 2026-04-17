import {
  calculateDistanceKm,
  getDistanceDisplayState,
} from "@/features/home/utils/distance";

describe("home distance utilities", () => {
  it("calculates haversine distance in km", () => {
    expect(calculateDistanceKm(30, 31, 30, 31)).toBeCloseTo(0, 5);

    const value = calculateDistanceKm(30.0444, 31.2357, 31.2001, 29.9187);
    expect(value).toBeGreaterThan(100);
  });

  it("returns place coordinate missing state when venue coords are invalid", () => {
    const state = getDistanceDisplayState(
      {
        status: "granted",
        coordinates: { latitude: 30, longitude: 31 },
        message: null,
        errorCode: null,
        requestLocation: () => undefined,
      },
      null,
      31,
    );

    expect(state).toEqual({ kind: "place-coordinates-missing" });
  });

  it("returns distance state for granted user location", () => {
    const state = getDistanceDisplayState(
      {
        status: "granted",
        coordinates: { latitude: 30, longitude: 31 },
        message: null,
        errorCode: null,
        requestLocation: () => undefined,
      },
      30.1,
      31.1,
    );

    expect(state.kind).toBe("distance");
    if (state.kind === "distance") {
      expect(state.valueKm).toBeGreaterThan(0);
    }
  });

  it("maps user location statuses to display state", () => {
    expect(
      getDistanceDisplayState(
        {
          status: "denied",
          coordinates: null,
          message: null,
          errorCode: 1,
          requestLocation: () => undefined,
        },
        30,
        31,
      ),
    ).toEqual({ kind: "permission-denied" });

    expect(
      getDistanceDisplayState(
        {
          status: "unsupported",
          coordinates: null,
          message: null,
          errorCode: null,
          requestLocation: () => undefined,
        },
        30,
        31,
      ),
    ).toEqual({ kind: "unsupported" });
  });
});
