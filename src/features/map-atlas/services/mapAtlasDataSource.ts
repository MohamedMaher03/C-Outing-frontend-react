import { mapAtlasApi } from "@/features/map-atlas/api/mapAtlasApi";
import { mapAtlasMock } from "@/features/map-atlas/mocks";
import type { MapAtlasDataSource } from "@/features/map-atlas/types/dataSource";
import { selectDataSource } from "@/utils/dataSourceResolver";

export type { MapAtlasDataSource } from "@/features/map-atlas/types/dataSource";

export const mapAtlasDataSource: MapAtlasDataSource = selectDataSource(
  import.meta.env.VITE_MAP_ATLAS_USE_MOCKS,
  mapAtlasMock,
  mapAtlasApi,
);
