import { useId, useMemo, useState, useCallback } from "react";
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
import { INTERESTS, POPULAR_DISTRICTS, type District } from "@/mocks/mockData";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import { useLogout } from "@/features/auth/hooks/useLogout";
import {
  ONBOARDING_STEPS,
  BUDGET_OPTIONS,
  INTEREST_ICON_MAP,
  FAVORITE_ACTIVITIES,
  COMPANION_TYPES,
} from "@/features/onboarding/mocks";
import { AuthShell, AuthSurface } from "@/components/layout/AuthShell";
import { OnboardingOptionButton } from "../components/OnboardingOptionButton";
import { useI18n } from "@/components/i18n";

const INTEREST_LABEL_BY_ID = new Map(
  INTERESTS.map((interest) => [interest.id, interest.label]),
);

const OnboardingPage = () => {
  const { t, formatNumber } = useI18n();
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
  const activitiesLegendId = useId();
  const activitiesHintId = useId();
  const companionsLegendId = useId();
  const companionsHintId = useId();
  const progressDescriptionId = useId();
  const { logoutUser, isLoading: isLoggingOut } = useLogout();
  const [districtSearch, setDistrictSearch] = useState("");
  const [districtPage, setDistrictPage] = useState(1);

  const {
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
  } = useOnboarding();

  const localizedStepLabels = [
    t("onboarding.step.interests"),
    t("onboarding.step.vibe"),
    t("onboarding.step.areas"),
    t("onboarding.step.budget"),
    t("onboarding.step.activities"),
    t("onboarding.step.companions"),
  ];

  const getInterestLabel = (interestId: string, fallback: string): string =>
    t(`onboarding.interest.${interestId}`, undefined, fallback);

  const getDistrictLabel = useCallback(
    (district: District): string =>
      t(
        district.nameKey ??
          `onboarding.district.${district.name
            .toLowerCase()
            .replace(/\s+/g, "-")}`,
        undefined,
        district.name,
      ),
    [t],
  );

  const getActivityLabel = (activityId: string, fallback: string): string =>
    t(`onboarding.activity.${activityId}`, undefined, fallback);

  const getCompanionLabel = (companionId: string, fallback: string): string =>
    t(`onboarding.companion.${companionId}`, undefined, fallback);

  const getBudgetLabel = (value: string): string =>
    t(`budget.${value}`, undefined, value);

  const getBudgetRangeLabel = (value: string): string =>
    t(`budget.range.${value}`, undefined, "");

  const handleNext = async () => {
    if (step < 5) {
      goToNextStep();
      return;
    }

    await handleComplete();
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  const currentStepLabel = localizedStepLabels[step] ?? localizedStepLabels[0];
  const selectedBudgetValue = BUDGET_OPTIONS.find(
    (option) => option.value === budget,
  )?.value;
  const selectedBudgetLabel = selectedBudgetValue
    ? getBudgetLabel(selectedBudgetValue)
    : null;

  const selectedInterestsSet = new Set(selectedInterests);
  const selectedDistrictsSet = new Set(selectedDistricts);
  const selectedActivitiesSet = new Set(selectedActivities);
  const selectedCompanionsSet = new Set(selectedCompanionTypes);
  const vibeValue = vibe[0];
  const vibeBand =
    vibeValue < 30 ? "calm" : vibeValue < 70 ? "balanced" : "energetic";
  const vibeBandLabel =
    vibeBand === "calm"
      ? t("onboarding.vibe.calm")
      : vibeBand === "balanced"
        ? t("onboarding.vibe.balanced")
        : t("onboarding.vibe.energetic");
  const interestsRemaining = Math.max(0, 2 - selectedInterests.length);
  const districtsRemaining = Math.max(0, 1 - selectedDistricts.length);
  const activitiesRemaining = Math.max(0, 1 - selectedActivities.length);
  const companionsRemaining = Math.max(0, 1 - selectedCompanionTypes.length);

  const districtLookup = useMemo(
    () =>
      new Map(POPULAR_DISTRICTS.map((district) => [district.name, district])),
    [],
  );

  const filteredDistricts = useMemo(() => {
    const query = districtSearch.trim().toLocaleLowerCase();
    if (!query) {
      return POPULAR_DISTRICTS;
    }

    return POPULAR_DISTRICTS.filter((district) => {
      const label = getDistrictLabel(district).toLocaleLowerCase();
      return (
        label.includes(query) ||
        district.name.toLocaleLowerCase().includes(query)
      );
    });
  }, [districtSearch, getDistrictLabel]);

  const districtPageSize = 12;
  const districtTotalPages = Math.max(
    1,
    Math.ceil(filteredDistricts.length / districtPageSize),
  );
  const safeDistrictPage = Math.min(
    Math.max(districtPage, 1),
    districtTotalPages,
  );
  const displayedDistricts = useMemo(() => {
    const startIndex = (safeDistrictPage - 1) * districtPageSize;
    return filteredDistricts.slice(startIndex, startIndex + districtPageSize);
  }, [filteredDistricts, safeDistrictPage]);

  const selectedInterestLabels = selectedInterests
    .map((interestId) =>
      getInterestLabel(
        interestId,
        INTEREST_LABEL_BY_ID.get(interestId) ?? interestId,
      ),
    )
    .join(", ");

  const selectedDistrictLabels = selectedDistricts
    .map((districtName) =>
      getDistrictLabel(
        districtLookup.get(districtName) ??
          ({ name: districtName } as District),
      ),
    )
    .join(", ");

  const selectedActivityLabels = selectedActivities
    .map((activityId) =>
      getActivityLabel(
        activityId,
        FAVORITE_ACTIVITIES.find((activity) => activity.id === activityId)
          ?.label ?? activityId,
      ),
    )
    .join(", ");

  const selectedCompanionLabels = selectedCompanionTypes
    .map((companionId) =>
      getCompanionLabel(
        companionId,
        COMPANION_TYPES.find((companion) => companion.id === companionId)
          ?.label ?? companionId,
      ),
    )
    .join(", ");

  const trackerSelections = [
    {
      label: t("onboarding.selection.interests"),
      value:
        selectedInterestLabels.length > 0
          ? selectedInterestLabels
          : t("onboarding.selection.noneInterests"),
    },
    {
      label: t("onboarding.selection.districts"),
      value:
        selectedDistrictLabels.length > 0
          ? selectedDistrictLabels
          : t("onboarding.selection.noneDistricts"),
    },
    {
      label: t("onboarding.selection.vibe"),
      value: vibeBandLabel,
    },
    {
      label: t("onboarding.selection.budget"),
      value: selectedBudgetLabel ?? t("onboarding.selection.pending"),
    },
    {
      label: t("onboarding.selection.activities"),
      value:
        selectedActivityLabels.length > 0
          ? selectedActivityLabels
          : t("onboarding.selection.noneActivities"),
    },
    {
      label: t("onboarding.selection.companions"),
      value:
        selectedCompanionLabels.length > 0
          ? selectedCompanionLabels
          : t("onboarding.selection.noneCompanions"),
    },
  ];

  const vibeSummaryTitle =
    vibeBand === "calm"
      ? t("onboarding.vibe.summary.calm.title")
      : vibeBand === "balanced"
        ? t("onboarding.vibe.summary.balanced.title")
        : t("onboarding.vibe.summary.energetic.title");
  const vibeSummaryDescription =
    vibeBand === "calm"
      ? t("onboarding.vibe.summary.calm.description")
      : vibeBand === "balanced"
        ? t("onboarding.vibe.summary.balanced.description")
        : t("onboarding.vibe.summary.energetic.description");

  return (
    <AuthShell
      maxWidth="4xl"
      topLeftSlot={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void handleLogout()}
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
                  total: formatNumber(ONBOARDING_STEPS.length),
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
              aria-valuemax={ONBOARDING_STEPS.length}
              aria-valuenow={step + 1}
              aria-describedby={progressDescriptionId}
            >
              <div className="flex items-center justify-center gap-2">
                {ONBOARDING_STEPS.map((label, index) => (
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
                id={progressDescriptionId}
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
                          id={interestsHintId}
                          className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[48ch]"
                        >
                          {t("onboarding.interests.hint")}
                        </p>
                      </div>

                      <fieldset aria-describedby={interestsHintId}>
                        <legend id={interestsLegendId} className="sr-only">
                          {t("onboarding.interests.legend")}
                        </legend>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3">
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
                                {getInterestLabel(item.id, item.label)}
                              </OnboardingOptionButton>
                            );
                          })}
                        </div>
                        <p
                          className="mt-3 text-center text-role-caption text-foreground/70"
                          aria-live="polite"
                        >
                          {interestsRemaining === 0
                            ? t("onboarding.interests.selected", {
                                count: formatNumber(selectedInterests.length),
                              })
                            : t("onboarding.interests.remaining", {
                                count: formatNumber(interestsRemaining),
                                label:
                                  interestsRemaining > 1
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
                          id={vibeHeadingId}
                          className="text-role-subheading text-foreground"
                        >
                          {t("onboarding.vibe.title")}
                        </h3>
                        <p
                          id={vibeHintId}
                          className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[44ch]"
                        >
                          {t("onboarding.vibe.hint")}
                        </p>
                      </div>

                      <Card className="space-y-4 rounded-xl border-border/50 bg-card/60 p-4 shadow-none sm:p-5">
                        <div className="grid grid-cols-3 gap-2">
                          <div
                            className={cn(
                              "relative rounded-lg border px-2 py-2 text-center transition-colors",
                              vibeBand === "calm"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border/50 bg-background/60",
                            )}
                          >
                            {vibeBand === "calm" ? (
                              <span
                                aria-hidden="true"
                                className="absolute right-1.5 top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-primary-foreground/40 bg-primary-foreground/15 text-primary-foreground"
                              >
                                <Check className="h-2.5 w-2.5" />
                              </span>
                            ) : null}
                            <Moon
                              className={cn(
                                "mx-auto h-4 w-4",
                                vibeBand === "calm"
                                  ? "text-primary-foreground"
                                  : "text-primary/80",
                              )}
                            />
                            <p
                              className={cn(
                                "mt-1 text-role-caption",
                                vibeBand === "calm"
                                  ? "text-primary-foreground"
                                  : "text-foreground/80",
                              )}
                            >
                              {t("onboarding.vibe.calm")}
                            </p>
                          </div>
                          <div
                            className={cn(
                              "relative rounded-lg border px-2 py-2 text-center transition-colors",
                              vibeBand === "balanced"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border/50 bg-background/60",
                            )}
                          >
                            {vibeBand === "balanced" ? (
                              <span
                                aria-hidden="true"
                                className="absolute right-1.5 top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-primary-foreground/40 bg-primary-foreground/15 text-primary-foreground"
                              >
                                <Check className="h-2.5 w-2.5" />
                              </span>
                            ) : null}
                            <Compass
                              className={cn(
                                "mx-auto h-4 w-4",
                                vibeBand === "balanced"
                                  ? "text-primary-foreground"
                                  : "text-primary/80",
                              )}
                            />
                            <p
                              className={cn(
                                "mt-1 text-role-caption",
                                vibeBand === "balanced"
                                  ? "text-primary-foreground"
                                  : "text-foreground/80",
                              )}
                            >
                              {t("onboarding.vibe.balanced")}
                            </p>
                          </div>
                          <div
                            className={cn(
                              "relative rounded-lg border px-2 py-2 text-center transition-colors",
                              vibeBand === "energetic"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border/50 bg-background/60",
                            )}
                          >
                            {vibeBand === "energetic" ? (
                              <span
                                aria-hidden="true"
                                className="absolute right-1.5 top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-primary-foreground/40 bg-primary-foreground/15 text-primary-foreground"
                              >
                                <Check className="h-2.5 w-2.5" />
                              </span>
                            ) : null}
                            <Sparkles
                              className={cn(
                                "mx-auto h-4 w-4",
                                vibeBand === "energetic"
                                  ? "text-primary-foreground"
                                  : "text-primary/80",
                              )}
                            />
                            <p
                              className={cn(
                                "mt-1 text-role-caption",
                                vibeBand === "energetic"
                                  ? "text-primary-foreground"
                                  : "text-foreground/80",
                              )}
                            >
                              {t("onboarding.vibe.energetic")}
                            </p>
                          </div>
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
                              {t("onboarding.vibe.score", {
                                score: formatNumber(vibeValue),
                              })}
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
                          {t("onboarding.vibe.current")}
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
                          {t("onboarding.districts.title")}
                        </h3>
                        <p
                          id={districtsHintId}
                          className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[44ch]"
                        >
                          {t("onboarding.districts.hint")}
                        </p>
                      </div>

                      <fieldset aria-describedby={districtsHintId}>
                        <legend id={districtsLegendId} className="sr-only">
                          {t("onboarding.districts.legend")}
                        </legend>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Input
                              value={districtSearch}
                              onChange={(event) => {
                                setDistrictSearch(event.target.value);
                                setDistrictPage(1);
                              }}
                              placeholder={t(
                                "onboarding.districts.searchPlaceholder",
                              )}
                              className="h-11 rounded-xl border-border/60 bg-background/70"
                              aria-label={t("onboarding.districts.searchLabel")}
                            />
                            <div className="flex flex-wrap items-center justify-between gap-2 text-role-caption text-foreground/60">
                              <span>
                                {t("onboarding.districts.resultsSummary", {
                                  shown: formatNumber(
                                    displayedDistricts.length,
                                  ),
                                  total: formatNumber(filteredDistricts.length),
                                })}
                              </span>
                              {districtTotalPages > 1 ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={safeDistrictPage <= 1}
                                    onClick={() =>
                                      setDistrictPage(
                                        Math.max(1, safeDistrictPage - 1),
                                      )
                                    }
                                    className="h-8 rounded-full border-border/60 bg-background/60 px-3 text-[11px] font-semibold"
                                  >
                                    {t("onboarding.districts.paginationPrev")}
                                  </Button>
                                  <span className="text-[11px] font-semibold text-foreground/70">
                                    {t("onboarding.districts.pageLabel", {
                                      current: formatNumber(safeDistrictPage),
                                      total: formatNumber(districtTotalPages),
                                    })}
                                  </span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                      safeDistrictPage >= districtTotalPages
                                    }
                                    onClick={() =>
                                      setDistrictPage(
                                        Math.min(
                                          districtTotalPages,
                                          safeDistrictPage + 1,
                                        ),
                                      )
                                    }
                                    className="h-8 rounded-full border-border/60 bg-background/60 px-3 text-[11px] font-semibold"
                                  >
                                    {t("onboarding.districts.paginationNext")}
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {selectedDistricts.length > 0 ? (
                            <div className="rounded-xl border border-border/50 bg-card/60 p-3">
                              <p className="text-role-caption uppercase tracking-wide text-foreground/60">
                                {t("onboarding.districts.selectedTitle")}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {selectedDistricts.map((districtName) => {
                                  const selectedDistrict =
                                    districtLookup.get(districtName) ??
                                    ({ name: districtName } as District);
                                  return (
                                    <OnboardingOptionButton
                                      key={`selected-${districtName}`}
                                      selected
                                      onClick={() =>
                                        toggleDistrict(districtName)
                                      }
                                      shape="pill"
                                      className="px-3 py-1.5"
                                    >
                                      {getDistrictLabel(selectedDistrict)}
                                    </OnboardingOptionButton>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}

                          <div className="rounded-xl border border-border/45 p-2 sm:border-0 sm:p-0">
                            {displayedDistricts.length === 0 ? (
                              <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 px-4 py-6 text-center">
                                <p className="text-role-secondary text-foreground/80">
                                  {t("onboarding.districts.empty")}
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {displayedDistricts.map((district) => {
                                  const selected = selectedDistrictsSet.has(
                                    district.name,
                                  );

                                  return (
                                    <OnboardingOptionButton
                                      key={district.id}
                                      selected={selected}
                                      onClick={() =>
                                        toggleDistrict(district.name)
                                      }
                                      shape="pill"
                                      className="px-4 py-2"
                                    >
                                      {getDistrictLabel(district)}
                                    </OnboardingOptionButton>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                        <p
                          className="mt-3 text-center text-role-caption text-foreground/70"
                          aria-live="polite"
                        >
                          {districtsRemaining === 0
                            ? t("onboarding.districts.selected", {
                                count: formatNumber(selectedDistricts.length),
                                label:
                                  selectedDistricts.length > 1
                                    ? t("onboarding.districts.unit.plural")
                                    : t("onboarding.districts.unit.singular"),
                              })
                            : t("onboarding.districts.remaining", {
                                count: formatNumber(districtsRemaining),
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
                          id={budgetHintId}
                          className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[42ch]"
                        >
                          {t("onboarding.budget.hint")}
                        </p>
                      </div>

                      <fieldset aria-describedby={budgetHintId}>
                        <legend id={budgetLegendId} className="sr-only">
                          {t("onboarding.budget.legend")}
                        </legend>
                        <div className="mx-auto grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                          {BUDGET_OPTIONS.map((option) => (
                            <OnboardingOptionButton
                              key={option.value}
                              selected={budget === option.value}
                              onClick={() => setBudget(option.value)}
                              className="justify-center px-4 py-3 text-left sm:text-center"
                              contentClassName="flex w-full flex-col items-start gap-0.5 sm:items-center"
                            >
                              <span className="text-sm font-semibold text-foreground">
                                {getBudgetLabel(option.value)}
                              </span>
                              <span className="text-xs text-foreground/70">
                                {getBudgetRangeLabel(option.value)}
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
                          id={activitiesHintId}
                          className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[44ch]"
                        >
                          {t("onboarding.activities.hint")}
                        </p>
                      </div>

                      <fieldset aria-describedby={activitiesHintId}>
                        <legend id={activitiesLegendId} className="sr-only">
                          {t("onboarding.activities.legend")}
                        </legend>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {FAVORITE_ACTIVITIES.map((activity) => {
                            const selected = selectedActivitiesSet.has(
                              activity.id,
                            );

                            return (
                              <OnboardingOptionButton
                                key={activity.id}
                                selected={selected}
                                onClick={() => toggleActivity(activity.id)}
                                className="justify-center px-3 py-2"
                              >
                                {getActivityLabel(activity.id, activity.label)}
                              </OnboardingOptionButton>
                            );
                          })}
                        </div>
                        <p
                          className="mt-3 text-center text-role-caption text-foreground/70"
                          aria-live="polite"
                        >
                          {activitiesRemaining === 0
                            ? t("onboarding.activities.selected", {
                                count: formatNumber(selectedActivities.length),
                              })
                            : t("onboarding.activities.remaining", {
                                count: formatNumber(activitiesRemaining),
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
                          id={companionsHintId}
                          className="mx-auto text-role-secondary text-foreground/80 sm:max-w-[44ch]"
                        >
                          {t("onboarding.companions.hint")}
                        </p>
                      </div>

                      <fieldset aria-describedby={companionsHintId}>
                        <legend id={companionsLegendId} className="sr-only">
                          {t("onboarding.companions.legend")}
                        </legend>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {COMPANION_TYPES.map((companion) => {
                            const selected = selectedCompanionsSet.has(
                              companion.id,
                            );

                            return (
                              <OnboardingOptionButton
                                key={companion.id}
                                selected={selected}
                                onClick={() =>
                                  toggleCompanionType(companion.id)
                                }
                                className="justify-center px-3 py-2"
                              >
                                {getCompanionLabel(
                                  companion.id,
                                  companion.label,
                                )}
                              </OnboardingOptionButton>
                            );
                          })}
                        </div>
                        <p
                          className="mt-3 text-center text-role-caption text-foreground/70"
                          aria-live="polite"
                        >
                          {companionsRemaining === 0
                            ? t("onboarding.companions.selected", {
                                count: formatNumber(
                                  selectedCompanionTypes.length,
                                ),
                              })
                            : t("onboarding.companions.remaining", {
                                count: formatNumber(companionsRemaining),
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
                  <span className="min-w-0 flex-1 break-words" dir="auto">
                    {error}
                  </span>
                  {step === ONBOARDING_STEPS.length - 1 && (
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
                  onClick={() => void handleNext()}
                  disabled={!canGoNext || isSubmitting}
                  className="order-1 h-11 w-full touch-manipulation gap-1 rounded-xl px-6 font-medium whitespace-nowrap sm:order-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("onboarding.action.saving")}
                    </>
                  ) : step === ONBOARDING_STEPS.length - 1 ? (
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
