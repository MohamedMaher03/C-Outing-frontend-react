type DataSourceCase = {
  modulePath: string;
  dataSourceExport: string;
  apiModulePath: string;
  apiExport: string;
  mockModulePath: string;
  mockExport: string;
  featureEnvKey: string;
};

const CASES: DataSourceCase[] = [
  {
    modulePath: "@/features/favorites/services/favoritesDataSource",
    dataSourceExport: "favoritesDataSource",
    apiModulePath: "@/features/favorites/api/favoritesApi",
    apiExport: "favoritesApi",
    mockModulePath: "@/features/favorites/mocks",
    mockExport: "favoritesMock",
    featureEnvKey: "VITE_FAVORITES_USE_MOCKS",
  },
  {
    modulePath: "@/features/notifications/services/notificationsDataSource",
    dataSourceExport: "notificationsDataSource",
    apiModulePath: "@/features/notifications/api/notificationsApi",
    apiExport: "notificationsApi",
    mockModulePath: "@/features/notifications/mocks",
    mockExport: "notificationsMock",
    featureEnvKey: "VITE_NOTIFICATIONS_USE_MOCKS",
  },
  {
    modulePath: "@/features/onboarding/services/onboardingDataSource",
    dataSourceExport: "onboardingDataSource",
    apiModulePath: "@/features/onboarding/api/onboardingApi",
    apiExport: "onboardingApi",
    mockModulePath: "@/features/onboarding/mocks/onboardingMock",
    mockExport: "onboardingMock",
    featureEnvKey: "VITE_ONBOARDING_USE_MOCKS",
  },
  {
    modulePath: "@/features/profile/services/profileDataSource",
    dataSourceExport: "profileDataSource",
    apiModulePath: "@/features/profile/api/profileApi",
    apiExport: "profileApi",
    mockModulePath: "@/features/profile/mocks/profileMock",
    mockExport: "profileMock",
    featureEnvKey: "VITE_PROFILE_USE_MOCKS",
  },
  {
    modulePath: "@/features/users/services/userDataSource",
    dataSourceExport: "usersDataSource",
    apiModulePath: "@/features/users/api/userApi",
    apiExport: "userApi",
    mockModulePath: "@/features/users/mocks/usersMock",
    mockExport: "usersMock",
    featureEnvKey: "VITE_USERS_USE_MOCKS",
  },
  {
    modulePath: "@/features/place-detail/services/placeDetailDataSource",
    dataSourceExport: "placeDetailDataSource",
    apiModulePath: "@/features/place-detail/api/placeDetailApi",
    apiExport: "placeDetailApi",
    mockModulePath: "@/features/place-detail/mocks/placeDetailMock",
    mockExport: "placeDetailMock",
    featureEnvKey: "VITE_PLACE_DETAIL_USE_MOCKS",
  },
  {
    modulePath: "@/features/admin/services/adminDataSource",
    dataSourceExport: "adminDataSource",
    apiModulePath: "@/features/admin/api/adminApi",
    apiExport: "adminApi",
    mockModulePath: "@/features/admin/mocks/adminMock",
    mockExport: "adminMock",
    featureEnvKey: "VITE_ADMIN_USE_MOCKS",
  },
  {
    modulePath: "@/features/moderator/services/moderatorDataSource",
    dataSourceExport: "moderatorDataSource",
    apiModulePath: "@/features/moderator/api/moderatorApi",
    apiExport: "moderatorApi",
    mockModulePath: "@/features/moderator/mocks/moderatorMock",
    mockExport: "moderatorMock",
    featureEnvKey: "VITE_MODERATOR_USE_MOCKS",
  },
];

const clearFeatureEnv = (featureEnvKey: string) => {
  delete process.env.VITE_USE_MOCKS;
  delete process.env[featureEnvKey];
};

const loadSelection = async (
  testCase: DataSourceCase,
  featureEnvValue?: string,
  globalEnvValue?: string,
): Promise<{ dataSource: unknown; api: unknown; mock: unknown }> => {
  jest.resetModules();
  clearFeatureEnv(testCase.featureEnvKey);

  if (featureEnvValue !== undefined) {
    process.env[testCase.featureEnvKey] = featureEnvValue;
  }

  if (globalEnvValue !== undefined) {
    process.env.VITE_USE_MOCKS = globalEnvValue;
  }

  const mockedApi = { source: "api" };
  const mockedMock = { source: "mock" };

  jest.doMock(testCase.apiModulePath, () => ({
    [testCase.apiExport]: mockedApi,
  }));
  jest.doMock(testCase.mockModulePath, () => ({
    [testCase.mockExport]: mockedMock,
  }));

  const dsModule = (await import(testCase.modulePath)) as Record<
    string,
    unknown
  >;
  const apiModule = (await import(testCase.apiModulePath)) as Record<
    string,
    unknown
  >;
  const mockModule = (await import(testCase.mockModulePath)) as Record<
    string,
    unknown
  >;

  return {
    dataSource: dsModule[testCase.dataSourceExport],
    api: apiModule[testCase.apiExport],
    mock: mockModule[testCase.mockExport],
  };
};

describe("feature datasource selection", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it.each(CASES)("uses api by default for $modulePath", async (testCase) => {
    const selection = await loadSelection(testCase);
    expect(selection.dataSource).toBe(selection.api);
  });

  it.each(CASES)(
    "uses feature mock when env flag is true for $modulePath",
    async (testCase) => {
      const selection = await loadSelection(testCase, "true");
      expect(selection.dataSource).toBe(selection.mock);
    },
  );

  it.each(CASES)(
    "falls back to global mock flag when feature flag is unset for $modulePath",
    async (testCase) => {
      const selection = await loadSelection(testCase, undefined, "yes");
      expect(selection.dataSource).toBe(selection.mock);
    },
  );
});
