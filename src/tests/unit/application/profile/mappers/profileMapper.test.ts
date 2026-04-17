import { buildDefaultAvatarDataUrl } from "@/features/profile/utils/defaultAvatar";
import {
  mapEditProfileToUpdatePayload,
  mapPreferenceUpdatePayload,
  normalizeBirthDateForInput,
  normalizeNotificationSettings,
  normalizePreferences,
  normalizePrivacySettings,
  normalizeProfile,
} from "@/features/profile/mappers/profileMapper";

describe("profile mapper", () => {
  it("normalizes birth dates and user profile defaults", () => {
    const today = new Date().toISOString().slice(0, 10);

    expect(normalizeBirthDateForInput(undefined)).toBe(today);
    expect(normalizeBirthDateForInput("bad-date")).toBe(today);
    expect(normalizeBirthDateForInput("0000-01-01")).toBe(today);

    const profile = normalizeProfile(
      {
        id: "1",
        email: " user@example.com ",
        name: "   ",
        age: -5,
      } as never,
      "Fallback Name",
    );

    expect(profile.name).toBe("Guest User");
    expect(profile.email).toBe("user@example.com");
    expect(profile.age).toBe(0);
    expect(profile.bio).toBe("");
  });

  it("maps and sanitizes profile update payloads", () => {
    const payload = mapEditProfileToUpdatePayload({
      name: "  Jane Doe  ",
      bio: "  Profile bio  ",
      phoneNumber: "  +201234567890  ",
      birthDate: "2000-05-10",
    });

    expect(payload).toEqual({
      name: "Jane Doe",
      bio: "Profile bio",
      phoneNumber: "+201234567890",
      birthDate: "2000-05-10",
    });
  });

  it("normalizes preferences and partial preference updates", () => {
    const preferences = normalizePreferences({
      interests: [" Cafes ", "cafes", "Nightlife"],
      vibe: 73.8,
      districts: ["Maadi", "maadi", "Downtown"],
      budget: "luxury",
    });

    expect(preferences).toEqual({
      interests: ["Cafes", "Nightlife"],
      vibe: 74,
      districts: ["Maadi", "Downtown"],
      budget: "luxury",
    });

    const update = mapPreferenceUpdatePayload({
      vibe: 45,
      budget: "cheap",
    });

    expect(update).toEqual({
      vibe: 45,
      budget: "cheap",
    });
  });

  it("fills notification and privacy settings defaults", () => {
    const notificationSettings = normalizeNotificationSettings({
      push: { recommendations: false },
    } as never);

    expect(notificationSettings.push.recommendations).toBe(false);
    expect(notificationSettings.push.favorites).toBe(true);
    expect(notificationSettings.email.monthlyDigest).toBe(true);

    const privacySettings = normalizePrivacySettings({
      showFavorites: true,
    });

    expect(privacySettings).toEqual({
      showFavorites: true,
      showActivity: true,
      dataCollection: true,
      personalization: true,
    });
  });

  it("builds profile default avatar data url", () => {
    const avatarUrl = buildDefaultAvatarDataUrl("John");
    expect(avatarUrl.startsWith("data:image/svg+xml;utf8,")).toBe(true);
    expect(avatarUrl).toContain("svg");
  });
});
