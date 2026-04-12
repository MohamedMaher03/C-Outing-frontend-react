import { profileApi } from "../api/profileApi";
import { profileMock } from "../mocks/profileMock";
import type { ProfileDataSource } from "../types/dataSource";

export type { ProfileDataSource } from "../types/dataSource";

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
  import.meta.env.VITE_PROFILE_USE_MOCKS,
);

export const profileDataSource: ProfileDataSource = shouldUseMocks
  ? profileMock
  : profileApi;
