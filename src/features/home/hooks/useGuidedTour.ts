import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { TOUR_STEPS } from "@/features/home/components/GuidedTour/tourSteps";

const TOUR_STORAGE_KEY = "couting_tour_seen";
/** Delay before showing the tour so the page finishes its initial paint/layout */
const TOUR_START_DELAY_MS = 700;

export const useGuidedTour = () => {
  const { user, updateUser } = useAuth();
  const [tourActive, setTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = useMemo(() => TOUR_STEPS.length, []);

  // Auto-start the tour once for first-time users
  useEffect(() => {
    if (!user || typeof window === "undefined") {
      // Defer clearing tourActive to avoid synchronous setState inside effect
      Promise.resolve().then(() => setTourActive((p) => (p ? false : p)));
      return;
    }

    const hasSeenTour = window.localStorage.getItem(TOUR_STORAGE_KEY);
    if (!hasSeenTour) {
      const tid = window.setTimeout(() => {
        setTourActive(true);
        setCurrentStep(0);
      }, TOUR_START_DELAY_MS);
      return () => window.clearTimeout(tid);
    }
  }, [user, tourActive]);

  // NOTE: We no longer lock <html> scroll.
  // Scroll control is handled inside GuidedTour.tsx per-step:
  // it scrolls the target element into the visible area above the
  // bottom panel before measuring. This lets users orient themselves
  // visually and is far less disorienting than a hard body lock.

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

  /** Go back one step (never below 0) */
  const prev = useCallback(() => {
    setCurrentStep((p) => Math.max(0, p - 1));
  }, []);

  /** Jump directly to any step by index */
  const jumpTo = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps],
  );

  return {
    tourActive,
    currentStep,
    totalSteps,
    next,
    prev,
    skip,
    finish,
    jumpTo,
  };
};
