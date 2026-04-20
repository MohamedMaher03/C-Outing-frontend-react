import { onboardingApi } from "../api/onboardingApi";
import { onboardingMock } from "../mocks/onboardingMock";
import type { OnboardingDataSource } from "../types/dataSource";
import { selectDataSource } from "@/utils/dataSourceResolver";

export type { OnboardingDataSource } from "../types/dataSource";

export const onboardingDataSource: OnboardingDataSource = selectDataSource(
  import.meta.env.VITE_ONBOARDING_USE_MOCKS,
  onboardingMock,
  onboardingApi,
);
