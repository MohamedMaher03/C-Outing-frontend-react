import {
  Settings,
  LogOut,
  ChevronRight,
  Palette,
  Phone,
  Cake,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { INTERESTS, DISTRICTS } from "@/mocks/mockData";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { INTEREST_ICON_MAP } from "@/features/profile/mocks";
import type { PriceLevel } from "@/features/admin/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { buildDefaultAvatarDataUrl } from "@/features/profile/utils/defaultAvatar";
import { BUDGET_OPTIONS as SHARED_BUDGET_OPTIONS } from "@/utils/priceLevels";
import { ProfilePreferenceOptionButton } from "@/features/profile/components/ProfilePreferenceOptionButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useI18n } from "@/components/i18n";

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
};

const ProfileStatCard = ({
  icon: Icon,
  label,
  value,
  numeric = false,
}: ProfileStatCardProps) => {
  return (
    <Card className="rounded-2xl border-border/70 bg-gradient-to-br from-card to-muted/30 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <p className="text-role-caption uppercase tracking-wide">{label}</p>
        </div>
        <p
          className={
            numeric
              ? "mt-2 text-role-subheading text-numeric-tabular text-black dark:text-foreground"
              : "mt-2 text-role-secondary font-semibold text-black dark:text-foreground break-words"
          }
        >
          {value}
        </p>
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
    selectedInterests,
    vibe,
    selectedDistricts,
    selectedBudget,
    toggleInterest,
    setVibe,
    toggleDistrict,
    setSelectedBudget,
    savePreferences,
    handleSignOut,
    refreshProfile,
  } = useProfile();
  const isPreferencesTabActive = activeTab === "preferences";
  const fallbackUserName = t("profile.userFallback");

  const getInterestLabel = (interestId: string, fallback: string): string =>
    t(`onboarding.interest.${interestId}`, undefined, fallback);

  const getDistrictLabel = (district: string): string =>
    t(
      `onboarding.district.${district.toLowerCase().replace(/\s+/g, "-")}`,
      undefined,
      district,
    );

  const getRoleLabel = (role: number | undefined): string => {
    if (role === 2) return t("profile.role.admin");
    if (role === 1) return t("profile.role.moderator");
    return t("profile.role.user");
  };

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
  const profilePhone = profile?.phoneNumber || t("profile.stat.phoneMissing");
  const profileAge = profile?.age != null ? formatNumber(profile.age) : "-";
  const profileInteractions = formatNumber(profile?.totalInteractions ?? 0);

  const handleSave = async () => {
    try {
      await savePreferences();
    } catch {
      // Error state is surfaced by the hook.
    }
  };

  const handleLogout = async () => {
    try {
      await handleSignOut();
      navigate("/");
    } catch {
      // Error state is surfaced by the hook.
    }
  };

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
    <div className="max-w-5xl mx-auto px-4 pb-24 pt-[clamp(1rem,2vw,1.5rem)] sm:pb-6 sm:pt-[clamp(1.25rem,2.5vw,2rem)] space-y-[clamp(1rem,2.4vw,2rem)] text-black dark:text-foreground">
      {error ? (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/5 p-3"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm text-destructive text-center break-words">
            {error}
          </p>
        </div>
      ) : null}

      {/* Profile Header */}
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
            className="text-role-subheading text-black dark:text-foreground break-words"
            dir="auto"
          >
            {profileName}
          </h1>
          <p
            className="text-role-secondary text-black/75 dark:text-muted-foreground break-all"
            dir="auto"
          >
            {profileEmail}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-role-caption px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {getRoleLabel(profile?.role)}
            </span>
            {profile?.isBanned ? (
              <span className="text-role-caption px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                {t("profile.status.banned")}
              </span>
            ) : null}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveTab("account")}
          aria-label={t("profile.action.openAccountSettings")}
          className="h-11 w-11 rounded-full"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:gap-4">
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
        <ProfileStatCard
          icon={Activity}
          label={t("profile.stat.activity")}
          value={profileInteractions}
          numeric
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
              className="w-full sm:min-w-36 text-black dark:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-primary/15 data-[state=inactive]:hover:text-primary"
            >
              {t("profile.tab.preferences")}
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="w-full sm:min-w-36 text-black dark:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-primary/15 data-[state=inactive]:hover:text-primary"
            >
              {t("profile.tab.account")}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="preferences"
            className="space-y-[clamp(1rem,2.2vw,1.85rem)] pt-4"
          >
            {/* Interests */}
            <div className="space-y-2.5">
              <h3 className="text-role-caption text-black dark:text-foreground uppercase tracking-wider">
                {t("profile.preferences.interests")}
              </h3>
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

            {/* Vibe */}
            <div className="space-y-2.5">
              <h3 className="text-role-caption text-black dark:text-foreground uppercase tracking-wider">
                {t("profile.preferences.vibe")}
              </h3>
              <div className="space-y-2 rounded-xl border border-border/70 bg-card/50 px-3 py-3 sm:px-4">
                <div className="flex justify-between gap-3 text-xs text-black/75 dark:text-muted-foreground">
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
              </div>
            </div>

            {/* Districts */}
            <div className="space-y-2.5">
              <h3 className="text-role-caption text-black dark:text-foreground uppercase tracking-wider">
                {t("profile.preferences.areas")}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
                {DISTRICTS.map((district) => (
                  <ProfilePreferenceOptionButton
                    key={district}
                    selected={selectedDistricts.includes(district)}
                    onClick={() => toggleDistrict(district)}
                    className="justify-start px-3.5 py-2 sm:justify-center"
                  >
                    {getDistrictLabel(district)}
                  </ProfilePreferenceOptionButton>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2.5">
              <h3 className="text-role-caption text-black dark:text-foreground uppercase tracking-wider">
                {t("profile.preferences.budget")}
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {BUDGET_OPTIONS.map((option) => (
                  <ProfilePreferenceOptionButton
                    key={option.value}
                    selected={selectedBudget === option.value}
                    onClick={() => setSelectedBudget(option.value)}
                    className="justify-center px-3.5 py-2"
                  >
                    {t(`budget.${option.value}`, undefined, option.label)}
                  </ProfilePreferenceOptionButton>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="hidden w-full bg-primary text-primary-foreground hover:bg-navy-light font-semibold sm:inline-flex"
            >
              {saving
                ? t("profile.preferences.saving")
                : t("profile.preferences.save")}
            </Button>
          </TabsContent>

          <TabsContent value="account" className="space-y-2.5 pt-4">
            <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <div className="mb-3 space-y-1">
                <h3 className="text-role-secondary font-semibold text-black dark:text-foreground">
                  {t("profile.account.appearanceTitle")}
                </h3>
                <p className="text-role-caption text-black/75 dark:text-muted-foreground">
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
                  <p className="text-role-secondary font-semibold text-black dark:text-foreground break-words">
                    {item.label}
                  </p>
                  <p className="text-role-caption text-black/75 dark:text-muted-foreground break-words">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className={accountChevronClassName} />
              </button>
            ))}

            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 mt-4"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> {t("profile.account.signOut")}
            </Button>
          </TabsContent>
        </Tabs>

        <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start space-y-3 rounded-2xl border border-border/70 bg-card/60 p-4">
          <h3 className="text-role-caption text-black dark:text-foreground uppercase tracking-wide">
            {t("profile.quickActions.title")}
          </h3>

          {accountItems.map((item) => (
            <button
              key={`sidebar-${item.path}`}
              type="button"
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/70 px-3 py-3 text-left transition-colors duration-200 ease-out hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              <span className="min-w-0 text-role-secondary text-black dark:text-foreground break-words">
                {item.label}
              </span>
              <ChevronRight className={accountChevronClassName} />
            </button>
          ))}

          <p className="pt-2 text-role-caption text-black/75 dark:text-muted-foreground">
            {t("profile.quickActions.hint")}
          </p>

          <Button
            variant="ghost"
            className="mt-1 w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" /> {t("profile.account.signOut")}
          </Button>
        </aside>
      </div>

      {isPreferencesTabActive ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-sm sm:hidden">
          <div className="mx-auto max-w-5xl px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
            >
              {saving
                ? t("profile.preferences.saving")
                : t("profile.preferences.save")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProfilePage;
