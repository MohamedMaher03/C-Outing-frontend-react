import { adminApi } from "../api/adminApi";
import { adminMock } from "../mocks/adminMock";
import type { AdminDataSource } from "../types/dataSource";
import { selectDataSource } from "@/utils/dataSourceResolver";

export const adminDataSource: AdminDataSource = selectDataSource(
  import.meta.env.VITE_ADMIN_USE_MOCKS,
  adminMock,
  adminApi,
);
