import { moderatorApi } from "../api/moderatorApi";
import { moderatorMock } from "../mocks/moderatorMock";
import type { ModeratorDataSource } from "../types/dataSource";
import { selectDataSource } from "@/utils/dataSourceResolver";

export const moderatorDataSource: ModeratorDataSource = selectDataSource(
  import.meta.env.VITE_MODERATOR_USE_MOCKS,
  moderatorMock,
  moderatorApi,
);
