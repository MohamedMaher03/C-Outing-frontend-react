import { onboardingService } from "@/features/onboarding/services/onboardingService";
import { onboardingDataSource } from "@/features/onboarding/services/onboardingDataSource";

jest.mock("@/features/onboarding/services/onboardingDataSource", () => ({
  onboardingDataSource: {
    submitPreferences: jest.fn(),
    updatePreferences: jest.fn(),
  },
}));

const mockedDataSource = onboardingDataSource as jest.Mocked<
  typeof onboardingDataSource
>;

describe("onboarding service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedDataSource.submitPreferences.mockResolvedValue(undefined);
    mockedDataSource.updatePreferences.mockResolvedValue(undefined);
  });

  it("submits normalized onboarding preferences", async () => {
    await onboardingService.submitPreferences(" user-1 ", {
      interests: ["Cafes", "Nightlife"],
      vibe: 61.4,
      districts: ["Maadi"],
      budget: "mid_range",
    });

    expect(mockedDataSource.submitPreferences).toHaveBeenCalledWith("user-1", {
      interests: ["Cafes", "Nightlife"],
      vibe: 61,
      districts: ["Maadi"],
      budget: "mid_range",
    });
  });

  it("skips datasource updates when normalized update payload is empty", async () => {
    await onboardingService.updatePreferences("user-1", {});
    expect(mockedDataSource.updatePreferences).not.toHaveBeenCalled();
  });

  it("updates partial preferences when mapped payload contains values", async () => {
    await onboardingService.updatePreferences("user-1", { vibe: 88.4 });

    expect(mockedDataSource.updatePreferences).toHaveBeenCalledWith("user-1", {
      vibe: 88,
    });
  });
});
