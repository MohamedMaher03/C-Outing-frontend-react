import type { HomePageData, HomePlace } from "@/features/home/types";

const toSafeString = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
};

const toSafeFiniteNumber = (value: unknown, fallback: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return value;
};

const toSafeRating = (value: unknown): number => {
  const normalized = toSafeFiniteNumber(value, 0);
  return Math.max(0, Math.min(5, normalized));
};

const toSafeInteger = (value: unknown, fallback = 0): number => {
  const normalized = toSafeFiniteNumber(value, fallback);
  return Math.max(0, Math.floor(normalized));
};

const toSafeTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 25);
};

const mapMapAtlasPlace = (place: HomePlace): HomePlace | null => {
  const id = toSafeString(place?.id, "");
  if (!id) {
    return null;
  }

  return {
    ...place,
    id,
    name: toSafeString(place?.name, "Untitled venue"),
    category: toSafeString(place?.category, "Venue"),
    address: toSafeString(place?.address, "Address unavailable"),
    rating: toSafeRating(place?.rating),
    reviewCount: toSafeInteger(place?.reviewCount, 0),
    latitude: toSafeFiniteNumber(place?.latitude, Number.NaN),
    longitude: toSafeFiniteNumber(place?.longitude, Number.NaN),
    atmosphereTags: toSafeTags(place?.atmosphereTags),
    isOpen: place?.isOpen === true,
    hasWifi: place?.hasWifi === true,
    isSaved: place?.isSaved === true,
  };
};

export const mapMapAtlasPlaces = (places: HomePlace[]): HomePlace[] => {
  if (!Array.isArray(places)) {
    return [];
  }

  const seenIds = new Set<string>();
  const normalized: HomePlace[] = [];

  for (const place of places) {
    const mappedPlace = mapMapAtlasPlace(place);
    if (!mappedPlace) {
      continue;
    }

    if (seenIds.has(mappedPlace.id)) {
      continue;
    }

    seenIds.add(mappedPlace.id);
    normalized.push(mappedPlace);
  }

  return normalized;
};

export const mapMapAtlasHomePageData = (data: HomePageData): HomePageData => ({
  curatedPlaces: mapMapAtlasPlaces(data?.curatedPlaces ?? []),
  trendingPlaces: mapMapAtlasPlaces(data?.trendingPlaces ?? []),
});
