import { useCallback, useId, useMemo, useState } from "react";
import { useI18n } from "@/components/i18n";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { POPULAR_DISTRICTS } from "@/mocks/mockData";
import { BUDGET_OPTIONS, ONBOARDING_STEPS } from "@/features/onboarding/mocks";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import {
  buildDistrictLookup,
  filterDistrictsByQuery,
  paginateItems,
} from "@/features/onboarding/utils/districtBrowse";
import {
  buildOnboardingStepLabels,
  buildOnboardingTrackerSelections,
  buildOnboardingVibeCopy,
} from "@/features/onboarding/utils/onboardingPresentation";
import { createPreferenceLabelResolvers } from "@/features/onboarding/utils/preferenceLabels";
import {
  isOnboardingFinalStep,
  ONBOARDING_LAST_STEP_INDEX,
} from "@/features/onboarding/utils/onboardingStepGate";
import {
  remainingSelectionQuota,
  toSelectionSet,
} from "@/features/onboarding/utils/listMembership";
import { resolveVibeBand } from "@/features/onboarding/utils/vibeBand";

const ONBOARDING_DISTRICT_PAGE_SIZE = 12;

export const useOnboardingPage = () => {
  const { t, formatNumber } = useI18n();
  const { logoutUser, isLoading: isLoggingOut } = useLogout();
  const onboarding = useOnboarding();

  const [districtSearch, setDistrictSearch] = useState("");
  const [districtPage, setDistrictPage] = useState(1);

  const accessibilityIds = {
    vibeHeading: useId(),
    vibeHint: useId(),
    vibeValue: useId(),
    interestsLegend: useId(),
    interestsHint: useId(),
    districtsLegend: useId(),
    districtsHint: useId(),
    budgetLegend: useId(),
    budgetHint: useId(),
    activitiesLegend: useId(),
    activitiesHint: useId(),
    companionsLegend: useId(),
    companionsHint: useId(),
    progressDescription: useId(),
  };

  const labels = useMemo(() => createPreferenceLabelResolvers(t), [t]);
  const localizedStepLabels = useMemo(() => buildOnboardingStepLabels(t), [t]);
  const districtLookup = useMemo(
    () => buildDistrictLookup(POPULAR_DISTRICTS),
    [],
  );

  const filteredDistricts = useMemo(
    () =>
      filterDistrictsByQuery(
        POPULAR_DISTRICTS,
        districtSearch,
        labels.district,
      ),
    [districtSearch, labels.district],
  );

  const districtBrowse = useMemo(
    () =>
      paginateItems(
        filteredDistricts,
        districtPage,
        ONBOARDING_DISTRICT_PAGE_SIZE,
      ),
    [filteredDistricts, districtPage],
  );

  const vibeScore = onboarding.vibe[0];
  const vibeBand = resolveVibeBand(vibeScore);
  const vibeCopy = useMemo(
    () => buildOnboardingVibeCopy(t, vibeBand),
    [t, vibeBand],
  );

  const selectedBudgetLabel =
    onboarding.budget !== null ? labels.budget(onboarding.budget) : null;

  const selectionSets = useMemo(
    () => ({
      interests: toSelectionSet(onboarding.selectedInterests),
      districts: toSelectionSet(onboarding.selectedDistricts),
      activities: toSelectionSet(onboarding.selectedActivities),
      companions: toSelectionSet(onboarding.selectedCompanionTypes),
    }),
    [
      onboarding.selectedActivities,
      onboarding.selectedCompanionTypes,
      onboarding.selectedDistricts,
      onboarding.selectedInterests,
    ],
  );

  const selectionQuotas = {
    interests: remainingSelectionQuota(onboarding.selectedInterests.length, 2),
    districts: remainingSelectionQuota(onboarding.selectedDistricts.length, 1),
    activities: remainingSelectionQuota(onboarding.selectedActivities.length, 1),
    companions: remainingSelectionQuota(
      onboarding.selectedCompanionTypes.length,
      1,
    ),
  };

  const trackerSelections = useMemo(
    () =>
      buildOnboardingTrackerSelections(t, labels, {
        interestIds: onboarding.selectedInterests,
        districtNames: onboarding.selectedDistricts,
        vibeBandLabel: vibeCopy.bandLabel,
        budget: onboarding.budget,
        activityIds: onboarding.selectedActivities,
        companionIds: onboarding.selectedCompanionTypes,
      }, POPULAR_DISTRICTS),
    [
      t,
      labels,
      onboarding.selectedInterests,
      onboarding.selectedDistricts,
      vibeCopy.bandLabel,
      onboarding.budget,
      onboarding.selectedActivities,
      onboarding.selectedCompanionTypes,
    ],
  );

  const currentStepLabel =
    localizedStepLabels[onboarding.step] ?? localizedStepLabels[0];
  const isFinalStep = isOnboardingFinalStep(onboarding.step);

  const applyDistrictSearch = useCallback((value: string) => {
    setDistrictSearch(value);
    setDistrictPage(1);
  }, []);

  const shiftDistrictPage = useCallback(
    (delta: number) => {
      setDistrictPage((current) =>
        Math.min(
          districtBrowse.totalPages,
          Math.max(1, current + delta),
        ),
      );
    },
    [districtBrowse.totalPages],
  );

  const advanceOrComplete = useCallback(async () => {
    if (onboarding.step < ONBOARDING_LAST_STEP_INDEX) {
      onboarding.goToNextStep();
      return;
    }
    await onboarding.handleComplete();
  }, [onboarding]);

  const signOutFromOnboarding = useCallback(async () => {
    await logoutUser();
  }, [logoutUser]);

  return {
    t,
    formatNumber,
    ...onboarding,
    ...accessibilityIds,
    isLoggingOut,
    localizedStepLabels,
    currentStepLabel,
    isFinalStep,
    stepCount: ONBOARDING_STEPS.length,
    labels,
    districtLookup,
    districtSearch,
    applyDistrictSearch,
    districtBrowse,
    shiftDistrictPage,
    vibeScore,
    vibeBand,
    vibeCopy,
    selectedBudgetLabel,
    selectionSets,
    selectionQuotas,
    trackerSelections,
    budgetOptions: BUDGET_OPTIONS,
    advanceOrComplete,
    signOutFromOnboarding,
  };
};
