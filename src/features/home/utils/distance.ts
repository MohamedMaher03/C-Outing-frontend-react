import type { UserLocationState } from "@/features/home/types";

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle distance using the Haversine formula. */
export const calculateDistanceKm = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number => {
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

export type DistanceDisplayState =
  | { kind: "distance"; valueKm: number }
  | { kind: "locating" }
  | { kind: "permission-denied" }
  | { kind: "unsupported" }
  | { kind: "position-unavailable" }
  | { kind: "error" }
  | { kind: "place-coordinates-missing" };

export const getDistanceDisplayState = (
  userLocation: UserLocationState | null | undefined,
  placeLatitude: number | null | undefined,
  placeLongitude: number | null | undefined,
): DistanceDisplayState => {
  const hasPlaceCoordinates =
    typeof placeLatitude === "number" &&
    Number.isFinite(placeLatitude) &&
    typeof placeLongitude === "number" &&
    Number.isFinite(placeLongitude);

  if (!hasPlaceCoordinates) {
    return {
      kind: "place-coordinates-missing",
    };
  }

  if (!userLocation) {
    return { kind: "locating" };
  }

  if (userLocation.status === "granted" && userLocation.coordinates) {
    const distanceKm = calculateDistanceKm(
      userLocation.coordinates.latitude,
      userLocation.coordinates.longitude,
      placeLatitude,
      placeLongitude,
    );

    return {
      kind: "distance",
      valueKm: distanceKm,
    };
  }

  switch (userLocation.status) {
    case "idle":
    case "loading":
      return { kind: "locating" };
    case "denied":
      return { kind: "permission-denied" };
    case "unsupported":
      return { kind: "unsupported" };
    case "unavailable":
      return { kind: "position-unavailable" };
    case "error":
      return { kind: "error" };
    default:
      return { kind: "locating" };
  }
};
