import { userApi } from "../api/userApi";
import { usersMock } from "../mocks/usersMock";
import type { UsersDataSource } from "../types/dataSource";

export type { UsersDataSource } from "../types/dataSource";

const parseBooleanEnv = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
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
  import.meta.env.VITE_USERS_USE_MOCKS,
);
export const usersDataSource: UsersDataSource = shouldUseMocks
  ? usersMock
  : userApi;
