import type { OnboardingPreferences } from "../types";
import type { OnboardingDataSource } from "../types/dataSource";

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const onboardingMock: OnboardingDataSource = {
  async submitPreferences(_userId: string, preferences: OnboardingPreferences): Promise<void> {
    void preferences;
    await delay(500);
  },

  async updatePreferences(_userId: string, preferences: Partial<OnboardingPreferences>): Promise<void> {
    void preferences;
    await delay(300);
  },
};
