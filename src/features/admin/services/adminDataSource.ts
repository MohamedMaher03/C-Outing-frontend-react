import { adminApi } from "../api/adminApi";
import { adminMock } from "../mocks/adminMock";
import type { AdminDataSource } from "../types/dataSource";

const parseBooleanEnv = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

const shouldUseMocks =
  parseBooleanEnv(import.meta.env.VITE_ADMIN_USE_MOCKS) ||
  parseBooleanEnv(import.meta.env.VITE_USE_MOCKS);

export const adminDataSource: AdminDataSource = shouldUseMocks
  ? adminMock
  : adminApi;
