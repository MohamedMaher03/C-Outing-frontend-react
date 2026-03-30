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

const BUDGET_OPTIONS: Array<{ value: PriceLevel; label: string }> =
  SHARED_BUDGET_OPTIONS as Array<{ value: PriceLevel; label: string }>;

type AccountItem = {
  label: string;
  desc: string;
  path: string;
};

const ACCOUNT_ITEMS: AccountItem[] = [
  {
    label: "Edit Profile",
    desc: "Name, photo, and bio",
    path: "/profile/edit",
  },
  {
    label: "Notifications",
    desc: "Push and email preferences",
    path: "/profile/notifications",
  },
  {
    label: "Privacy",
    desc: "Data and visibility settings",
    path: "/profile/privacy",
  },
  {
    label: "Help & Support",
    desc: "FAQs and contact us",
    path: "/profile/help",
  },
];

const roleLabel = (role: number | undefined): string => {
  if (role === 2) return "Admin";
  if (role === 1) return "Moderator";
  return "User";
};

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
              ? "mt-2 text-role-subheading text-numeric-tabular text-foreground"
              : "mt-2 text-role-secondary font-semibold text-foreground break-words"
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

  const avatarSrc = useMemo(
    () =>
      profile?.avatarUrl || buildDefaultAvatarDataUrl(profile?.name || "User"),
    [profile?.avatarUrl, profile?.name],
  );

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
      <LoadingSpinner
        size="md"
        text="Loading your profile..."
        fullScreen={true}
      />
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
          <p className="text-destructive mb-2">We couldn't load your profile</p>
          <p className="text-sm text-muted-foreground break-words">{error}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void refreshProfile()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-24 pt-[clamp(1rem,2vw,1.5rem)] sm:pb-6 sm:pt-[clamp(1.25rem,2.5vw,2rem)] space-y-[clamp(1rem,2.4vw,2rem)]">
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
            alt={`${profile?.name || "User"} profile avatar`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1
            className="text-role-subheading text-foreground break-words"
            dir="auto"
          >
            {profile?.name || "User"}
          </h1>
          <p
            className="text-role-secondary text-muted-foreground break-all"
            dir="auto"
          >
            {profile?.email || "user@couting.app"}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-role-caption px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {roleLabel(profile?.role)}
            </span>
            {profile?.isBanned ? (
              <span className="text-role-caption px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                Banned
              </span>
            ) : null}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveTab("account")}
          aria-label="Go to account settings"
          className="h-11 w-11 rounded-full"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:gap-4">
        <ProfileStatCard
          icon={Phone}
          label="Phone"
          value={profile?.phoneNumber || "Add a phone number"}
        />
        <ProfileStatCard
          icon={Cake}
          label="Age"
          value={profile?.age ?? "-"}
          numeric
        />
        <ProfileStatCard
          icon={Activity}
          label="App Activity"
          value={profile?.totalInteractions ?? 0}
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
            <TabsTrigger value="preferences" className="w-full sm:min-w-36">
              Preferences
            </TabsTrigger>
            <TabsTrigger value="account" className="w-full sm:min-w-36">
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="preferences"
            className="space-y-[clamp(1rem,2.2vw,1.85rem)] pt-4"
          >
            {/* Interests */}
            <div className="space-y-2.5">
              <h3 className="text-role-caption text-foreground uppercase tracking-wider">
                Interests
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
                      {item.label}
                    </ProfilePreferenceOptionButton>
                  );
                })}
              </div>
            </div>

            {/* Vibe */}
            <div className="space-y-2.5">
              <h3 className="text-role-caption text-foreground uppercase tracking-wider">
                Vibe Level
              </h3>
              <div className="space-y-2 rounded-xl border border-border/70 bg-card/50 px-3 py-3 sm:px-4">
                <div className="flex justify-between gap-3 text-xs text-muted-foreground">
                  <span>Quiet and calm</span>
                  <span className="text-right">Energetic and social</span>
                </div>
                <Slider
                  value={vibe}
                  onValueChange={setVibe}
                  max={100}
                  step={1}
                  aria-label="Vibe preference"
                />
              </div>
            </div>

            {/* Districts */}
            <div className="space-y-2.5">
              <h3 className="text-role-caption text-foreground uppercase tracking-wider">
                Areas
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
                {DISTRICTS.map((district) => (
                  <ProfilePreferenceOptionButton
                    key={district}
                    selected={selectedDistricts.includes(district)}
                    onClick={() => toggleDistrict(district)}
                    className="justify-start px-3.5 py-2 sm:justify-center"
                  >
                    {district}
                  </ProfilePreferenceOptionButton>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2.5">
              <h3 className="text-role-caption text-foreground uppercase tracking-wider">
                Budget
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {BUDGET_OPTIONS.map((option) => (
                  <ProfilePreferenceOptionButton
                    key={option.value}
                    selected={selectedBudget === option.value}
                    onClick={() => setSelectedBudget(option.value)}
                    className="justify-center px-3.5 py-2"
                  >
                    {option.label}
                  </ProfilePreferenceOptionButton>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="hidden w-full bg-primary text-primary-foreground hover:bg-navy-light font-semibold sm:inline-flex"
            >
              {saving ? "Saving changes..." : "Save preference changes"}
            </Button>
          </TabsContent>

          <TabsContent value="account" className="space-y-2.5 pt-4">
            {ACCOUNT_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors duration-200 ease-out hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <div className="text-left min-w-0">
                  <p className="text-role-secondary font-semibold text-foreground break-words">
                    {item.label}
                  </p>
                  <p className="text-role-caption text-muted-foreground break-words">
                    {item.desc}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))}

            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 mt-4"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </TabsContent>
        </Tabs>

        <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start space-y-3 rounded-2xl border border-border/70 bg-card/60 p-4">
          <h3 className="text-role-caption text-foreground uppercase tracking-wide">
            Quick Actions
          </h3>

          {ACCOUNT_ITEMS.map((item) => (
            <button
              key={`sidebar-${item.label}`}
              type="button"
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/70 px-3 py-3 text-left transition-colors duration-200 ease-out hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              <span className="min-w-0 text-role-secondary text-foreground break-words">
                {item.label}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ))}

          <p className="pt-2 text-role-caption text-muted-foreground">
            You can switch tabs to manage profile preferences and account
            settings.
          </p>

          <Button
            variant="ghost"
            className="mt-1 w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" /> Sign Out
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
              {saving ? "Saving changes..." : "Save preference changes"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProfilePage;
