import { profileApi } from "../api/profileApi";
import { profileMock } from "../mocks/profileMock";
import type { ProfileDataSource } from "../types/dataSource";
import { selectDataSource } from "@/utils/dataSourceResolver";

export type { ProfileDataSource } from "../types/dataSource";

export const profileDataSource: ProfileDataSource = selectDataSource(
  import.meta.env.VITE_PROFILE_USE_MOCKS,
  profileMock,
  profileApi,
);
