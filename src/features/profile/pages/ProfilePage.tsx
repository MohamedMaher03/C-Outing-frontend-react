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
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { INTERESTS, POPULAR_DISTRICTS } from "@/mocks/mockData";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { INTEREST_ICON_MAP } from "@/features/profile/mocks";
import type { PriceLevel } from "@/features/admin/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { buildDefaultAvatarDataUrl } from "@/features/profile/utils/defaultAvatar";
import { BUDGET_OPTIONS as SHARED_BUDGET_OPTIONS } from "@/utils/priceLevels";
import { ProfilePreferenceOptionButton } from "@/features/profile/components/ProfilePreferenceOptionButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useI18n } from "@/components/i18n";
import {
  FAVORITE_ACTIVITIES,
  COMPANION_TYPES,
} from "@/features/onboarding/mocks";
import { PreferenceValidationAlert } from "@/features/onboarding/components/PreferenceValidationAlert";
import { PreferenceSectionHint } from "@/features/onboarding/components/PreferenceSectionHint";
import type { PreferenceValidationField } from "@/features/onboarding/utils/onboardingPreferences";

const BUDGET_OPTIONS: Array<{ value: PriceLevel; label: string }> =
  SHARED_BUDGET_OPTIONS as Array<{ value: PriceLevel; label: string }>;

type AccountItem = {
  labelKey: string;
  descriptionKey: string;
  path: string;
};

const ACCOUNT_ITEMS: AccountItem[] = [
  {
    labelKey: "profile.account.item.edit.label",
    descriptionKey: "profile.account.item.edit.description",
    path: "/profile/edit",
  },
  {
    labelKey: "profile.account.item.notifications.label",
    descriptionKey: "profile.account.item.notifications.description",
    path: "/profile/notifications",
  },
  {
    labelKey: "profile.account.item.privacy.label",
    descriptionKey: "profile.account.item.privacy.description",
    path: "/profile/privacy",
  },
  {
    labelKey: "profile.account.item.help.label",
    descriptionKey: "profile.account.item.help.description",
    path: "/profile/help",
  },
];

type ProfileStatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  numeric?: boolean;
  hint?: string;
  stretch?: boolean;
};

const ProfileStatCard = ({
  icon: Icon,
  label,
  value,
  numeric = false,
  hint,
  stretch = false,
}: ProfileStatCardProps) => {
  return (
    <Card
      className={`${stretch ? "h-full " : ""}rounded-2xl border-border/70 bg-gradient-to-br from-card to-muted/30 shadow-sm`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <p className="text-role-caption uppercase tracking-wide">{label}</p>
        </div>
        <p
          className={
            numeric
              ? "mt-2 text-role-subheading text-numeric-tabular text-foreground"
              : "mt-2 text-role-secondary font-semibold text-foreground break-words"
          }
        >
          {value}
        </p>
        {hint ? (
          <p className="text-role-micro text-foreground/78 dark:text-foreground/82 mt-3">
            {hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t, formatNumber, direction } = useI18n();
  const [activeTab, setActiveTab] = useState("preferences");
  const {
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
    savePreferences,
    refreshProfile,
  } = useProfile();
  const isPreferencesTabActive = activeTab === "preferences";
  const fallbackUserName = t("profile.userFallback");

  const getInterestLabel = (interestId: string, fallback: string): string =>
    t(`onboarding.interest.${interestId}`, undefined, fallback);

  const getDistrictLabel = (districtName: string): string => {
    const found = POPULAR_DISTRICTS.find(
      (d) => d.name.toLowerCase() === districtName.toLowerCase(),
    );
    if (found?.nameKey) {
      return t(found.nameKey, undefined, found.name);
    }
    return t(
      `onboarding.district.${districtName.toLowerCase().replace(/\s+/g, "-")}`,
      undefined,
      districtName,
    );
  };

  const getActivityLabel = (activityId: string, fallback: string): string =>
    t(`onboarding.activity.${activityId}`, undefined, fallback);

  const getCompanionLabel = (companionId: string, fallback: string): string =>
    t(`onboarding.companion.${companionId}`, undefined, fallback);

  const getBudgetLabel = (value: string): string =>
    t(`budget.${value}`, undefined, value);

  const getBudgetRangeLabel = (value: string): string =>
    t(`budget.range.${value}`, undefined, "");

  const [districtSearch, setDistrictSearch] = useState("");
  const [districtPage, setDistrictPage] = useState(1);

  const filteredDistricts = useMemo(() => {
    const query = districtSearch.trim().toLowerCase();
    if (!query) return POPULAR_DISTRICTS;
    return POPULAR_DISTRICTS.filter((district) => {
      const name = district.name.toLowerCase();
      const localizedName = t(
        district.nameKey ??
          `onboarding.district.${district.name.toLowerCase().replace(/\s+/g, "-")}`,
        undefined,
        district.name,
      ).toLowerCase();
      return name.includes(query) || localizedName.includes(query);
    });
  }, [districtSearch, t]);

  const districtPageSize = 8;
  const districtTotalPages = Math.max(
    1,
    Math.ceil(filteredDistricts.length / districtPageSize),
  );
  const safeDistrictPage = Math.min(
    Math.max(districtPage, 1),
    districtTotalPages,
  );
  const displayedDistricts = useMemo(() => {
    const start = (safeDistrictPage - 1) * districtPageSize;
    return filteredDistricts.slice(start, start + districtPageSize);
  }, [filteredDistricts, safeDistrictPage]);

  const accountItems = useMemo(
    () =>
      ACCOUNT_ITEMS.map((item) => ({
        ...item,
        label: t(item.labelKey),
        description: t(item.descriptionKey),
      })),
    [t],
  );

  const accountChevronClassName =
    direction === "rtl"
      ? "h-4 w-4 shrink-0 text-muted-foreground rotate-180"
      : "h-4 w-4 shrink-0 text-muted-foreground";

  const avatarSrc = useMemo(
    () =>
      profile?.avatarUrl ||
      buildDefaultAvatarDataUrl(profile?.name || fallbackUserName),
    [fallbackUserName, profile?.avatarUrl, profile?.name],
  );

  const profileName = profile?.name || fallbackUserName;
  const profileEmail = profile?.email || "user@couting.app";
  const profileBio = profile?.bio?.trim() ?? "";
  const hasProfileBio = profileBio.length > 0;
  const profilePhone = profile?.phoneNumber || t("profile.stat.phoneMissing");
  const profileAge = profile?.age != null ? formatNumber(profile.age) : "-";
  const profileInteractions = formatNumber(profile?.totalInteractions ?? 0);

  const vibeValue = vibe[0] ?? 50;
  const vibeBand =
    vibeValue < 30 ? "calm" : vibeValue < 70 ? "balanced" : "energetic";

  const handleSave = async () => {
    await savePreferences().catch(() => undefined);
  };

  const savePreferencesFooter = (
    <div className="space-y-2">
      <Button
        onClick={handleSave}
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
  );

  const hasValidationIssue = (field: PreferenceValidationField) =>
    saveValidationIssues.some((issue) => issue.field === field);

  const sectionIssueClass = (field: PreferenceValidationField) =>
    hasValidationIssue(field)
      ? "rounded-2xl ring-2 ring-destructive/50 ring-offset-2 ring-offset-background"
      : "";

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
            src={avatarSrc}
            alt={t("profile.header.avatarAlt", { name: profileName })}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1
            className="text-role-subheading text-foreground break-words"
            dir="auto"
          >
            {profileName}
          </h1>
          <p
            className="text-role-secondary text-muted-foreground break-all"
            dir="auto"
          >
            {profileEmail}
          </p>
          <div className="mt-3 rounded-xl border border-secondary/25 bg-secondary/10 px-3.5 py-3 dark:border-primary/30 dark:bg-primary/10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary/85 dark:text-primary-foreground/88">
              {t("profile.bio.label")}
            </p>
            {hasProfileBio ? (
              <p
                className="mt-1.5 text-role-secondary leading-relaxed text-foreground/88 dark:text-foreground/90 break-words"
                dir="auto"
              >
                {profileBio}
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
                  onClick={() => navigate("/profile/edit")}
                  className="min-h-11 px-3 sm:min-h-9"
                >
                  {t("profile.bio.addCta")}
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile?.isBanned ? (
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
            value={profilePhone}
          />
          <ProfileStatCard
            icon={Cake}
            label={t("profile.stat.age")}
            value={profileAge}
            numeric
          />
        </div>
        <ProfileStatCard
          icon={Activity}
          label={t("profile.stat.activity")}
          value={profileInteractions}
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
            {saveValidationIssues.length > 0 ||
            (error && isPreferencesTabActive) ? (
              <PreferenceValidationAlert
                variant="error"
                validationIssues={saveValidationIssues}
                errorMessage={error}
              />
            ) : null}

            {/* 1. Explore Interests */}
            <div className={cn("space-y-3 p-1", sectionIssueClass("interests"))}>
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
                  const selected = selectedInterests.includes(item.id);
                  const InterestIcon = INTEREST_ICON_MAP[item.icon] ?? Palette;

                  return (
                    <ProfilePreferenceOptionButton
                      key={item.id}
                      selected={selected}
                      onClick={() => toggleInterest(item.id)}
                      icon={<InterestIcon className="h-4 w-4" />}
                      className="justify-start px-3.5 py-2 sm:justify-center"
                    >
                      {getInterestLabel(item.id, item.label)}
                    </ProfilePreferenceOptionButton>
                  );
                })}
              </div>
            </div>

            {/* 2. Vibe Level */}
            <div className={cn("space-y-3 p-1", sectionIssueClass("vibe"))}>
              <h3 className="text-role-caption text-foreground uppercase tracking-wider font-semibold">
                {t("profile.preferences.vibe")}
              </h3>
              <PreferenceSectionHint hintKey="onboarding.vibe.hint" />
              <div className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4 shadow-sm sm:p-5">
                {/* Vibe cards */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {/* Calm */}
                  <div
                    onClick={() => setVibe([15])}
                    className={cn(
                      "cursor-pointer relative rounded-xl border p-2.5 text-center transition-all duration-200 hover:bg-muted/35",
                      vibeBand === "calm"
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border/50 bg-background/40 text-muted-foreground",
                    )}
                  >
                    {vibeBand === "calm" && (
                      <span className="absolute right-1.5 top-1.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                    <Moon className="mx-auto h-4 w-4" />
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider">
                      {t("onboarding.vibe.calm")}
                    </p>
                  </div>

                  {/* Balanced */}
                  <div
                    onClick={() => setVibe([50])}
                    className={cn(
                      "cursor-pointer relative rounded-xl border p-2.5 text-center transition-all duration-200 hover:bg-muted/35",
                      vibeBand === "balanced"
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border/50 bg-background/40 text-muted-foreground",
                    )}
                  >
                    {vibeBand === "balanced" && (
                      <span className="absolute right-1.5 top-1.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                    <Compass className="mx-auto h-4 w-4" />
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider">
                      {t("onboarding.vibe.balanced")}
                    </p>
                  </div>

                  {/* Energetic */}
                  <div
                    onClick={() => setVibe([85])}
                    className={cn(
                      "cursor-pointer relative rounded-xl border p-2.5 text-center transition-all duration-200 hover:bg-muted/35",
                      vibeBand === "energetic"
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border/50 bg-background/40 text-muted-foreground",
                    )}
                  >
                    {vibeBand === "energetic" && (
                      <span className="absolute right-1.5 top-1.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                    <Sparkles className="mx-auto h-4 w-4" />
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider">
                      {t("onboarding.vibe.energetic")}
                    </p>
                  </div>
                </div>

                {/* Slider */}
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
                      {vibeBand === "calm"
                        ? t("onboarding.vibe.summary.calm.title")
                        : vibeBand === "balanced"
                          ? t("onboarding.vibe.summary.balanced.title")
                          : t("onboarding.vibe.summary.energetic.title")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Preferred Districts/Areas */}
            <div className={cn("space-y-3 p-1", sectionIssueClass("districts"))}>
              <h3 className="text-role-caption text-foreground uppercase tracking-wider font-semibold">
                {t("profile.preferences.areas")}
              </h3>
              <PreferenceSectionHint hintKey="onboarding.districts.hint" />

              <div className="space-y-3 rounded-2xl border border-border/70 bg-card/45 p-4 shadow-sm">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={districtSearch}
                    onChange={(e) => {
                      setDistrictSearch(e.target.value);
                      setDistrictPage(1);
                    }}
                    placeholder={t("onboarding.districts.searchPlaceholder")}
                    className="h-10 pl-10 pr-4 rounded-xl border-border/60 bg-background/70"
                  />
                </div>

                {/* Selected districts pills */}
                {selectedDistricts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-1 bg-background/30 rounded-xl border border-border/40">
                    {selectedDistricts.map((districtName) => (
                      <Badge
                        key={`selected-${districtName}`}
                        variant="secondary"
                        className="rounded-full pl-2.5 pr-1 py-1 flex items-center gap-1.5 text-xs border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        <span className="font-medium text-foreground/95">
                          {getDistrictLabel(districtName)}
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

                {/* Filtered districts search results */}
                <div className="pt-1">
                  {displayedDistricts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 py-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        {t("onboarding.districts.empty")}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {displayedDistricts.map((district) => {
                        const selected = selectedDistricts.includes(
                          district.name,
                        );
                        return (
                          <ProfilePreferenceOptionButton
                            key={district.id}
                            selected={selected}
                            onClick={() => toggleDistrict(district.name)}
                            className="px-3.5 py-1.5 text-xs justify-center"
                          >
                            {getDistrictLabel(district.name)}
                          </ProfilePreferenceOptionButton>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {districtTotalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border/30 pt-3 text-xs">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={safeDistrictPage <= 1}
                      onClick={() =>
                        setDistrictPage((prev) => Math.max(1, prev - 1))
                      }
                      className="h-8 rounded-lg px-2.5"
                    >
                      {t("onboarding.districts.paginationPrev")}
                    </Button>
                    <span className="font-medium text-muted-foreground">
                      {t("onboarding.districts.pageLabel", {
                        current: safeDistrictPage,
                        total: districtTotalPages,
                      })}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={safeDistrictPage >= districtTotalPages}
                      onClick={() =>
                        setDistrictPage((prev) =>
                          Math.min(districtTotalPages, prev + 1),
                        )
                      }
                      className="h-8 rounded-lg px-2.5"
                    >
                      {t("onboarding.districts.paginationNext")}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Preferred Budget */}
            <div className={cn("space-y-3 p-1", sectionIssueClass("budget"))}>
              <h3 className="text-role-caption text-foreground uppercase tracking-wider font-semibold">
                {t("profile.preferences.budget")}
              </h3>
              <PreferenceSectionHint hintKey="onboarding.budget.hint" />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {BUDGET_OPTIONS.map((option) => (
                  <ProfilePreferenceOptionButton
                    key={option.value}
                    selected={selectedBudget === option.value}
                    onClick={() => setSelectedBudget(option.value)}
                    className="justify-center px-4 py-2 text-center flex flex-col gap-0.5 rounded-2xl h-auto"
                  >
                    <span className="text-sm font-semibold">
                      {getBudgetLabel(option.value)}
                    </span>
                    <span className="text-[10px] opacity-75 font-normal">
                      {getBudgetRangeLabel(option.value)}
                    </span>
                  </ProfilePreferenceOptionButton>
                ))}
              </div>
            </div>

            {/* 5. Favorite Activities */}
            <div
              className={cn(
                "space-y-3 p-1",
                sectionIssueClass("favoriteActivities"),
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
                {FAVORITE_ACTIVITIES.map((activity) => {
                  const selected = selectedActivities.includes(activity.id);
                  return (
                    <ProfilePreferenceOptionButton
                      key={activity.id}
                      selected={selected}
                      onClick={() => toggleActivity(activity.id)}
                      className="justify-start px-3.5 py-2 sm:justify-center"
                    >
                      {getActivityLabel(activity.id, activity.label)}
                    </ProfilePreferenceOptionButton>
                  );
                })}
              </div>
            </div>

            {/* 6. Companion Types */}
            <div
              className={cn(
                "space-y-3 p-1",
                sectionIssueClass("companionTypes"),
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
                {COMPANION_TYPES.map((companion) => {
                  const selected = selectedCompanionTypes.includes(
                    companion.id,
                  );
                  return (
                    <ProfilePreferenceOptionButton
                      key={companion.id}
                      selected={selected}
                      onClick={() => toggleCompanionType(companion.id)}
                      className="justify-center px-4 py-2 text-center rounded-2xl h-auto"
                    >
                      {getCompanionLabel(companion.id, companion.label)}
                    </ProfilePreferenceOptionButton>
                  );
                })}
              </div>
            </div>

            {savePreferencesFooter}
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

            {accountItems.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
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

          {accountItems.map((item) => (
            <button
              key={`sidebar-${item.path}`}
              type="button"
              onClick={() => navigate(item.path)}
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
