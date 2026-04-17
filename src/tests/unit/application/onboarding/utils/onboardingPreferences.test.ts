import {
  normalizeBudget,
  normalizeOnboardingPreferences,
  normalizePartialOnboardingPreferences,
  normalizeUserId,
  normalizeVibe,
} from "@/features/onboarding/utils/onboardingPreferences";
import {
  mapSubmitPreferences,
  mapUpdatePreferences,
} from "@/features/onboarding/mappers/onboardingMapper";

describe("onboarding preference normalization", () => {
  it("normalizes user id and throws for empty values", () => {
    expect(normalizeUserId(" user-1 ")).toBe("user-1");
    expect(() => normalizeUserId("   ")).toThrow("Missing user identity");
  });

  it("normalizes vibe and budget values", () => {
    expect(normalizeVibe(72.4)).toBe(72);
    expect(normalizeVibe(999)).toBe(100);
    expect(normalizeVibe(-4)).toBe(0);
    expect(normalizeVibe(undefined)).toBe(50);

    expect(normalizeBudget("cheap")).toBe("cheap");
    expect(normalizeBudget("invalid-budget")).toBeNull();
  });

  it("normalizes complete preferences with dedupe and validation", () => {
    const normalized = normalizeOnboardingPreferences({
      interests: [" cafes ", "Cafes", "Nightlife"],
      vibe: 61.8,
      districts: ["Maadi", "maadi", "Downtown"],
      budget: "mid_range",
    });

    expect(normalized).toEqual({
      interests: ["cafes", "Nightlife"],
      vibe: 62,
      districts: ["Maadi", "Downtown"],
      budget: "mid_range",
    });
  });

  it("throws when required preference selections are missing", () => {
    expect(() =>
      normalizeOnboardingPreferences({
        interests: ["OnlyOne"],
        vibe: 50,
        districts: ["Maadi"],
        budget: "mid_range",
      }),
    ).toThrow("at least two interests");

    expect(() =>
      normalizeOnboardingPreferences({
        interests: ["A", "B"],
        vibe: 50,
        districts: [],
        budget: "mid_range",
      }),
    ).toThrow("at least one district");

    expect(() =>
      normalizeOnboardingPreferences({
        interests: ["A", "B"],
        vibe: 50,
        districts: ["Maadi"],
        budget: null,
      }),
    ).toThrow("budget range");
  });

  it("normalizes partial preference updates and mapper wrappers", () => {
    const partial = normalizePartialOnboardingPreferences({
      interests: [" Art ", "art", "Music"],
      vibe: 43.2,
      budget: "luxury",
    });

    expect(partial).toEqual({
      interests: ["Art", "Music"],
      vibe: 43,
      budget: "luxury",
    });

    expect(
      mapSubmitPreferences({
        interests: ["Cafes", "Nightlife"],
        vibe: 75,
        districts: ["Maadi"],
        budget: "cheap",
      }),
    ).toEqual({
      interests: ["Cafes", "Nightlife"],
      vibe: 75,
      districts: ["Maadi"],
      budget: "cheap",
    });

    expect(mapUpdatePreferences({ vibe: 101 })).toEqual({ vibe: 100 });
  });
});
