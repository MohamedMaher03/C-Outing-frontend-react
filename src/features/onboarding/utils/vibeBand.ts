export type VibeBand = "calm" | "balanced" | "energetic";

const VIBE_BAND_CEILINGS: readonly { upperBound: number; band: VibeBand }[] = [
  { upperBound: 30, band: "calm" },
  { upperBound: 70, band: "balanced" },
  { upperBound: 101, band: "energetic" },
];

export const resolveVibeBand = (score: number): VibeBand =>
  VIBE_BAND_CEILINGS.find(({ upperBound }) => score < upperBound)?.band ??
  "energetic";

export const VIBE_BAND_LABEL_KEYS: Record<VibeBand, string> = {
  calm: "onboarding.vibe.calm",
  balanced: "onboarding.vibe.balanced",
  energetic: "onboarding.vibe.energetic",
};

export const VIBE_SUMMARY_TITLE_KEYS: Record<VibeBand, string> = {
  calm: "onboarding.vibe.summary.calm.title",
  balanced: "onboarding.vibe.summary.balanced.title",
  energetic: "onboarding.vibe.summary.energetic.title",
};

export const VIBE_SUMMARY_DESCRIPTION_KEYS: Record<VibeBand, string> = {
  calm: "onboarding.vibe.summary.calm.description",
  balanced: "onboarding.vibe.summary.balanced.description",
  energetic: "onboarding.vibe.summary.energetic.description",
};

export const VIBE_PRESET_SCORES: Record<VibeBand, number> = {
  calm: 15,
  balanced: 50,
  energetic: 85,
};
