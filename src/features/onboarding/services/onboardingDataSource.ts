import { onboardingApi } from "../api/onboardingApi";
import { onboardingMock } from "../mocks/onboardingMock";
import type { OnboardingDataSource } from "../types/dataSource";

export type { OnboardingDataSource } from "../types/dataSource";

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
  import.meta.env.VITE_ONBOARDING_USE_MOCKS,
);
export const onboardingDataSource: OnboardingDataSource = shouldUseMocks
  ? onboardingMock
  : onboardingApi;
