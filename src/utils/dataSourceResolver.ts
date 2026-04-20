import { resolveFeatureMockFlag } from "./featureFlags";

export const selectDataSource = <T>(
  featureMockFlag: unknown,
  mockDataSource: T,
  apiDataSource: T,
  globalMockFlag: unknown = import.meta.env.VITE_USE_MOCKS,
): T => {
  const shouldUseMocks = resolveFeatureMockFlag(
    featureMockFlag,
    globalMockFlag,
  );
  return shouldUseMocks ? mockDataSource : apiDataSource;
};
