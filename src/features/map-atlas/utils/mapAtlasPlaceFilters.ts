import type { FilterType, HomePlace } from "@/features/home/types";
import { calculateDistanceKm } from "@/features/home/utils/distance";

export interface MapAtlasFilterContext {
  normalizedSearch: string;
  selectedFilterSet: ReadonlySet<FilterType>;
  userCoordinates: { latitude: number; longitude: number } | null;
}

const toSearchableLower = (value: unknown): string =>
  typeof value === "string" ? value.toLowerCase() : "";

const matchesSearchQuery = (
  place: HomePlace,
  normalizedSearch: string,
): boolean => {
  if (!normalizedSearch) return true;

  return (
    toSearchableLower(place.name).includes(normalizedSearch) ||
    toSearchableLower(place.address).includes(normalizedSearch) ||
    toSearchableLower(place.category).includes(normalizedSearch) ||
    (place.atmosphereTags ?? []).some((tag) =>
      toSearchableLower(tag).includes(normalizedSearch),
    )
  );
};

const sortByProximity = (
  places: HomePlace[],
  latitude: number,
  longitude: number,
): HomePlace[] =>
  [...places]
    .map((place) => ({
      place,
      distanceKm:
        Number.isFinite(place.latitude) && Number.isFinite(place.longitude)
          ? calculateDistanceKm(
              latitude,
              longitude,
              place.latitude,
              place.longitude,
            )
          : Number.POSITIVE_INFINITY,
    }))
    .sort((first, second) => first.distanceKm - second.distanceKm)
    .map(({ place }) => place);

export const applyMapAtlasPlaceFilters = (
  list: HomePlace[],
  context: MapAtlasFilterContext,
): HomePlace[] => {
  let filtered = list.filter((place) =>
    matchesSearchQuery(place, context.normalizedSearch),
  );

  if (context.selectedFilterSet.has("open-now")) {
    filtered = filtered.filter((place) => place.isOpen === true);
  }

  if (context.selectedFilterSet.has("saved")) {
    filtered = filtered.filter((place) => place.isSaved === true);
  }

  if (context.selectedFilterSet.has("has-wifi")) {
    filtered = filtered.filter((place) => place.hasWifi === true);
  }

  if (context.selectedFilterSet.has("near-me") && context.userCoordinates) {
    const { latitude, longitude } = context.userCoordinates;
    filtered = sortByProximity(filtered, latitude, longitude);
  }

  return filtered;
};
