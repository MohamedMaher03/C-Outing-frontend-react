import type { HomePageData, HomePlace } from "@/features/home/types";
import {
  coerceBoundedRating,
  coerceFiniteNumberWithFallback,
  coerceNonNegativeInteger,
  coerceStringArray,
  coerceTrimmedString,
  dedupeByKey,
} from "@/utils/mapper";

const normalizeMapAtlasPlace = (place: HomePlace): HomePlace | null => {
  const id = coerceTrimmedString(place?.id);
  if (!id) return null;

  return {
    ...place,
    id,
    name: coerceTrimmedString(place?.name) ?? "Untitled venue",
    category: coerceTrimmedString(place?.category) ?? "Venue",
    address: coerceTrimmedString(place?.address) ?? "Address unavailable",
    rating: coerceBoundedRating(place?.rating),
    reviewCount: coerceNonNegativeInteger(place?.reviewCount),
    latitude: coerceFiniteNumberWithFallback(place?.latitude, Number.NaN),
    longitude: coerceFiniteNumberWithFallback(place?.longitude, Number.NaN),
    atmosphereTags: coerceStringArray(place?.atmosphereTags),
    isOpen: place?.isOpen,
    hasWifi: place?.hasWifi === true,
    isSaved: place?.isSaved === true,
  };
};

export const mapMapAtlasPlaces = (places: HomePlace[]): HomePlace[] =>
  dedupeByKey(
    (Array.isArray(places) ? places : []).flatMap((place) => {
      const normalized = normalizeMapAtlasPlace(place);
      return normalized ? [normalized] : [];
    }),
    (place) => place.id,
  );

export const mapMapAtlasHomePageData = (data: HomePageData): HomePageData => ({
  curatedPlaces: mapMapAtlasPlaces(data?.curatedPlaces ?? []),
  trendingPlaces: mapMapAtlasPlaces(data?.trendingPlaces ?? []),
});
