import {
  ChevronRight,
  Palette,
  Phone,
  Cake,
  Activity,
  Moon,
  Compass,
  Sparkles,
  Search,
  X,
  Check,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { INTERESTS } from "@/mocks/mockData";
import { INTEREST_ICON_MAP } from "@/features/profile/mocks";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ProfilePreferenceOptionButton } from "@/features/profile/components/ProfilePreferenceOptionButton";
import { ProfileStatCard } from "@/features/profile/components/ProfileStatCard";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { FAVORITE_ACTIVITIES, COMPANION_TYPES } from "@/features/onboarding/mocks";
import { PreferenceValidationAlert } from "@/features/onboarding/components/PreferenceValidationAlert";
import { PreferenceSectionHint } from "@/features/onboarding/components/PreferenceSectionHint";
import { useProfilePage } from "@/features/profile/hooks/useProfilePage";
import type { VibeBand } from "@/features/onboarding/utils/vibeBand";

const VIBE_BAND_ICONS: Record<VibeBand, typeof Moon> = {
  calm: Moon,
  balanced: Compass,
  energetic: Sparkles,
};

const ProfilePage = () => {
  const {
    t,
    profile,
    loading,
    saving,
    error,
    saveSuccess,
    saveValidationIssues,
    selectedInterests,
    vibe,
    selectedDistricts,
    selectedBudget,
    selectedActivities,
    selectedCompanionTypes,
    toggleInterest,
    setVibe,
    toggleDistrict,
    setSelectedBudget,
    toggleActivity,
    toggleCompanionType,
    refreshProfile,
    activeTab,
    setActiveTab,
    showPreferencesError,
    labels,
    accountRoutes,
    accountChevronClassName,
    headerView,
    districtSearch,
    applyDistrictSearch,
    districtBrowse,
    shiftDistrictPage,
    vibeBand,
    vibeCopy,
    sectionIssueRing,
    applyVibePreset,
    persistPreferences,
    openEditProfile,
    openAccountRoute,
    budgetOptions,
  } = useProfilePage();

  if (loading) {
    return (
      <LoadingSpinner size="md" text={t("profile.loading")} fullScreen={true} />
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="text-center space-y-3"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-destructive mb-2">
            {t("profile.error.loadTitle")}
          </p>
          <p className="text-sm text-muted-foreground break-words">{error}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void refreshProfile()}
          >
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-24 pt-[clamp(1rem,2vw,1.5rem)] md:pb-6 md:pt-[clamp(1.25rem,2.5vw,2rem)] space-y-[clamp(1rem,2.4vw,2rem)] text-foreground">
      <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5">
        <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden">
          <img
            src={headerView.avatarSrc}
            alt={t("profile.header.avatarAlt", { name: headerView.displayName })}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1
            className="text-role-subheading text-foreground break-words"
            dir="auto"
          >
            {headerView.displayName}
          </h1>
          <p
            className="text-role-secondary text-muted-foreground break-all"
            dir="auto"
          >
            {headerView.email}
          </p>
          <div className="mt-3 rounded-xl border border-secondary/25 bg-secondary/10 px-3.5 py-3 dark:border-primary/30 dark:bg-primary/10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary/85 dark:text-primary-foreground/88">
              {t("profile.bio.label")}
            </p>
            {headerView.hasBio ? (
              <p
                className="mt-1.5 text-role-secondary leading-relaxed text-foreground/88 dark:text-foreground/90 break-words"
                dir="auto"
              >
                {headerView.bio}
              </p>
            ) : (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <p className="text-role-caption text-muted-foreground">
                  {t("profile.bio.empty")}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openEditProfile}
                  className="min-h-11 px-3 sm:min-h-9"
                >
                  {t("profile.bio.addCta")}
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {headerView.isBanned ? (
              <span className="text-role-caption px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                {t("profile.status.banned")}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-4">
        <div className="grid gap-3 lg:gap-4">
          <ProfileStatCard
            icon={Phone}
            label={t("profile.stat.phone")}
            value={headerView.phoneLabel}
          />
          <ProfileStatCard
            icon={Cake}
            label={t("profile.stat.age")}
            value={headerView.ageLabel}
            numeric
          />
        </div>
        <ProfileStatCard
          icon={Activity}
          label={t("profile.stat.activity")}
          value={headerView.interactionCountLabel}
          numeric
          hint={t("profile.recommendationHint")}
          stretch
        />
      </div>

      <div className="grid gap-[clamp(1rem,2.2vw,1.9rem)] lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full min-w-0"
        >
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex">
            <TabsTrigger
              value="preferences"
              className="w-full sm:min-w-36 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-primary/15 data-[state=inactive]:hover:text-primary"
            >
              {t("profile.tab.preferences")}
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="w-full sm:min-w-36 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-primary/15 data-[state=inactive]:hover:text-primary"
            >
              {t("profile.tab.account")}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="preferences"
            className="space-y-[clamp(1.25rem,2.5vw,2.25rem)] pt-4"
          >
            {showPreferencesError ? (
              <PreferenceValidationAlert
                variant="error"
                validationIssues={saveValidationIssues}
                errorMessage={error}
              />
            ) : null}

            <div className={cn("space-y-3 p-1", sectionIssueRing("interests"))}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-role-caption text-foreground uppercase tracking-wider font-semibold">
                  {t("profile.preferences.interests")}
                </h3>
                {selectedInterests.length > 0 && (
                  <Badge variant="secondary" className="rounded-full px-2.5">
                    {selectedInterests.length} selected
                  </Badge>
                )}
              </div>
              <PreferenceSectionHint hintKey="onboarding.interests.hint" />
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
                {INTERESTS.map((item) => {
                  const InterestIcon = INTEREST_ICON_MAP[item.icon] ?? Palette;

                  return (
                    <ProfilePreferenceOptionButton
                      key={item.id}
                      selected={selectedInterests.includes(item.id)}
                      onClick={() => toggleInterest(item.id)}
                      icon={<InterestIcon className="h-4 w-4" />}
                      className="justify-start px-3.5 py-2 sm:justify-center"
                    >
                      {labels.interest(item.id, item.label)}
                    </ProfilePreferenceOptionButton>
                  );
                })}
              </div>
            </div>

            <div className={cn("space-y-3 p-1", sectionIssueRing("vibe"))}>
              <h3 className="text-role-caption text-foreground uppercase tracking-wider font-semibold">
                {t("profile.preferences.vibe")}
              </h3>
              <PreferenceSectionHint hintKey="onboarding.vibe.hint" />
              <div className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4 shadow-sm sm:p-5">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {(["calm", "balanced", "energetic"] as const).map((band) => {
                    const BandIcon = VIBE_BAND_ICONS[band];
                    const isActiveBand = vibeBand === band;

                    return (
                      <div
                        key={band}
                        onClick={() => applyVibePreset(band)}
                        className={cn(
                          "cursor-pointer relative rounded-xl border p-2.5 text-center transition-all duration-200 hover:bg-muted/35",
                          isActiveBand
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border/50 bg-background/40 text-muted-foreground",
                        )}
                      >
                        {isActiveBand && (
                          <span className="absolute right-1.5 top-1.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        )}
                        <BandIcon className="mx-auto h-4 w-4" />
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wider">
                          {t(`onboarding.vibe.${band}`)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between gap-3 text-xs text-muted-foreground">
                    <span>{t("profile.preferences.vibe.low")}</span>
                    <span className="text-right">
                      {t("profile.preferences.vibe.high")}
                    </span>
                  </div>
                  <Slider
                    value={vibe}
                    onValueChange={setVibe}
                    max={100}
                    step={1}
                    aria-label={t("profile.preferences.vibeAria")}
                  />
                  <div className="flex items-center justify-between pt-1">
                    <Badge
                      variant="outline"
                      className="rounded-full bg-background/70 px-2 py-0.5 text-[10px] text-foreground/80"
                    >
                      Score: {vibe[0]}
                    </Badge>
                    <p className="text-xs font-semibold text-foreground/90">
                      {vibeCopy.summaryTitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={cn("space-y-3 p-1", sectionIssueRing("districts"))}>
              <h3 className="text-role-caption text-foreground uppercase tracking-wider font-semibold">
                {t("profile.preferences.areas")}
              </h3>
              <PreferenceSectionHint hintKey="onboarding.districts.hint" />

              <div className="space-y-3 rounded-2xl border border-border/70 bg-card/45 p-4 shadow-sm">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={districtSearch}
                    onChange={(event) => applyDistrictSearch(event.target.value)}
                    placeholder={t("onboarding.districts.searchPlaceholder")}
                    className="h-10 pl-10 pr-4 rounded-xl border-border/60 bg-background/70"
                  />
                </div>

                {selectedDistricts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-1 bg-background/30 rounded-xl border border-border/40">
                    {selectedDistricts.map((districtName) => (
                      <Badge
                        key={`selected-${districtName}`}
                        variant="secondary"
                        className="rounded-full pl-2.5 pr-1 py-1 flex items-center gap-1.5 text-xs border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        <span className="font-medium text-foreground/95">
                          {labels.districtByName(districtName)}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleDistrict(districtName)}
                          className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="pt-1">
                  {districtBrowse.items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 py-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        {t("onboarding.districts.empty")}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {districtBrowse.items.map((district) => (
                        <ProfilePreferenceOptionButton
                          key={district.id}
                          selected={selectedDistricts.includes(district.name)}
                          onClick={() => toggleDistrict(district.name)}
                          className="px-3.5 py-1.5 text-xs justify-center"
                        >
                          {labels.district(district)}
                        </ProfilePreferenceOptionButton>
                      ))}
                    </div>
                  )}
                </div>

                {districtBrowse.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border/30 pt-3 text-xs">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={districtBrowse.page <= 1}
                      onClick={() => shiftDistrictPage(-1)}
                      className="h-8 rounded-lg px-2.5"
                    >
                      {t("onboarding.districts.paginationPrev")}
                    </Button>
                    <span className="font-medium text-muted-foreground">
                      {t("onboarding.districts.pageLabel", {
                        current: districtBrowse.page,
                        total: districtBrowse.totalPages,
                      })}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={districtBrowse.page >= districtBrowse.totalPages}
                      onClick={() => shiftDistrictPage(1)}
                      className="h-8 rounded-lg px-2.5"
                    >
                      {t("onboarding.districts.paginationNext")}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className={cn("space-y-3 p-1", sectionIssueRing("budget"))}>
              <h3 className="text-role-caption text-foreground uppercase tracking-wider font-semibold">
                {t("profile.preferences.budget")}
              </h3>
              <PreferenceSectionHint hintKey="onboarding.budget.hint" />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {budgetOptions.map((option) => (
                  <ProfilePreferenceOptionButton
                    key={option.value}
                    selected={selectedBudget === option.value}
                    onClick={() => setSelectedBudget(option.value)}
                    className="justify-center px-4 py-2 text-center flex flex-col gap-0.5 rounded-2xl h-auto"
                  >
                    <span className="text-sm font-semibold">
                      {labels.budget(option.value)}
                    </span>
                    <span className="text-[10px] opacity-75 font-normal">
                      {labels.budgetRange(option.value)}
                    </span>
                  </ProfilePreferenceOptionButton>
                ))}
              </div>
            </div>

            <div
              className={cn(
                "space-y-3 p-1",
                sectionIssueRing("favoriteActivities"),
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-role-caption text-foreground uppercase tracking-wider font-semibold">
                  {t("onboarding.step.activities")}
                </h3>
                {selectedActivities.length > 0 && (
                  <Badge variant="secondary" className="rounded-full px-2.5">
                    {selectedActivities.length} selected
                  </Badge>
                )}
              </div>
              <PreferenceSectionHint hintKey="onboarding.activities.hint" />
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
                {FAVORITE_ACTIVITIES.map((activity) => (
                  <ProfilePreferenceOptionButton
                    key={activity.id}
                    selected={selectedActivities.includes(activity.id)}
                    onClick={() => toggleActivity(activity.id)}
                    className="justify-start px-3.5 py-2 sm:justify-center"
                  >
                    {labels.activity(activity.id, activity.label)}
                  </ProfilePreferenceOptionButton>
                ))}
              </div>
            </div>

            <div
              className={cn(
                "space-y-3 p-1",
                sectionIssueRing("companionTypes"),
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-role-caption text-foreground uppercase tracking-wider font-semibold">
                  {t("onboarding.step.companions")}
                </h3>
                {selectedCompanionTypes.length > 0 && (
                  <Badge variant="secondary" className="rounded-full px-2.5">
                    {selectedCompanionTypes.length} selected
                  </Badge>
                )}
              </div>
              <PreferenceSectionHint hintKey="onboarding.companions.hint" />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {COMPANION_TYPES.map((companion) => (
                  <ProfilePreferenceOptionButton
                    key={companion.id}
                    selected={selectedCompanionTypes.includes(companion.id)}
                    onClick={() => toggleCompanionType(companion.id)}
                    className="justify-center px-4 py-2 text-center rounded-2xl h-auto"
                  >
                    {labels.companion(companion.id, companion.label)}
                  </ProfilePreferenceOptionButton>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => void persistPreferences()}
                disabled={saving}
                className="w-full min-h-11 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
              >
                {saving
                  ? t("profile.preferences.saving")
                  : t("profile.preferences.save")}
              </Button>
              {saveSuccess ? (
                <p
                  role="status"
                  aria-live="polite"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {t("profile.preferences.saveSuccess")}
                </p>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-2.5 pt-4">
            <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <div className="mb-3 space-y-1">
                <h3 className="text-role-secondary font-semibold text-foreground">
                  {t("profile.account.appearanceTitle")}
                </h3>
                <p className="text-role-caption text-muted-foreground">
                  {t("profile.account.appearanceDescription")}
                </p>
              </div>
              <ThemeToggle mode="segmented" className="w-full justify-center" />
            </section>

            {accountRoutes.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => openAccountRoute(item.path)}
                className="w-full flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors duration-200 ease-out hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <div className="text-left min-w-0">
                  <p className="text-role-secondary font-semibold text-foreground break-words">
                    {item.label}
                  </p>
                  <p className="text-role-caption text-muted-foreground break-words">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className={accountChevronClassName} />
              </button>
            ))}
          </TabsContent>
        </Tabs>

        <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start space-y-3 rounded-2xl border border-border/70 bg-card/60 p-4">
          <h3 className="text-role-caption text-foreground uppercase tracking-wide">
            {t("profile.quickActions.title")}
          </h3>

          {accountRoutes.map((item) => (
            <button
              key={`sidebar-${item.path}`}
              type="button"
              onClick={() => openAccountRoute(item.path)}
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/70 px-3 py-3 text-left transition-colors duration-200 ease-out hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              <span className="min-w-0 text-role-secondary text-foreground break-words">
                {item.label}
              </span>
              <ChevronRight className={accountChevronClassName} />
            </button>
          ))}

          <p className="pt-2 text-role-caption text-muted-foreground">
            {t("profile.quickActions.hint")}
          </p>
        </aside>
      </div>
    </div>
  );
};

export default ProfilePage;
