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
  Check,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { INTERESTS } from "@/mocks/mockData";
import { INTEREST_ICON_MAP, FAVORITE_ACTIVITIES, COMPANION_TYPES } from "@/features/onboarding/mocks";
import { AuthShell, AuthSurface } from "@/components/layout/AuthShell";
import { OnboardingOptionButton } from "../components/OnboardingOptionButton";
import { useOnboardingPage } from "@/features/onboarding/hooks/useOnboardingPage";
import {
  isMultilineMessage,
  splitMultilineMessage,
} from "@/features/onboarding/utils/onboardingPresentation";
import { resolveDistrictRecord } from "@/features/onboarding/utils/districtBrowse";
import type { VibeBand } from "@/features/onboarding/utils/vibeBand";

const VIBE_BAND_ICONS: Record<VibeBand, typeof Moon> = {
  calm: Moon,
  balanced: Compass,
  energetic: Sparkles,
};

const OnboardingPage = () => {
  const shouldReduceMotion = useReducedMotion();
  const {
    t,
    formatNumber,
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
    goToPreviousStep,
    handleComplete,
    isLoggingOut,
    localizedStepLabels,
    currentStepLabel,
    isFinalStep,
    stepCount,
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
    budgetOptions,
    advanceOrComplete,
    signOutFromOnboarding,
    vibeHeading,
    vibeHint,
    vibeValue,
    interestsLegend,
    interestsHint,
    districtsLegend,
    districtsHint,
    budgetLegend,
    budgetHint,
    activitiesLegend,
    activitiesHint,
    companionsLegend,
    companionsHint,
    progressDescription,
  } = useOnboardingPage();

  const errorLines = error ? splitMultilineMessage(error) : [];

  return (
    <AuthShell
      maxWidth="4xl"
      topLeftSlot={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void signOutFromOnboarding()}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
          className="min-h-10 gap-2 border-white/30 bg-red-700 text-white backdrop-blur-sm hover:bg-red-800"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("layout.loggingOut")}
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              {t("layout.logout")}
            </>
          )}
        </Button>
      }
    >
      <AuthSurface className="border-border/45 bg-card/90 shadow-lg backdrop-blur-sm">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-7">
          <aside
            className="hidden lg:flex lg:items-start lg:self-start lg:sticky lg:top-6"
            aria-label={t("onboarding.context")}
          >
            <Card className="w-full rounded-xl border-border/50 bg-card/60 p-4 shadow-none">
              <h3 className="text-role-caption text-foreground/80">
                {t("onboarding.trackerTitle")}
              </h3>

              <ol className="mt-3 space-y-2" aria-hidden="true">
                {localizedStepLabels.map((label, index) => {
                  const isCompleted = index < step;
                  const isActive = index === step;

                  return (
                    <li key={label} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold",
                          isCompleted
                            ? "bg-primary/15 text-primary"
                            : isActive
                              ? "bg-secondary/35 text-secondary-foreground"
                              : "bg-muted/70 text-muted-foreground",
                        )}
                      >
                        {formatNumber(index + 1)}
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
                  {t("onboarding.selections")}
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

          <div className="flex flex-col gap-5 sm:gap-6 py-6 sm:py-7 lg:py-0">
            <header className="space-y-2 text-center">
              <Badge
                variant="secondary"
                className="mx-auto rounded-full px-3 py-1 text-role-caption"
              >
                {t("onboarding.stepLabel", {
                  current: formatNumber(step + 1),
                  total: formatNumber(stepCount),
                })}
              </Badge>
              <h2 className="text-role-subheading text-foreground">
                {t("onboarding.title")}
              </h2>
              <p className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[52ch]">
                {t("onboarding.subtitle")}
              </p>
            </header>

            <div
              className="space-y-2"
              role="progressbar"
              aria-label={t("onboarding.progress")}
              aria-valuemin={1}
              aria-valuemax={stepCount}
              aria-valuenow={step + 1}
              aria-describedby={progressDescription}
            >
              <div className="flex items-center justify-center gap-2">
                {localizedStepLabels.map((label, index) => (
                  <div
                    key={`${label}-${index}`}
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
                id={progressDescription}
                className="text-center text-role-caption text-foreground/70"
                aria-live="polite"
              >
                {t("onboarding.currentStep", { step: currentStepLabel })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:hidden">
              <Card className="rounded-lg border-border/50 bg-card/60 px-3 py-2 text-center shadow-none min-h-[3.5rem]">
                <p className="text-role-caption text-foreground/70">
                  {t("onboarding.selection.interests")}
                </p>
                <p className="text-role-secondary font-medium text-foreground/90">
                  {formatNumber(selectedInterests.length)}
                </p>
              </Card>
              <Card className="rounded-lg border-border/50 bg-card/60 px-3 py-2 text-center shadow-none min-h-[3.5rem]">
                <p className="text-role-caption text-foreground/70">
                  {t("onboarding.selection.districts")}
                </p>
                <p className="text-role-secondary font-medium text-foreground/90">
                  {formatNumber(selectedDistricts.length)}
                </p>
              </Card>
              <Card className="rounded-lg border-border/50 bg-card/60 px-3 py-2 text-center shadow-none min-h-[3.5rem]">
                <p className="text-role-caption text-foreground/70">
                  {t("onboarding.selection.budget")}
                </p>
                <p className="text-role-caption break-words font-medium text-foreground/90">
                  {selectedBudgetLabel ?? t("onboarding.selection.pending")}
                </p>
              </Card>
              <Card className="rounded-lg border-border/50 bg-card/60 px-3 py-2 text-center shadow-none min-h-[3.5rem]">
                <p className="text-role-caption text-foreground/70">
                  {t("onboarding.selection.activities")}
                </p>
                <p className="text-role-secondary font-medium text-foreground/90">
                  {formatNumber(selectedActivities.length)}
                </p>
              </Card>
              <Card className="rounded-lg border-border/50 bg-card/60 px-3 py-2 text-center shadow-none min-h-[3.5rem]">
                <p className="text-role-caption text-foreground/70">
                  {t("onboarding.selection.companions")}
                </p>
                <p className="text-role-secondary font-medium text-foreground/90">
                  {formatNumber(selectedCompanionTypes.length)}
                </p>
              </Card>
            </div>

            <div className="relative h-[440px] sm:h-[420px] overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.section
                  key={step}
                  initial={
                    shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 28 }
                  }
                  animate={
                    shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }
                  }
                  exit={
                    shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -28 }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0.12 : 0.2,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  style={{ position: "absolute", inset: 0, overflowY: "auto" }}
                  className="space-y-5 p-0.5"
                >
                  {step === 0 && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-role-subheading text-foreground">
                          {t("onboarding.interests.title")}
                        </h3>
                        <p
                          id={interestsHint}
                          className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[48ch]"
                        >
                          {t("onboarding.interests.hint")}
                        </p>
                      </div>

                      <fieldset aria-describedby={interestsHint}>
                        <legend id={interestsLegend} className="sr-only">
                          {t("onboarding.interests.legend")}
                        </legend>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3">
                          {INTERESTS.map((item) => {
                            const InterestIcon =
                              INTEREST_ICON_MAP[item.icon] ?? Palette;

                            return (
                              <OnboardingOptionButton
                                key={item.id}
                                selected={selectionSets.interests.has(item.id)}
                                onClick={() => toggleInterest(item.id)}
                                className="justify-center px-3 py-2"
                                icon={<InterestIcon className="h-4 w-4" />}
                              >
                                {labels.interest(item.id, item.label)}
                              </OnboardingOptionButton>
                            );
                          })}
                        </div>
                        <p
                          className="mt-3 text-center text-role-caption text-foreground/70"
                          aria-live="polite"
                        >
                          {selectionQuotas.interests === 0
                            ? t("onboarding.interests.selected", {
                                count: formatNumber(selectedInterests.length),
                              })
                            : t("onboarding.interests.remaining", {
                                count: formatNumber(selectionQuotas.interests),
                                label:
                                  selectionQuotas.interests > 1
                                    ? t("onboarding.interests.unit.plural")
                                    : t("onboarding.interests.unit.singular"),
                              })}
                        </p>
                      </fieldset>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-6 px-1 sm:px-3">
                      <div className="text-center">
                        <h3
                          id={vibeHeading}
                          className="text-role-subheading text-foreground"
                        >
                          {t("onboarding.vibe.title")}
                        </h3>
                        <p
                          id={vibeHint}
                          className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[44ch]"
                        >
                          {t("onboarding.vibe.hint")}
                        </p>
                      </div>

                      <Card className="space-y-4 rounded-xl border-border/50 bg-card/60 p-4 shadow-none sm:p-5">
                        <div className="grid grid-cols-3 gap-2">
                          {(["calm", "balanced", "energetic"] as const).map(
                            (band) => {
                              const BandIcon = VIBE_BAND_ICONS[band];
                              const isActiveBand = vibeBand === band;

                              return (
                                <div
                                  key={band}
                                  className={cn(
                                    "relative rounded-lg border px-2 py-2 text-center transition-colors",
                                    isActiveBand
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border/50 bg-background/60",
                                  )}
                                >
                                  {isActiveBand ? (
                                    <span
                                      aria-hidden="true"
                                      className="absolute right-1.5 top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-primary-foreground/40 bg-primary-foreground/15 text-primary-foreground"
                                    >
                                      <Check className="h-2.5 w-2.5" />
                                    </span>
                                  ) : null}
                                  <BandIcon
                                    className={cn(
                                      "mx-auto h-4 w-4",
                                      isActiveBand
                                        ? "text-primary-foreground"
                                        : "text-primary/80",
                                    )}
                                  />
                                  <p
                                    className={cn(
                                      "mt-1 text-role-caption",
                                      isActiveBand
                                        ? "text-primary-foreground"
                                        : "text-foreground/80",
                                    )}
                                  >
                                    {t(`onboarding.vibe.${band}`)}
                                  </p>
                                </div>
                              );
                            },
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-role-caption text-foreground/70">
                            <span>{t("onboarding.vibe.rangeLow")}</span>
                            <span className="text-right">
                              {t("onboarding.vibe.rangeHigh")}
                            </span>
                          </div>
                          <Slider
                            value={vibe}
                            onValueChange={setVibe}
                            aria-labelledby={vibeHeading}
                            aria-describedby={`${vibeHint} ${vibeValue}`}
                            max={100}
                            step={1}
                          />
                          <div className="flex items-center justify-between gap-3">
                            <Badge
                              variant="outline"
                              className="rounded-full border-border/60 bg-background/70 px-2.5 py-0.5 text-role-caption text-foreground/80"
                            >
                              {t("onboarding.vibe.score", {
                                score: formatNumber(vibeScore),
                              })}
                            </Badge>
                            <p
                              id={vibeValue}
                              className="text-role-secondary text-right font-medium text-foreground"
                              aria-live="polite"
                            >
                              {vibeCopy.summaryTitle}
                            </p>
                          </div>
                        </div>
                      </Card>

                      <div className="rounded-xl border border-border/55 bg-background/55 px-4 py-3">
                        <p className="text-role-caption uppercase tracking-wide text-foreground/60">
                          {t("onboarding.vibe.current")}
                        </p>
                        <p className="mt-1 text-role-secondary font-medium text-foreground">
                          {vibeCopy.summaryTitle}
                        </p>
                        <p
                          className="mt-1 text-role-secondary text-foreground/80"
                          aria-live="polite"
                        >
                          {vibeCopy.summaryDescription}
                        </p>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-role-subheading text-foreground">
                          {t("onboarding.districts.title")}
                        </h3>
                        <p
                          id={districtsHint}
                          className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[44ch]"
                        >
                          {t("onboarding.districts.hint")}
                        </p>
                      </div>

                      <fieldset aria-describedby={districtsHint}>
                        <legend id={districtsLegend} className="sr-only">
                          {t("onboarding.districts.legend")}
                        </legend>
                        <div className="space-y-3">
                          <Input
                            value={districtSearch}
                            onChange={(event) =>
                              applyDistrictSearch(event.target.value)
                            }
                            placeholder={t(
                              "onboarding.districts.searchPlaceholder",
                            )}
                            className="h-11 rounded-xl border-border/60 bg-background/70"
                            aria-label={t("onboarding.districts.searchLabel")}
                          />

                          {selectedDistricts.length > 0 ? (
                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                              <p className="mb-2 text-role-caption uppercase tracking-wide text-foreground/60">
                                {t("onboarding.districts.selectedTitle")}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {selectedDistricts.map((districtName) => {
                                  const districtRecord = resolveDistrictRecord(
                                    districtLookup,
                                    districtName,
                                  );
                                  return (
                                    <button
                                      key={`selected-${districtName}`}
                                      type="button"
                                      onClick={() =>
                                        toggleDistrict(districtName)
                                      }
                                      aria-label={`${t("onboarding.districts.removeLabel", undefined, "Remove")} ${labels.district(districtRecord)}`}
                                      className="group inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-all hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                    >
                                      <span>
                                        {labels.district(districtRecord)}
                                      </span>
                                      <span
                                        aria-hidden="true"
                                        className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold leading-none transition-colors group-hover:bg-destructive/20"
                                      >
                                        ✕
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}

                          <div className="rounded-xl border border-border/45 p-2 sm:border-0 sm:p-0">
                            {districtBrowse.items.length === 0 ? (
                              <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 px-4 py-6 text-center">
                                <p className="text-role-secondary text-foreground/80">
                                  {t("onboarding.districts.empty")}
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {districtBrowse.items.map((district) => (
                                  <OnboardingOptionButton
                                    key={district.id}
                                    selected={selectionSets.districts.has(
                                      district.name,
                                    )}
                                    onClick={() =>
                                      toggleDistrict(district.name)
                                    }
                                    shape="pill"
                                    className="px-4 py-2"
                                  >
                                    {labels.district(district)}
                                  </OnboardingOptionButton>
                                ))}
                              </div>
                            )}
                          </div>

                          {districtBrowse.totalPages > 1 ? (
                            <div className="flex flex-wrap items-center justify-between gap-2 text-role-caption text-foreground/60">
                              <span>
                                {t("onboarding.districts.resultsSummary", {
                                  shown: formatNumber(districtBrowse.items.length),
                                  total: formatNumber(districtBrowse.totalItems),
                                })}
                              </span>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={districtBrowse.page <= 1}
                                  onClick={() => shiftDistrictPage(-1)}
                                  className="h-8 rounded-full border-border/60 bg-background/60 px-3 text-[11px] font-semibold"
                                >
                                  {t("onboarding.districts.paginationPrev")}
                                </Button>
                                <span className="text-[11px] font-semibold text-foreground/70">
                                  {t("onboarding.districts.pageLabel", {
                                    current: formatNumber(districtBrowse.page),
                                    total: formatNumber(
                                      districtBrowse.totalPages,
                                    ),
                                  })}
                                </span>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={
                                    districtBrowse.page >=
                                    districtBrowse.totalPages
                                  }
                                  onClick={() => shiftDistrictPage(1)}
                                  className="h-8 rounded-full border-border/60 bg-background/60 px-3 text-[11px] font-semibold"
                                >
                                  {t("onboarding.districts.paginationNext")}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-role-caption text-foreground/60">
                              {t("onboarding.districts.resultsSummary", {
                                shown: formatNumber(districtBrowse.items.length),
                                total: formatNumber(districtBrowse.totalItems),
                              })}
                            </div>
                          )}
                        </div>
                        <p
                          className="mt-3 text-center text-role-caption text-foreground/70"
                          aria-live="polite"
                        >
                          {selectionQuotas.districts === 0
                            ? t("onboarding.districts.selected", {
                                count: formatNumber(selectedDistricts.length),
                                label:
                                  selectedDistricts.length > 1
                                    ? t("onboarding.districts.unit.plural")
                                    : t("onboarding.districts.unit.singular"),
                              })
                            : t("onboarding.districts.remaining", {
                                count: formatNumber(selectionQuotas.districts),
                              })}
                        </p>
                      </fieldset>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-role-subheading text-foreground">
                          {t("onboarding.budget.title")}
                        </h3>
                        <p
                          id={budgetHint}
                          className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[42ch]"
                        >
                          {t("onboarding.budget.hint")}
                        </p>
                      </div>

                      <fieldset aria-describedby={budgetHint}>
                        <legend id={budgetLegend} className="sr-only">
                          {t("onboarding.budget.legend")}
                        </legend>
                        <div className="mx-auto grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                          {budgetOptions.map((option) => (
                            <OnboardingOptionButton
                              key={option.value}
                              selected={budget === option.value}
                              onClick={() => setBudget(option.value)}
                              className="justify-center px-4 py-3 text-left sm:text-center"
                              contentClassName="flex w-full flex-col items-start gap-0.5 sm:items-center"
                            >
                              <span className="text-sm font-semibold text-foreground">
                                {labels.budget(option.value)}
                              </span>
                              <span className="text-xs text-foreground/70">
                                {labels.budgetRange(option.value)}
                              </span>
                            </OnboardingOptionButton>
                          ))}
                        </div>
                        <p
                          className="mt-3 text-center text-role-caption text-foreground/70"
                          aria-live="polite"
                        >
                          {selectedBudgetLabel
                            ? t("onboarding.budget.selected", {
                                budget: selectedBudgetLabel,
                              })
                            : t("onboarding.budget.empty")}
                        </p>
                      </fieldset>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-role-subheading text-foreground">
                          {t("onboarding.activities.title")}
                        </h3>
                        <p
                          id={activitiesHint}
                          className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[44ch]"
                        >
                          {t("onboarding.activities.hint")}
                        </p>
                      </div>

                      <fieldset aria-describedby={activitiesHint}>
                        <legend id={activitiesLegend} className="sr-only">
                          {t("onboarding.activities.legend")}
                        </legend>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {FAVORITE_ACTIVITIES.map((activity) => (
                            <OnboardingOptionButton
                              key={activity.id}
                              selected={selectionSets.activities.has(
                                activity.id,
                              )}
                              onClick={() => toggleActivity(activity.id)}
                              className="justify-center px-3 py-2"
                            >
                              {labels.activity(activity.id, activity.label)}
                            </OnboardingOptionButton>
                          ))}
                        </div>
                        <p
                          className="mt-3 text-center text-role-caption text-foreground/70"
                          aria-live="polite"
                        >
                          {selectionQuotas.activities === 0
                            ? t("onboarding.activities.selected", {
                                count: formatNumber(selectedActivities.length),
                              })
                            : t("onboarding.activities.remaining", {
                                count: formatNumber(
                                  selectionQuotas.activities,
                                ),
                              })}
                        </p>
                      </fieldset>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-role-subheading text-foreground">
                          {t("onboarding.companions.title")}
                        </h3>
                        <p
                          id={companionsHint}
                          className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[44ch]"
                        >
                          {t("onboarding.companions.hint")}
                        </p>
                      </div>

                      <fieldset aria-describedby={companionsHint}>
                        <legend id={companionsLegend} className="sr-only">
                          {t("onboarding.companions.legend")}
                        </legend>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {COMPANION_TYPES.map((companion) => (
                            <OnboardingOptionButton
                              key={companion.id}
                              selected={selectionSets.companions.has(
                                companion.id,
                              )}
                              onClick={() =>
                                toggleCompanionType(companion.id)
                              }
                              className="justify-center px-3 py-2"
                            >
                              {labels.companion(
                                companion.id,
                                companion.label,
                              )}
                            </OnboardingOptionButton>
                          ))}
                        </div>
                        <p
                          className="mt-3 text-center text-role-caption text-foreground/70"
                          aria-live="polite"
                        >
                          {selectionQuotas.companions === 0
                            ? t("onboarding.companions.selected", {
                                count: formatNumber(
                                  selectedCompanionTypes.length,
                                ),
                              })
                            : t("onboarding.companions.remaining", {
                                count: formatNumber(
                                  selectionQuotas.companions,
                                ),
                              })}
                        </p>
                      </fieldset>
                    </div>
                  )}
                </motion.section>
              </AnimatePresence>
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="border-destructive/40 bg-destructive/5"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex flex-wrap items-center gap-2">
                  {isMultilineMessage(error) ? (
                    <ul className="min-w-0 flex-1 list-disc space-y-1 ps-5">
                      {errorLines.map((line) => (
                        <li key={line} className="break-words" dir="auto">
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="min-w-0 flex-1 break-words" dir="auto">
                      {error}
                    </span>
                  )}
                  {isFinalStep && (
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => void handleComplete()}
                      disabled={isSubmitting}
                      className="min-h-10"
                    >
                      {t("onboarding.action.retry")}
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-auto pt-3 border-t border-border/30">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={step === 0 || isSubmitting}
                  className="order-2 h-11 w-full touch-manipulation gap-1 rounded-xl px-6 font-medium whitespace-nowrap bg-secondary text-secondary-foreground hover:bg-secondary/85 sm:order-1"
                >
                  <ArrowLeft className="rtl-mirror h-4 w-4" />
                  {t("onboarding.action.back")}
                </Button>

                <Button
                  type="button"
                  onClick={() => void advanceOrComplete()}
                  disabled={!canGoNext || isSubmitting}
                  className="order-1 h-11 w-full touch-manipulation gap-1 rounded-xl px-6 font-medium whitespace-nowrap sm:order-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("onboarding.action.saving")}
                    </>
                  ) : isFinalStep ? (
                    <>
                      {t("onboarding.action.finish")}
                      <ArrowRight className="rtl-mirror h-4 w-4" />
                    </>
                  ) : (
                    <>
                      {t("onboarding.action.next")}
                      <ArrowRight className="rtl-mirror h-4 w-4" />
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
