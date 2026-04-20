import { userApi } from "../api/userApi";
import { usersMock } from "../mocks/usersMock";
import type { UsersDataSource } from "../types/dataSource";
import { selectDataSource } from "@/utils/dataSourceResolver";

export type { UsersDataSource } from "../types/dataSource";

export const usersDataSource: UsersDataSource = selectDataSource(
  import.meta.env.VITE_USERS_USE_MOCKS,
  usersMock,
  userApi,
);
