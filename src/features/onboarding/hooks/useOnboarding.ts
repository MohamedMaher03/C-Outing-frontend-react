/**
 * useOnboarding Hook
 * Manages all state and logic for the OnboardingPage
 * Separates business logic from UI components
 */

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitOnboardingPreferences } from "@/features/onboarding/services/onboardingService";
import type { OnboardingPreferences } from "@/features/onboarding/types";
import type { PriceLevel } from "@/features/admin/types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getErrorMessage } from "@/utils/apiError";
import { normalizeVibe } from "../utils/onboardingPreferences";
import { useI18n } from "@/components/i18n";

interface UseOnboardingReturn {
  // State
  step: number;
  selectedInterests: string[];
  vibe: number[];
  selectedDistricts: string[];
  budget: PriceLevel | null;
  isSubmitting: boolean;
  error: string | null;

  // Validation
  canGoNext: boolean;

  // Actions
  toggleInterest: (id: string) => void;
  setVibe: (value: number[]) => void;
  toggleDistrict: (district: string) => void;
  setBudget: (budget: PriceLevel) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  handleComplete: () => Promise<void>;
}

/**
 * Custom hook for onboarding page logic
 */
export const useOnboarding = (): UseOnboardingReturn => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const submitInFlightRef = useRef(false);

  // State management
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [vibe, setVibeState] = useState([50]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [budget, setBudgetState] = useState<PriceLevel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => {
    setError((prev) => (prev ? null : prev));
  };

  // Toggle interest selection
  const toggleInterest = (id: string) => {
    clearError();
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const setVibe = (value: number[]) => {
    clearError();
    const nextVibe = normalizeVibe(value?.[0]);
    setVibeState([nextVibe]);
  };

  // Toggle district selection
  const toggleDistrict = (district: string) => {
    clearError();
    setSelectedDistricts((prev) =>
      prev.includes(district)
        ? prev.filter((d) => d !== district)
        : [...prev, district],
    );
  };

  const setBudget = (nextBudget: PriceLevel) => {
    clearError();
    setBudgetState(nextBudget);
  };

  // Validation for each step
  const canGoNext =
    (step === 0 && selectedInterests.length >= 2) ||
    step === 1 ||
    (step === 2 && selectedDistricts.length >= 1) ||
    (step === 3 && budget !== null);

  // Navigate to next step
  const goToNextStep = () => {
    if (step < 3 && canGoNext) {
      clearError();
      setStep((prev) => prev + 1);
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (step > 0) {
      clearError();
      setStep((prev) => prev - 1);
    }
  };

  // Complete onboarding and submit preferences
  const handleComplete = async () => {
    if (submitInFlightRef.current || isSubmitting) {
      return;
    }

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
      };

      await submitOnboardingPreferences(user.userId, preferences);

      // Mark onboarding as completed in context + localStorage so the
      // ProtectedRoute no longer redirects back to /onboarding
      updateUser({ ...user, hasCompletedOnboarding: true });

      // Navigate to home page after successful submission
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err, t("onboarding.error.submitFailed")));
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  return {
    // State
    step,
    selectedInterests,
    vibe,
    selectedDistricts,
    budget,
    isSubmitting,
    error,

    // Validation
    canGoNext,

    // Actions
    toggleInterest,
    setVibe,
    toggleDistrict,
    setBudget,
    goToNextStep,
    goToPreviousStep,
    handleComplete,
  };
};
