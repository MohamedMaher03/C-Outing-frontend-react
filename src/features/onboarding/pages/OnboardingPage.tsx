import { useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Palette,
  AlertCircle,
  Moon,
  Compass,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { INTERESTS, DISTRICTS } from "@/mocks/mockData";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import {
  ONBOARDING_STEPS,
  BUDGET_OPTIONS,
  INTEREST_ICON_MAP,
} from "@/features/onboarding/mocks";
import { AuthShell, AuthSurface } from "@/components/layout/AuthShell";
import { OnboardingOptionButton } from "../components/OnboardingOptionButton";

const INTEREST_LABEL_BY_ID = new Map(
  INTERESTS.map((interest) => [interest.id, interest.label]),
);

const OnboardingPage = () => {
  const shouldReduceMotion = useReducedMotion();
  const vibeHeadingId = useId();
  const vibeHintId = useId();
  const vibeValueId = useId();
  const interestsLegendId = useId();
  const interestsHintId = useId();
  const districtsLegendId = useId();
  const districtsHintId = useId();
  const budgetLegendId = useId();
  const budgetHintId = useId();
  const progressDescriptionId = useId();

  const {
    step,
    selectedInterests,
    vibe,
    selectedDistricts,
    budget,
    isSubmitting,
    error,
    canGoNext,
    toggleInterest,
    setVibe,
    toggleDistrict,
    setBudget,
    goToNextStep,
    goToPreviousStep,
    handleComplete,
  } = useOnboarding();

  const handleNext = async () => {
    if (step < 3) {
      goToNextStep();
      return;
    }

    await handleComplete();
  };

  const currentStepLabel = ONBOARDING_STEPS[step] ?? "Step";
  const selectedBudgetLabel =
    BUDGET_OPTIONS.find((option) => option.value === budget)?.label ?? null;

  const selectedInterestsSet = new Set(selectedInterests);
  const selectedDistrictsSet = new Set(selectedDistricts);
  const vibeValue = vibe[0];
  const vibeBand =
    vibeValue < 30 ? "calm" : vibeValue < 70 ? "balanced" : "energetic";
  const vibeBandLabel =
    vibeBand === "calm"
      ? "Calm"
      : vibeBand === "balanced"
        ? "Balanced"
        : "Energetic";
  const interestsRemaining = Math.max(0, 2 - selectedInterests.length);
  const districtsRemaining = Math.max(0, 1 - selectedDistricts.length);

  const selectedInterestLabels = selectedInterests
    .map((interestId) => INTEREST_LABEL_BY_ID.get(interestId) ?? interestId)
    .join(", ");

  const selectedDistrictLabels = selectedDistricts.join(", ");

  const trackerSelections = [
    {
      label: "Interests",
      value:
        selectedInterestLabels.length > 0
          ? selectedInterestLabels
          : "No interests chosen yet",
    },
    {
      label: "Districts",
      value:
        selectedDistrictLabels.length > 0
          ? selectedDistrictLabels
          : "No districts chosen yet",
    },
    {
      label: "Vibe",
      value: vibeBandLabel,
    },
    {
      label: "Budget",
      value: selectedBudgetLabel ?? "Choose in step 4",
    },
  ];

  const vibeSummaryTitle =
    vibeBand === "calm"
      ? "Calm and Quiet"
      : vibeBand === "balanced"
        ? "Balanced and Social"
        : "Buzzing and Energetic";
  const vibeSummaryDescription =
    vibeBand === "calm"
      ? "Great for cozy cafes, riverside walks, and low-noise hangouts."
      : vibeBand === "balanced"
        ? "A mix of relaxed spots and lively places that keeps your options open."
        : "Ideal for nightlife, packed venues, and high-energy experiences.";

  return (
    <AuthShell maxWidth="4xl">
      <AuthSurface className="space-y-6 border-border/45 bg-card/90 shadow-lg backdrop-blur-sm sm:space-y-7 lg:space-y-0">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-7">
          <aside
            className="hidden lg:flex lg:items-center"
            aria-label="Onboarding context"
          >
            <Card className="w-full rounded-xl border-border/50 bg-card/60 p-4 shadow-none">
              <h3 className="text-role-caption text-foreground/80">
                Personalization tracker
              </h3>

              <ol className="mt-3 space-y-2" aria-hidden="true">
                {ONBOARDING_STEPS.map((label, index) => {
                  const isCompleted = index < step;
                  const isActive = index === step;

                  return (
                    <li key={label} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold",
                          isCompleted
                            ? "bg-primary/15 text-primary"
                            : isActive
                              ? "bg-secondary/35 text-secondary-foreground"
                              : "bg-muted/70 text-muted-foreground",
                        )}
                      >
                        {index + 1}
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          isCompleted || isActive
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {label}
                      </span>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
                <p className="text-role-caption text-foreground/70">
                  Selections
                </p>
                <dl className="space-y-2">
                  {trackerSelections.map((entry) => (
                    <div key={entry.label} className="space-y-0.5">
                      <dt className="text-role-caption text-foreground/70">
                        {entry.label}
                      </dt>
                      <dd className="text-role-secondary break-words text-foreground/90">
                        {entry.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Card>
          </aside>

          <div className="space-y-6 sm:space-y-7">
            <header className="space-y-2 text-center">
              <Badge
                variant="secondary"
                className="mx-auto rounded-full px-3 py-1 text-role-caption"
              >
                Step {step + 1} of {ONBOARDING_STEPS.length}
              </Badge>
              <h2 className="text-role-subheading text-foreground">
                Let&apos;s personalize your Cairo feed
              </h2>
              <p className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[52ch]">
                This takes less than a minute and helps us tailor better picks.
              </p>
            </header>

            <div
              className="space-y-2"
              role="progressbar"
              aria-label="Onboarding progress"
              aria-valuemin={1}
              aria-valuemax={ONBOARDING_STEPS.length}
              aria-valuenow={step + 1}
              aria-describedby={progressDescriptionId}
            >
              <div className="flex items-center justify-center gap-2">
                {ONBOARDING_STEPS.map((label, index) => (
                  <div
                    key={label}
                    className="flex items-center gap-2"
                    aria-hidden="true"
                  >
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-200 motion-reduce:transition-none",
                        index <= step ? "w-9 bg-primary/55" : "w-6 bg-muted/80",
                      )}
                    />
                  </div>
                ))}
              </div>
              <p
                id={progressDescriptionId}
                className="text-center text-role-caption text-foreground/70"
                aria-live="polite"
              >
                Current step: {currentStepLabel}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:hidden">
              <Card className="rounded-lg border-border/50 bg-card/60 px-3 py-2 text-center shadow-none">
                <p className="text-role-caption text-foreground/70">
                  Interests
                </p>
                <p className="text-role-secondary font-medium text-foreground/90">
                  {selectedInterests.length}
                </p>
              </Card>
              <Card className="rounded-lg border-border/50 bg-card/60 px-3 py-2 text-center shadow-none">
                <p className="text-role-caption text-foreground/70">
                  Districts
                </p>
                <p className="text-role-secondary font-medium text-foreground/90">
                  {selectedDistricts.length}
                </p>
              </Card>
              <Card className="rounded-lg border-border/50 bg-card/60 px-3 py-2 text-center shadow-none">
                <p className="text-role-caption text-foreground/70">Budget</p>
                <p className="text-role-caption break-words font-medium text-foreground/90">
                  {selectedBudgetLabel ?? "Pending"}
                </p>
              </Card>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.section
                key={step}
                initial={
                  shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 18 }
                }
                animate={
                  shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }
                }
                exit={
                  shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -18 }
                }
                transition={{
                  duration: shouldReduceMotion ? 0.14 : 0.18,
                  ease: [0.25, 1, 0.5, 1],
                }}
                className="space-y-5"
              >
                {step === 0 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-role-subheading text-foreground">
                        What do you love?
                      </h3>
                      <p
                        id={interestsHintId}
                        className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[48ch]"
                      >
                        Pick at least 2 interests to personalize your feed.
                      </p>
                    </div>

                    <fieldset aria-describedby={interestsHintId}>
                      <legend id={interestsLegendId} className="sr-only">
                        Select your interests
                      </legend>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {INTERESTS.map((item) => {
                          const selected = selectedInterestsSet.has(item.id);
                          const InterestIcon =
                            INTEREST_ICON_MAP[item.icon] ?? Palette;

                          return (
                            <OnboardingOptionButton
                              key={item.id}
                              selected={selected}
                              onClick={() => toggleInterest(item.id)}
                              className="justify-center px-3 py-2"
                              icon={<InterestIcon className="h-4 w-4" />}
                            >
                              {item.label}
                            </OnboardingOptionButton>
                          );
                        })}
                      </div>
                      <p
                        className="mt-3 text-center text-role-caption text-foreground/70"
                        aria-live="polite"
                      >
                        {interestsRemaining === 0
                          ? `${selectedInterests.length} interests selected`
                          : `Choose ${interestsRemaining} more interest${interestsRemaining > 1 ? "s" : ""} at least to continue`}
                      </p>
                    </fieldset>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6 px-1 sm:px-3">
                    <div className="text-center">
                      <h3
                        id={vibeHeadingId}
                        className="text-role-subheading text-foreground"
                      >
                        What&apos;s your vibe?
                      </h3>
                      <p
                        id={vibeHintId}
                        className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[44ch]"
                      >
                        Drag the slider to match your energy.
                      </p>
                    </div>

                    <Card className="space-y-4 rounded-xl border-border/50 bg-card/60 p-4 shadow-none sm:p-5">
                      <div className="grid grid-cols-3 gap-2">
                        <div
                          className={cn(
                            "rounded-lg border px-2 py-2 text-center transition-colors",
                            vibeBand === "calm"
                              ? "border-primary/25 bg-primary/5"
                              : "border-border/50 bg-background/60",
                          )}
                        >
                          <Moon className="mx-auto h-4 w-4 text-primary/80" />
                          <p className="mt-1 text-role-caption text-foreground/80">
                            Calm
                          </p>
                        </div>
                        <div
                          className={cn(
                            "rounded-lg border px-2 py-2 text-center transition-colors",
                            vibeBand === "balanced"
                              ? "border-primary/25 bg-primary/5"
                              : "border-border/50 bg-background/60",
                          )}
                        >
                          <Compass className="mx-auto h-4 w-4 text-primary/80" />
                          <p className="mt-1 text-role-caption text-foreground/80">
                            Balanced
                          </p>
                        </div>
                        <div
                          className={cn(
                            "rounded-lg border px-2 py-2 text-center transition-colors",
                            vibeBand === "energetic"
                              ? "border-primary/25 bg-primary/5"
                              : "border-border/50 bg-background/60",
                          )}
                        >
                          <Sparkles className="mx-auto h-4 w-4 text-primary/80" />
                          <p className="mt-1 text-role-caption text-foreground/80">
                            Energetic
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-role-caption text-foreground/70">
                          <span>Quiet and chilled</span>
                          <span className="text-right">Loud and social</span>
                        </div>
                        <Slider
                          value={vibe}
                          onValueChange={setVibe}
                          aria-labelledby={vibeHeadingId}
                          aria-describedby={`${vibeHintId} ${vibeValueId}`}
                          max={100}
                          step={1}
                        />
                        <div className="flex items-center justify-between gap-3">
                          <Badge
                            variant="outline"
                            className="rounded-full border-border/60 bg-background/70 px-2.5 py-0.5 text-role-caption text-foreground/80"
                          >
                            Vibe score {vibeValue}/100
                          </Badge>
                          <p
                            id={vibeValueId}
                            className="text-role-secondary text-right font-medium text-foreground"
                            aria-live="polite"
                          >
                            {vibeSummaryTitle}
                          </p>
                        </div>
                      </div>
                    </Card>

                    <div className="rounded-xl border border-border/55 bg-background/55 px-4 py-3">
                      <p className="text-role-caption uppercase tracking-wide text-foreground/60">
                        Your current preference
                      </p>
                      <p className="mt-1 text-role-secondary font-medium text-foreground">
                        {vibeSummaryTitle}
                      </p>
                      <p
                        className="mt-1 text-role-secondary text-foreground/80"
                        aria-live="polite"
                      >
                        {vibeSummaryDescription}
                      </p>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-role-subheading text-foreground">
                        Where in Cairo?
                      </h3>
                      <p
                        id={districtsHintId}
                        className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[44ch]"
                      >
                        Select your favorite districts.
                      </p>
                    </div>

                    <fieldset aria-describedby={districtsHintId}>
                      <legend id={districtsLegendId} className="sr-only">
                        Select your preferred districts
                      </legend>
                      <div className="max-h-[38vh] overflow-y-auto rounded-xl border border-border/45 p-2 sm:max-h-none sm:overflow-visible sm:border-0 sm:p-0">
                        <div className="flex flex-wrap justify-center gap-2">
                          {DISTRICTS.map((district) => {
                            const selected = selectedDistrictsSet.has(district);

                            return (
                              <OnboardingOptionButton
                                key={district}
                                selected={selected}
                                onClick={() => toggleDistrict(district)}
                                shape="pill"
                                className="px-4 py-2"
                              >
                                {district}
                              </OnboardingOptionButton>
                            );
                          })}
                        </div>
                      </div>
                      <p
                        className="mt-3 text-center text-role-caption text-foreground/70"
                        aria-live="polite"
                      >
                        {districtsRemaining === 0
                          ? `${selectedDistricts.length} district${selectedDistricts.length > 1 ? "s" : ""} selected`
                          : `Choose at least ${districtsRemaining} district to continue`}
                      </p>
                    </fieldset>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-role-subheading text-foreground">
                        What&apos;s your budget?
                      </h3>
                      <p
                        id={budgetHintId}
                        className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[42ch]"
                      >
                        Select a price range that suits you.
                      </p>
                    </div>

                    <fieldset aria-describedby={budgetHintId}>
                      <legend id={budgetLegendId} className="sr-only">
                        Select your budget level
                      </legend>
                      <div className="mx-auto grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                        {BUDGET_OPTIONS.map((option) => (
                          <OnboardingOptionButton
                            key={option.value}
                            selected={budget === option.value}
                            onClick={() => setBudget(option.value)}
                            className="justify-center px-4 py-2.5"
                          >
                            {option.label}
                          </OnboardingOptionButton>
                        ))}
                      </div>
                      <p
                        className="mt-3 text-center text-role-caption text-foreground/70"
                        aria-live="polite"
                      >
                        {selectedBudgetLabel
                          ? `Selected budget: ${selectedBudgetLabel}`
                          : "Select one option to continue"}
                      </p>
                    </fieldset>
                  </div>
                )}
              </motion.section>
            </AnimatePresence>

            {error && (
              <Alert
                variant="destructive"
                className="border-destructive/40 bg-destructive/5"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 break-words" dir="auto">
                    {error}
                  </span>
                  {step === 3 && (
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => void handleComplete()}
                      disabled={isSubmitting}
                      className="min-h-10"
                    >
                      Retry
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="sticky bottom-0 -mx-5 px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:static sm:mx-0 sm:px-0 sm:pb-0 sm:pt-0">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={step === 0 || isSubmitting}
                  className="order-2 h-11 w-full touch-manipulation gap-1 rounded-xl px-6 font-medium whitespace-nowrap bg-secondary text-secondary-foreground hover:bg-secondary/85 sm:order-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>

                <Button
                  type="button"
                  onClick={() => void handleNext()}
                  disabled={!canGoNext || isSubmitting}
                  className="order-1 h-11 w-full touch-manipulation gap-1 rounded-xl px-6 font-medium whitespace-nowrap sm:order-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving
                      preferences...
                    </>
                  ) : step === 3 ? (
                    <>
                      Save & Start Exploring <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AuthSurface>
    </AuthShell>
  );
};

export default OnboardingPage;
