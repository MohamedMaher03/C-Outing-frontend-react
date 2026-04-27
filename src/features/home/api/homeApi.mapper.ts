import type { CanonicalPriceLevel } from "@/utils/priceLevels";
import type { HomePlace } from "../types";

type HomeVenueDto = {
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
};

const PRICE_LEVEL_VALUES: CanonicalPriceLevel[] = [
  "cheapest",
  "cheap",
  "midrange",
  "expensive",
  "luxury",
];

const PRICE_LEVEL_SET = new Set<CanonicalPriceLevel>(PRICE_LEVEL_VALUES);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const toFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
      return true;
    }
    if (normalized === "false" || normalized === "0") {
      return false;
    }
  }

  return undefined;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 25);
};

const unwrapDataPayload = (raw: unknown, maxDepth = 2): unknown => {
  let current: unknown = raw;
  let depth = 0;

  while (depth < maxDepth && isRecord(current) && "data" in current) {
    const next = current.data;
    if (next === undefined || next === null) {
      break;
    }

    current = next;
    depth += 1;
  }

  return current;
};

const extractCollection = (raw: unknown): unknown[] => {
  const payload = unwrapDataPayload(raw);
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.results)) {
    return payload.results;
  }

  if (Array.isArray(payload.venues)) {
    return payload.venues;
  }

  return [];
};

const toCanonicalPriceFromNumber = (
  value: number,
): CanonicalPriceLevel | undefined => {
  if (!Number.isFinite(value)) {
    return undefined;
  }

  if (value <= 1) return "cheapest";
  if (value <= 2) return "cheap";
  if (value <= 3) return "midrange";
  if (value <= 4) return "expensive";
  return "luxury";
};

const toCanonicalPriceFromString = (
  value: string,
): CanonicalPriceLevel | undefined => {
  const normalized = value.trim().toLowerCase();

  if (
    normalized.length === 0 ||
    normalized === "unknown" ||
    normalized === "n/a" ||
    normalized === "na"
  ) {
    return undefined;
  }

  const underscored = normalized.replace(/[\s-]+/g, "_");
  if (PRICE_LEVEL_SET.has(underscored as CanonicalPriceLevel)) {
    return underscored as CanonicalPriceLevel;
  }

  const collapsed = normalized.replace(/[\s_-]+/g, "");

  if (
    collapsed === "pricecheapest" ||
    collapsed === "cheapest" ||
    collapsed === "free" ||
    collapsed === "verycheap"
  ) {
    return "cheapest";
  }

  if (
    collapsed === "cheap" ||
    collapsed === "budget" ||
    collapsed === "value" ||
    collapsed === "low"
  ) {
    return "cheap";
  }

  if (
    collapsed === "midrange" ||
    collapsed === "medium" ||
    collapsed === "moderate" ||
    collapsed === "standard"
  ) {
    return "midrange";
  }

  if (
    collapsed === "expensive" ||
    collapsed === "premium" ||
    collapsed === "high"
  ) {
    return "expensive";
  }

  if (
    collapsed === "luxury" ||
    collapsed === "highend" ||
    collapsed === "vip"
  ) {
    return "luxury";
  }

  return undefined;
};

const toCanonicalPriceLevel = (
  ...values: unknown[]
): CanonicalPriceLevel | undefined => {
  for (const value of values) {
    const parsedNumber = toFiniteNumber(value);
    if (parsedNumber !== undefined) {
      const fromNumber = toCanonicalPriceFromNumber(parsedNumber);
      if (fromNumber) {
        return fromNumber;
      }
    }

    if (typeof value === "string") {
      const fromString = toCanonicalPriceFromString(value);
      if (fromString) {
        return fromString;
      }
    }
  }

  return undefined;
};

export const mapHomeVenueToPlace = (raw: unknown): HomePlace | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const venue = raw as HomeVenueDto;
  const id = toTrimmedString(venue.id);
  if (!id) {
    return null;
  }

  const rating = Math.max(
    0,
    Math.min(5, toFiniteNumber(venue.averageRating ?? venue.rating) ?? 0),
  );

  return {
    id,
    name: toTrimmedString(venue.name) ?? "Untitled venue",
    category:
      toTrimmedString(venue.category) ?? toTrimmedString(venue.type) ?? "Venue",
    latitude: toFiniteNumber(venue.latitude) ?? Number.NaN,
    longitude: toFiniteNumber(venue.longitude) ?? Number.NaN,
    address:
      toTrimmedString(venue.address) ??
      toTrimmedString(venue.location) ??
      toTrimmedString(venue.district) ??
      "Address unavailable",
    rating,
    reviewCount: Math.max(
      0,
      Math.trunc(toFiniteNumber(venue.reviewCount) ?? 0),
    ),
    image:
      toTrimmedString(venue.image) ??
      toTrimmedString(venue.displayImageUrl) ??
      toTrimmedString(venue.thumbnailUrl) ??
      "",
    priceLevel: toCanonicalPriceLevel(venue.priceLevel, venue.priceRange),
    isOpen: toBoolean(venue.isOpen),
    atmosphereTags: toStringArray(venue.atmosphereTags),
    hasWifi: toBoolean(venue.hasWifi) ?? false,
    isSaved: toBoolean(venue.isSaved) ?? false,
    matchScore: toFiniteNumber(venue.matchScore),
  };
};

export const mapHomePlacesPayload = (raw: unknown): HomePlace[] => {
  const collection = extractCollection(raw);
  const seenIds = new Set<string>();
  const mapped: HomePlace[] = [];

  for (const item of collection) {
    const place = mapHomeVenueToPlace(item);
    if (!place) {
      continue;
    }

    if (seenIds.has(place.id)) {
      continue;
    }

    seenIds.add(place.id);
    mapped.push(place);
  }

  return mapped;
};
