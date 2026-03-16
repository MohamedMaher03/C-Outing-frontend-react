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

const formatDistance = (distanceKm: number): string => {
  if (!Number.isFinite(distanceKm) || distanceKm < 0)
    return "Distance unavailable";

  if (distanceKm < 1) {
    return `${Math.max(1, Math.round(distanceKm * 1000))} m away`;
  }

  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km away`;
  }

  return `${Math.round(distanceKm)} km away`;
};

export type DistanceDisplayState =
  | { kind: "distance"; text: string; valueKm: number }
  | { kind: "locating"; text: string }
  | { kind: "permission-denied"; text: string }
  | { kind: "unsupported"; text: string }
  | { kind: "position-unavailable"; text: string }
  | { kind: "error"; text: string }
  | { kind: "place-coordinates-missing"; text: string };

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
      text: "Distance unavailable",
    };
  }

  if (!userLocation) {
    return { kind: "locating", text: "Locating you..." };
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
      text: formatDistance(distanceKm),
      valueKm: distanceKm,
    };
  }

  switch (userLocation.status) {
    case "idle":
    case "loading":
      return { kind: "locating", text: "Locating you..." };
    case "denied":
      return { kind: "permission-denied", text: "Location permission denied" };
    case "unsupported":
      return { kind: "unsupported", text: "Geolocation not supported" };
    case "unavailable":
      return { kind: "position-unavailable", text: "Location unavailable" };
    case "error":
      return {
        kind: "error",
        text: userLocation.message ?? "Location unavailable",
      };
    default:
      return { kind: "locating", text: "Locating you..." };
  }
};
