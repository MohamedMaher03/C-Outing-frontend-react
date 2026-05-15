import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { TOUR_STEPS } from "@/features/home/components/GuidedTour/tourSteps";

const TOUR_STORAGE_KEY = "couting_tour_seen";

export const useGuidedTour = () => {
  const { user, updateUser } = useAuth();
  const [tourActive, setTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = useMemo(() => TOUR_STEPS.length, []);

  useEffect(() => {
    if (!user || typeof window === "undefined") {
      setTourActive(false);
      return;
    }

    const hasSeenTour = window.localStorage.getItem(TOUR_STORAGE_KEY);
    if (!hasSeenTour) {
      setTourActive(true);
      setCurrentStep(0);
    }
  }, [user]);

  const markTourSeen = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOUR_STORAGE_KEY, "true");
    }
  }, []);

  const skip = useCallback(() => {
    markTourSeen();
    setTourActive(false);
    setCurrentStep(0);
  }, [markTourSeen]);

  const finish = useCallback(() => {
    markTourSeen();
    if (user) {
      updateUser({ ...user, hasCompletedOnboarding: true });
    }
    setTourActive(false);
    setCurrentStep(0);
  }, [markTourSeen, updateUser, user]);

  const next = useCallback(() => {
    setCurrentStep((prev) => {
      const nextStep = prev + 1;
      if (nextStep >= totalSteps) {
        finish();
        return prev;
      }
      return nextStep;
    });
  }, [finish, totalSteps]);

  return {
    tourActive,
    currentStep,
    totalSteps,
    next,
    skip,
    finish,
  };
};
