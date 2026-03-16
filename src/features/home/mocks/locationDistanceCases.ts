import { PLACES } from "@/mocks/mockData";
import type { HomePlace, UserLocationState } from "@/features/home/types";

export interface LocationDistanceMockCase {
  id: string;
  title: string;
  description: string;
  userLocation: UserLocationState;
  place: HomePlace;
  expectedDistanceState:
    | "distance"
    | "locating"
    | "permission-denied"
    | "unsupported"
    | "position-unavailable"
    | "error"
    | "place-coordinates-missing";
  expectedLabelContains: string;
}

const noop = () => undefined;

const asHomePlace = (placeId: string): HomePlace => {
  const place = PLACES.find((item) => item.id === placeId);
  if (!place) {
    throw new Error(`Mock place with id '${placeId}' was not found.`);
  }

  return {
    id: place.id,
    name: place.name,
    category: place.category,
    latitude: place.latitude,
    longitude: place.longitude,
    address: place.address,
    rating: place.rating,
    reviewCount: place.reviewCount,
    image: place.image,
    priceLevel: place.priceLevel,
    isOpen: place.isOpen,
    atmosphereTags: place.atmosphereTags,
    hasWifi: place.hasWifi,
    isSaved: place.isSaved,
    matchScore: place.matchScore,
  };
};

export const LOCATION_DISTANCE_MOCK_CASES: LocationDistanceMockCase[] = [
  {
    id: "granted-precise-distance",
    title: "Permission granted and accurate coordinates",
    description:
      "Card should show exact distance in meters/kilometers and Near Me should sort by shortest distance.",
    userLocation: {
      status: "granted",
      coordinates: {
        latitude: 30.0444,
        longitude: 31.2357,
        accuracyMeters: 28,
      },
      message: null,
      errorCode: null,
      requestLocation: noop,
    },
    place: asHomePlace("2"),
    expectedDistanceState: "distance",
    expectedLabelContains: "away",
  },
  {
    id: "loading-pending-permission",
    title: "Location lookup in progress",
    description:
      "Card should show a non-blocking loading label while geolocation request is pending.",
    userLocation: {
      status: "loading",
      coordinates: null,
      message: null,
      errorCode: null,
      requestLocation: noop,
    },
    place: asHomePlace("3"),
    expectedDistanceState: "locating",
    expectedLabelContains: "Locating",
  },
  {
    id: "denied-by-user",
    title: "Permission denied by user/browser",
    description:
      "Card should show a clear denied message and UI should offer a recoverable action (Use my location).",
    userLocation: {
      status: "denied",
      coordinates: null,
      message:
        "Location access is blocked. Enable it in your browser settings to see accurate distances.",
      errorCode: 1,
      requestLocation: noop,
    },
    place: asHomePlace("1"),
    expectedDistanceState: "permission-denied",
    expectedLabelContains: "denied",
  },
  {
    id: "browser-unsupported",
    title: "Geolocation unsupported",
    description:
      "Card should show unsupported message without breaking layout.",
    userLocation: {
      status: "unsupported",
      coordinates: null,
      message: "This browser does not support geolocation.",
      errorCode: null,
      requestLocation: noop,
    },
    place: asHomePlace("4"),
    expectedDistanceState: "unsupported",
    expectedLabelContains: "supported",
  },
  {
    id: "position-unavailable-timeout",
    title: "Position unavailable or timeout",
    description:
      "Card should show temporary unavailable state and stay interactive.",
    userLocation: {
      status: "unavailable",
      coordinates: null,
      message: "Location lookup timed out. Try again.",
      errorCode: 3,
      requestLocation: noop,
    },
    place: asHomePlace("5"),
    expectedDistanceState: "position-unavailable",
    expectedLabelContains: "unavailable",
  },
  {
    id: "generic-geolocation-error",
    title: "Unexpected geolocation error",
    description:
      "Card should present generic location fallback when geolocation fails unexpectedly.",
    userLocation: {
      status: "error",
      coordinates: null,
      message: "Unexpected geolocation error.",
      errorCode: 0,
      requestLocation: noop,
    },
    place: asHomePlace("6"),
    expectedDistanceState: "error",
    expectedLabelContains: "error",
  },
  {
    id: "missing-place-coordinates",
    title: "Place missing lat/long",
    description:
      "Card should show Distance unavailable when a place has no coordinates even if user location is granted.",
    userLocation: {
      status: "granted",
      coordinates: {
        latitude: 30.047,
        longitude: 31.233,
        accuracyMeters: 18,
      },
      message: null,
      errorCode: null,
      requestLocation: noop,
    },
    place: {
      ...asHomePlace("7"),
      latitude: NaN,
      longitude: NaN,
    },
    expectedDistanceState: "place-coordinates-missing",
    expectedLabelContains: "unavailable",
  },
];
