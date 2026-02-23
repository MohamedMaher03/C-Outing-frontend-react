/**
 * useOnboarding Hook
 * Manages all state and logic for the OnboardingPage
 * Separates business logic from UI components
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitOnboardingPreferences } from "@/features/onboarding/services/onboardingService";
import type { OnboardingPreferences } from "@/features/onboarding/types";
import { useAuth } from "@/features/auth/context/AuthContext";

interface UseOnboardingReturn {
  // State
  step: number;
  selectedInterests: string[];
  vibe: number[];
  selectedDistricts: string[];
  budget: string | null;
  isSubmitting: boolean;
  error: string | null;

  // Validation
  canGoNext: boolean;

  // Actions
  toggleInterest: (id: string) => void;
  setVibe: (value: number[]) => void;
  toggleDistrict: (district: string) => void;
  setBudget: (budget: string) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  handleComplete: () => Promise<void>;
}

/**
 * Custom hook for onboarding page logic
 */
export const useOnboarding = (): UseOnboardingReturn => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [vibe, setVibe] = useState([50]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [budget, setBudget] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle interest selection
  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Toggle district selection
  const toggleDistrict = (district: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(district)
        ? prev.filter((d) => d !== district)
        : [...prev, district],
    );
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
      setStep((prev) => prev + 1);
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  // Complete onboarding and submit preferences
  const handleComplete = async () => {
    if (!canGoNext || !user) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const preferences: OnboardingPreferences = {
        interests: selectedInterests,
        vibe: vibe[0],
        districts: selectedDistricts,
        budget: budget as "Low" | "Medium" | "High" | null,
      };

      await submitOnboardingPreferences(user.userId, preferences);

      // Navigate to home page after successful submission
      navigate("/home");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit preferences",
      );
    } finally {
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
