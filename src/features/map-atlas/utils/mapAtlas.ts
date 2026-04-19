import type { Feature, Point } from "geojson";
import type { HomePlace } from "@/features/home/types";
import type {
  ClusterPointProperties,
  ClusteredPlace,
  MapAtlasStats,
} from "@/features/map-atlas/types";

export const CAIRO_DEFAULT_CENTER: [number, number] = [30.0444, 31.2357];

export const CAIRO_DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [29.82, 30.95],
  [30.29, 31.58],
];

export const hasValidCoordinates = (
  place: HomePlace,
): place is ClusteredPlace =>
  Number.isFinite(place.latitude) && Number.isFinite(place.longitude);

export const dedupePlacesById = (places: HomePlace[]): HomePlace[] => {
  const seen = new Set<string>();
  const unique: HomePlace[] = [];

  places.forEach((place) => {
    const normalizedId = typeof place.id === "string" ? place.id.trim() : "";

    if (!normalizedId || seen.has(normalizedId)) {
      return;
    }

    seen.add(normalizedId);
    unique.push({
      ...place,
      id: normalizedId,
    });
  });

  return unique;
};

export const buildClusterFeatures = (
  places: HomePlace[],
): Array<Feature<Point, ClusterPointProperties>> =>
  places.filter(hasValidCoordinates).map((place) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [place.longitude, place.latitude],
    },
    properties: {
      placeId: place.id,
      name: place.name,
      rating: place.rating,
      isOpen: place.isOpen === true,
      isSaved: place.isSaved === true,
    },
  }));

export const computeMapAtlasStats = (places: HomePlace[]): MapAtlasStats => {
  if (places.length === 0) {
    return {
      total: 0,
      openNow: 0,
      saved: 0,
      averageRating: 0,
    };
  }

  const ratedPlaces = places.filter((place) => Number.isFinite(place.rating));
  const ratingSum = ratedPlaces.reduce((sum, place) => sum + place.rating, 0);

  return {
    total: places.length,
    openNow: places.filter((place) => place.isOpen === true).length,
    saved: places.filter((place) => place.isSaved === true).length,
    averageRating: ratedPlaces.length > 0 ? ratingSum / ratedPlaces.length : 0,
  };
};

export const buildGoogleMapsDirectionsUrl = (
  latitude: number,
  longitude: number,
  placeName?: string,
): string => {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return "https://www.google.com/maps";
  }

  const safeLabel = typeof placeName === "string" ? placeName.trim() : "";
  const destination = safeLabel
    ? `${safeLabel} (${latitude}, ${longitude})`
    : `${latitude},${longitude}`;

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
};
