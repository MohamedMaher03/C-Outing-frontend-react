import type { FilterType, HomePlace, UserLocationState } from "../types";
import { calculateDistanceKm } from "./distance";

export const HOME_QUICK_FILTER_QUERY_KEY = "filters";

const QUICK_FILTER_VALUES: FilterType[] = [
  "all",
  "near-me",
  "open-now",
  "saved",
  "has-wifi",
];

export const parseHomeQuickFilters = (value: string): FilterType[] => {
  if (!value.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is FilterType =>
      QUICK_FILTER_VALUES.includes(item as FilterType),
    )
    .filter(
      (item, index, items) => items.indexOf(item) === index && item !== "all",
    );
};

const sortByDistance = (
  places: HomePlace[],
  latitude: number,
  longitude: number,
): HomePlace[] =>
  [...places].sort((left, right) => {
    const distanceLeft = calculateDistanceKm(
      latitude,
      longitude,
      left.latitude,
      left.longitude,
    );
    const distanceRight = calculateDistanceKm(
      latitude,
      longitude,
      right.latitude,
      right.longitude,
    );

    return distanceLeft - distanceRight;
  });

export const filterHomePlacesByQuickFilters = (
  places: HomePlace[],
  selectedFilters: FilterType[],
  userLocation?: UserLocationState | null,
): HomePlace[] => {
  let result = [...places];

  if (selectedFilters.includes("open-now")) {
    result = result.filter((place) => place.isOpen === true);
  }

  if (selectedFilters.includes("saved")) {
    result = result.filter((place) => place.isSaved === true);
  }

  if (selectedFilters.includes("has-wifi")) {
    result = result.filter((place) => place.hasWifi === true);
  }

  if (
    selectedFilters.includes("near-me") &&
    userLocation?.status === "granted" &&
    userLocation.coordinates
  ) {
    result = sortByDistance(
      result,
      userLocation.coordinates.latitude,
      userLocation.coordinates.longitude,
    );
  }

  return result;
};
