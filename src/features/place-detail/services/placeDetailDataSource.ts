import { placeDetailApi } from "../api/placeDetailApi";
import { placeDetailMock } from "../mocks/placeDetailMock";
import type { PlaceDetailDataSource } from "../types/dataSource";
import { selectDataSource } from "@/utils/dataSourceResolver";

export type { PlaceDetailDataSource } from "../types/dataSource";

export const placeDetailDataSource: PlaceDetailDataSource = selectDataSource(
  import.meta.env.VITE_PLACE_DETAIL_USE_MOCKS,
  placeDetailMock,
  placeDetailApi,
);
