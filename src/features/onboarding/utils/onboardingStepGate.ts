import type { PriceLevel } from "@/features/admin/types";

export const ONBOARDING_LAST_STEP_INDEX = 5;

export interface OnboardingStepSnapshot {
  step: number;
  interestCount: number;
  districtCount: number;
  budget: PriceLevel | null;
  activityCount: number;
  companionCount: number;
}

type StepAdvanceRule = (snapshot: OnboardingStepSnapshot) => boolean;

const STEP_ADVANCE_RULES: Record<number, StepAdvanceRule> = {
  0: ({ interestCount }) => interestCount >= 2,
  1: () => true,
  2: ({ districtCount }) => districtCount >= 1,
  3: ({ budget }) => budget !== null,
  4: ({ activityCount }) => activityCount >= 1,
  5: ({ companionCount }) => companionCount >= 1,
};

export const canAdvanceOnboardingStep = (
  snapshot: OnboardingStepSnapshot,
): boolean => STEP_ADVANCE_RULES[snapshot.step]?.(snapshot) ?? false;

export const isOnboardingFinalStep = (step: number): boolean =>
  step >= ONBOARDING_LAST_STEP_INDEX;
