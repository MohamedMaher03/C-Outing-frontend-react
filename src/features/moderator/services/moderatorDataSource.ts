import { moderatorApi } from "../api/moderatorApi";
import { moderatorMock } from "../mocks/moderatorMock";
import type { ModeratorDataSource } from "../types/dataSource";

const parseBooleanEnv = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

const shouldUseMocks =
  parseBooleanEnv(import.meta.env.VITE_MODERATOR_USE_MOCKS) ||
  parseBooleanEnv(import.meta.env.VITE_USE_MOCKS);

export const moderatorDataSource: ModeratorDataSource = shouldUseMocks
  ? moderatorMock
  : moderatorApi;
