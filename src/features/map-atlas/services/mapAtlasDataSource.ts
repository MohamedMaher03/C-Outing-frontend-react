import { mapAtlasApi } from "@/features/map-atlas/api/mapAtlasApi";
import { mapAtlasMock } from "@/features/map-atlas/mocks";
import type { MapAtlasDataSource } from "@/features/map-atlas/types/dataSource";

export type { MapAtlasDataSource } from "@/features/map-atlas/types/dataSource";

const parseBooleanEnv = (value: unknown): boolean => {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

const resolveFeatureMockFlag = (featureValue: unknown): boolean => {
  if (typeof featureValue === "string") {
    return parseBooleanEnv(featureValue);
  }

  return parseBooleanEnv(import.meta.env.VITE_USE_MOCKS);
};

const shouldUseMocks = resolveFeatureMockFlag(
  import.meta.env.VITE_MAP_ATLAS_USE_MOCKS,
);

export const mapAtlasDataSource: MapAtlasDataSource = shouldUseMocks
  ? mapAtlasMock
  : mapAtlasApi;
