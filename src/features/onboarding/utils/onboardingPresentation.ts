import type { District } from "@/mocks/mockData";
import {
  COMPANION_TYPES,
  FAVORITE_ACTIVITIES,
} from "@/features/onboarding/mocks";
import { INTERESTS } from "@/mocks/mockData";
import type { PriceLevel } from "@/features/admin/types";
import type { VibeBand } from "./vibeBand";
import {
  VIBE_BAND_LABEL_KEYS,
  VIBE_SUMMARY_DESCRIPTION_KEYS,
  VIBE_SUMMARY_TITLE_KEYS,
} from "./vibeBand";
import type { PreferenceLabelResolvers } from "./preferenceLabels";
import { joinLocalizedLabels } from "./preferenceLabels";
import {
  buildDistrictLookup,
  resolveDistrictRecord,
} from "./districtBrowse";

type TranslateFn = (
  key: string,
  params?: Record<string, string | number>,
  fallback?: string,
) => string;

const INTEREST_LABEL_BY_ID = new Map(
  INTERESTS.map((interest) => [interest.id, interest.label]),
);

const ACTIVITY_LABEL_BY_ID = new Map(
  FAVORITE_ACTIVITIES.map((activity) => [activity.id, activity.label]),
);

const COMPANION_LABEL_BY_ID = new Map(
  COMPANION_TYPES.map((companion) => [companion.id, companion.label]),
);

export interface OnboardingTrackerEntry {
  label: string;
  value: string;
}

export interface OnboardingVibeCopy {
  bandLabel: string;
  summaryTitle: string;
  summaryDescription: string;
}

export const buildOnboardingStepLabels = (t: TranslateFn): string[] => [
  t("onboarding.step.interests"),
  t("onboarding.step.vibe"),
  t("onboarding.step.areas"),
  t("onboarding.step.budget"),
  t("onboarding.step.activities"),
  t("onboarding.step.companions"),
];

export const buildOnboardingVibeCopy = (
  t: TranslateFn,
  vibeBand: VibeBand,
): OnboardingVibeCopy => ({
  bandLabel: t(VIBE_BAND_LABEL_KEYS[vibeBand]),
  summaryTitle: t(VIBE_SUMMARY_TITLE_KEYS[vibeBand]),
  summaryDescription: t(VIBE_SUMMARY_DESCRIPTION_KEYS[vibeBand]),
});

export const buildOnboardingTrackerSelections = (
  t: TranslateFn,
  labels: PreferenceLabelResolvers,
  selections: {
    interestIds: readonly string[];
    districtNames: readonly string[];
    vibeBandLabel: string;
    budget: PriceLevel | null;
    activityIds: readonly string[];
    companionIds: readonly string[];
  },
  districts: readonly District[],
): OnboardingTrackerEntry[] => {
  const districtLookup = buildDistrictLookup(districts);

  const interestSummary = joinLocalizedLabels(
    selections.interestIds,
    (id) =>
      labels.interest(id, INTEREST_LABEL_BY_ID.get(id) ?? id),
  );

  const districtSummary = selections.districtNames
    .map((name) =>
      labels.district(resolveDistrictRecord(districtLookup, name)),
    )
    .join(", ");

  const activitySummary = joinLocalizedLabels(
    selections.activityIds,
    (id) =>
      labels.activity(id, ACTIVITY_LABEL_BY_ID.get(id) ?? id),
  );

  const companionSummary = joinLocalizedLabels(
    selections.companionIds,
    (id) =>
      labels.companion(id, COMPANION_LABEL_BY_ID.get(id) ?? id),
  );

  const budgetLabel = selections.budget
    ? labels.budget(selections.budget)
    : null;

  return [
    {
      label: t("onboarding.selection.interests"),
      value:
        interestSummary.length > 0
          ? interestSummary
          : t("onboarding.selection.noneInterests"),
    },
    {
      label: t("onboarding.selection.districts"),
      value:
        districtSummary.length > 0
          ? districtSummary
          : t("onboarding.selection.noneDistricts"),
    },
    {
      label: t("onboarding.selection.vibe"),
      value: selections.vibeBandLabel,
    },
    {
      label: t("onboarding.selection.budget"),
      value: budgetLabel ?? t("onboarding.selection.pending"),
    },
    {
      label: t("onboarding.selection.activities"),
      value:
        activitySummary.length > 0
          ? activitySummary
          : t("onboarding.selection.noneActivities"),
    },
    {
      label: t("onboarding.selection.companions"),
      value:
        companionSummary.length > 0
          ? companionSummary
          : t("onboarding.selection.noneCompanions"),
    },
  ];
};

export const splitMultilineMessage = (message: string | null): string[] =>
  message?.includes("\n") ? message.split("\n") : [];

export const isMultilineMessage = (message: string): boolean =>
  message.includes("\n");
