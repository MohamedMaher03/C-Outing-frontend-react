import { ApiError } from "@/utils/apiError";
import {
  getUserPreferences,
  getUserProfile,
  updateUserPreferences,
} from "@/features/profile/services/profileService";
import { profileDataSource } from "@/features/profile/services/profileDataSource";

jest.mock("@/features/profile/services/profileDataSource", () => ({
  profileDataSource: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    getPreferences: jest.fn(),
    updatePreferences: jest.fn(),
    getNotifications: jest.fn(),
    updateNotifications: jest.fn(),
    getPrivacy: jest.fn(),
    updatePrivacy: jest.fn(),
    downloadData: jest.fn(),
    deleteAccount: jest.fn(),
    signOut: jest.fn(),
  },
}));

const mockedProfileDataSource = profileDataSource as jest.Mocked<
  typeof profileDataSource
>;

describe("profileService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    localStorage.setItem(
      "authUser",
      JSON.stringify({ userId: "u99", name: "Maher" }),
    );

    mockedProfileDataSource.getProfile.mockResolvedValue({
      id: "u99",
      email: "maher@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    } as never);

    mockedProfileDataSource.getPreferences.mockResolvedValue({
      interests: ["Cafes"],
      vibe: 60,
      districts: ["Maadi"],
      budget: "cheap",
    } as never);

    mockedProfileDataSource.updatePreferences.mockResolvedValue({
      interests: ["Cafes", "Music"],
      vibe: 70,
      districts: ["Maadi"],
      budget: "mid_range",
    } as never);
  });

  it("normalizes profile data with fallback user name", async () => {
    const profile = await getUserProfile();

    expect(profile.name).toBe("Maher");
    expect(profile.email).toBe("maher@example.com");
  });

  it("returns safe default preferences when backend endpoint is missing", async () => {
    mockedProfileDataSource.getPreferences.mockRejectedValueOnce(
      new ApiError("Not found", 404),
    );

    const preferences = await getUserPreferences();

    expect(preferences).toEqual({
      interests: [],
      vibe: 50,
      districts: [],
      budget: "mid_range",
    });
  });

  it("skips update endpoint when update payload is empty", async () => {
    const preferences = await updateUserPreferences({});

    expect(mockedProfileDataSource.updatePreferences).not.toHaveBeenCalled();
    expect(preferences.budget).toBe("cheap");
  });
});
