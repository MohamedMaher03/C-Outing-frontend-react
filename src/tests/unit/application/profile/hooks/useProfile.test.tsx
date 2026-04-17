import { act, renderHook, waitFor } from "@testing-library/react";
import { useProfile } from "@/features/profile/hooks/useProfile";
import {
  getUserPreferences,
  getUserProfile,
  signOut,
  updateUserPreferences,
} from "@/features/profile/services/profileService";

const mockT = (key: string) => key;

jest.mock("@/features/profile/services/profileService", () => ({
  getUserProfile: jest.fn(),
  getUserPreferences: jest.fn(),
  updateUserPreferences: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("@/components/i18n", () => ({
  useI18n: () => ({
    t: mockT,
  }),
}));

const mockedGetUserProfile = getUserProfile as jest.MockedFunction<
  typeof getUserProfile
>;
const mockedGetUserPreferences = getUserPreferences as jest.MockedFunction<
  typeof getUserPreferences
>;
const mockedUpdateUserPreferences =
  updateUserPreferences as jest.MockedFunction<typeof updateUserPreferences>;
const mockedSignOut = signOut as jest.MockedFunction<typeof signOut>;

describe("useProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetUserProfile.mockResolvedValue({
      id: "u1",
      name: "Maher",
      email: "maher@example.com",
      bio: "Bio",
      phoneNumber: "0123",
      birthDate: "2000-01-01",
      age: 25,
      role: 0,
      totalInteractions: 8,
      isBanned: false,
      isEmailVerified: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    } as never);

    mockedGetUserPreferences.mockResolvedValue({
      interests: ["Cafes"],
      vibe: 60,
      districts: ["Maadi"],
      budget: "cheap",
    } as never);

    mockedUpdateUserPreferences.mockResolvedValue({
      interests: ["Cafes", "Music"],
      vibe: 70,
      districts: ["Maadi"],
      budget: "mid_range",
    } as never);

    mockedSignOut.mockResolvedValue(undefined);
  });

  it("loads profile and preference state on mount", async () => {
    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile?.name).toBe("Maher");
    expect(result.current.selectedInterests).toEqual(["Cafes"]);
    expect(result.current.selectedBudget).toBe("cheap");
  });

  it("saves updated preferences through service", async () => {
    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.toggleInterest("Music");
      result.current.setSelectedBudget("mid_range");
    });

    await act(async () => {
      await result.current.savePreferences();
    });

    expect(mockedUpdateUserPreferences).toHaveBeenCalledWith({
      interests: ["Cafes", "Music"],
      vibe: 60,
      districts: ["Maadi"],
      budget: "mid_range",
    });
  });

  it("clears local state after sign-out", async () => {
    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleSignOut();
    });

    expect(mockedSignOut).toHaveBeenCalledTimes(1);
    expect(result.current.profile).toBeNull();
  });
});
