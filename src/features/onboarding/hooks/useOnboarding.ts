import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitOnboardingPreferences } from "@/features/onboarding/services/onboardingService";
import type { OnboardingPreferences } from "@/features/onboarding/types";
import type { PriceLevel } from "@/features/admin/types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getErrorMessage } from "@/utils/apiError";
import {
  normalizeVibe,
  validateOnboardingPreferences,
} from "../utils/onboardingPreferences";
import { formatPreferenceValidationIssues } from "../utils/preferenceValidationI18n";
import { useI18n } from "@/components/i18n";
import { flipListMembership } from "../utils/listMembership";
import {
  canAdvanceOnboardingStep,
  ONBOARDING_LAST_STEP_INDEX,
} from "../utils/onboardingStepGate";

interface UseOnboardingReturn {
  step: number;
  selectedInterests: string[];
  vibe: number[];
  selectedDistricts: string[];
  budget: PriceLevel | null;
  selectedActivities: string[];
  selectedCompanionTypes: string[];
  isSubmitting: boolean;
  error: string | null;
  canGoNext: boolean;
  toggleInterest: (id: string) => void;
  setVibe: (value: number[]) => void;
  toggleDistrict: (district: string) => void;
  setBudget: (budget: PriceLevel) => void;
  toggleActivity: (activityId: string) => void;
  toggleCompanionType: (companionId: string) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  handleComplete: () => Promise<void>;
}

export const useOnboarding = (): UseOnboardingReturn => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const submitInFlightRef = useRef(false);

  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [vibe, setVibeState] = useState([50]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [budget, setBudgetState] = useState<PriceLevel | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedCompanionTypes, setSelectedCompanionTypes] = useState<
    string[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const toggleInterest = (id: string) => {
    clearError();
    setSelectedInterests((prev) => flipListMembership(prev, id));
  };

  const setVibe = (value: number[]) => {
    clearError();
    setVibeState([normalizeVibe(value?.[0])]);
  };

  const toggleDistrict = (district: string) => {
    clearError();
    setSelectedDistricts((prev) => flipListMembership(prev, district));
  };

  const setBudget = (nextBudget: PriceLevel) => {
    clearError();
    setBudgetState(nextBudget);
  };

  const toggleActivity = (activityId: string) => {
    clearError();
    setSelectedActivities((prev) => flipListMembership(prev, activityId));
  };

  const toggleCompanionType = (companionId: string) => {
    clearError();
    setSelectedCompanionTypes((prev) =>
      flipListMembership(prev, companionId),
    );
  };

  const canGoNext = canAdvanceOnboardingStep({
    step,
    interestCount: selectedInterests.length,
    districtCount: selectedDistricts.length,
    budget,
    activityCount: selectedActivities.length,
    companionCount: selectedCompanionTypes.length,
  });

  const goToNextStep = () => {
    if (step < ONBOARDING_LAST_STEP_INDEX && canGoNext) {
      clearError();
      setStep((prev) => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (step > 0) {
      clearError();
      setStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (submitInFlightRef.current || isSubmitting) return;

    if (!user) {
      setError(t("onboarding.error.sessionExpired"));
      return;
    }

    if (!canGoNext) {
      setError(t("onboarding.error.completeStep"));
      return;
    }

    submitInFlightRef.current = true;

    try {
      setIsSubmitting(true);
      setError(null);

      const preferences: OnboardingPreferences = {
        interests: selectedInterests,
        vibe: vibe[0],
        districts: selectedDistricts,
        budget,
        favoriteActivities: selectedActivities,
        companionTypes: selectedCompanionTypes,
      };

      const validationIssues = validateOnboardingPreferences(preferences);
      if (validationIssues.length > 0) {
        setError(
          formatPreferenceValidationIssues(validationIssues, t).join("\n"),
        );
        return;
      }

      await submitOnboardingPreferences(user.userId, preferences);
      updateUser({ ...user, hasCompletedOnboarding: true });
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err, t("onboarding.error.submitFailed")));
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  return {
    step,
    selectedInterests,
    vibe,
    selectedDistricts,
    budget,
    selectedActivities,
    selectedCompanionTypes,
    isSubmitting,
    error,
    canGoNext,
    toggleInterest,
    setVibe,
    toggleDistrict,
    setBudget,
    toggleActivity,
    toggleCompanionType,
    goToNextStep,
    goToPreviousStep,
    handleComplete,
  };
};
