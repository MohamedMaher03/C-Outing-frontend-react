import type { PaginatedResponse } from "@/types";
import { normalizeOpenStatus } from "@/utils/openStatus";
import {
  coerceBoolean,
  coerceBoundedRating,
  coerceFiniteNumber,
  coerceFirstNonEmptyString,
  coerceNonNegativeInteger,
  coerceStringArray,
  coerceTrimmedString,
  extractPayloadCollection,
  mapLoosePaginatedPayload,
  mapPayloadCollection,
  resolveCanonicalPriceLevel,
  unwrapNestedDataPayload,
} from "@/mapper";
import { isObjectRecord } from "@/utils/typeGuards";
import type { HomePlace } from "../types";

interface HomeVenueDto {
  id?: unknown;
  name?: unknown;
  location?: unknown;
  category?: unknown;
  district?: unknown;
  type?: unknown;
  priceRange?: unknown;
  priceLevel?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  averageRating?: unknown;
  rating?: unknown;
  reviewCount?: unknown;
  displayImageUrl?: unknown;
  thumbnailUrl?: unknown;
  image?: unknown;
  address?: unknown;
  isOpen?: unknown;
  atmosphereTags?: unknown;
  hasWifi?: unknown;
  isSaved?: unknown;
  matchScore?: unknown;
}

interface MoodRecommendationDto {
  rank?: unknown;
  venue?: unknown;
}

const extractMoodRecommendations = (
  raw: unknown,
): Array<{ rank: number; venue: unknown }> => {
  const payload = unwrapNestedDataPayload(raw, 2);
  if (!isObjectRecord(payload)) return [];

  const recommendations = payload.recommendations;
  if (!Array.isArray(recommendations)) return [];

  return recommendations
    .filter((item): item is MoodRecommendationDto => isObjectRecord(item))
    .map((item) => ({
      rank: coerceFiniteNumber(item.rank) ?? Number.POSITIVE_INFINITY,
      venue: item.venue,
    }));
};

export const mapHomeVenueToPlace = (raw: unknown): HomePlace | null => {
  if (!isObjectRecord(raw)) return null;

  const venue = raw as HomeVenueDto;
  const id = coerceTrimmedString(venue.id);
  if (!id) return null;

  return {
    id,
    name: coerceTrimmedString(venue.name) ?? "Untitled venue",
    category:
      coerceTrimmedString(venue.category) ??
      coerceTrimmedString(venue.type) ??
      "Venue",
    latitude: coerceFiniteNumber(venue.latitude) ?? Number.NaN,
    longitude: coerceFiniteNumber(venue.longitude) ?? Number.NaN,
    address:
      coerceFirstNonEmptyString(
        venue.address,
        venue.location,
        venue.district,
      ) ?? "Address unavailable",
    rating: coerceBoundedRating(venue.averageRating ?? venue.rating),
    reviewCount: coerceNonNegativeInteger(venue.reviewCount),
    image:
      coerceFirstNonEmptyString(
        venue.image,
        venue.displayImageUrl,
        venue.thumbnailUrl,
      ) ?? "",
    priceLevel: resolveCanonicalPriceLevel(venue.priceLevel, venue.priceRange),
    isOpen: normalizeOpenStatus(venue.isOpen),
    atmosphereTags: coerceStringArray(venue.atmosphereTags),
    hasWifi: coerceBoolean(venue.hasWifi) ?? false,
    isSaved: coerceBoolean(venue.isSaved) ?? false,
    matchScore: coerceFiniteNumber(venue.matchScore),
  };
};

export const mapHomePlacesPayload = (raw: unknown): HomePlace[] =>
  mapPayloadCollection(
    extractPayloadCollection(raw),
    mapHomeVenueToPlace,
    (place) => place.id,
  );

const mapRankedRecommendationsPayload = (raw: unknown): HomePlace[] => {
  const recommendations = extractMoodRecommendations(raw).sort(
    (left, right) => left.rank - right.rank,
  );

  return mapPayloadCollection(
    recommendations.map((item) => item.venue),
    mapHomeVenueToPlace,
    (place) => place.id,
  );
};

export const mapHomeRankedRecommendationsPayload = (
  raw: unknown,
): HomePlace[] => mapRankedRecommendationsPayload(raw);

export const mapHomeMoodRecommendationsPayload = (raw: unknown): HomePlace[] =>
  mapRankedRecommendationsPayload(raw);

export const mapHomePaginatedPlacesPayload = (
  raw: unknown,
): PaginatedResponse<HomePlace> => {
  const payload = unwrapNestedDataPayload(raw, 2);
  const items = mapHomePlacesPayload(payload);

  if (!isObjectRecord(payload)) {
    return mapLoosePaginatedPayload({}, items);
  }

  return mapLoosePaginatedPayload(payload, items);
};
