import { placeDetailApi } from "../api/placeDetailApi";
import { placeDetailMock } from "../mocks/placeDetailMock";
import type { PlaceDetailDataSource } from "../types/dataSource";

export type { PlaceDetailDataSource } from "../types/dataSource";

const parseBooleanEnv = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

const shouldUseMocks =
  parseBooleanEnv(import.meta.env.VITE_PLACE_DETAIL_USE_MOCKS) ||
  parseBooleanEnv(import.meta.env.VITE_USE_MOCKS);

// API is the default source to keep production behavior explicit.
export const placeDetailDataSource: PlaceDetailDataSource = shouldUseMocks
  ? placeDetailMock
  : placeDetailApi;
