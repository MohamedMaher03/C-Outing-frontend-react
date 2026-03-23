import {
  Settings,
  LogOut,
  ChevronRight,
  Palette,
  Phone,
  Cake,
  Activity,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { INTERESTS, DISTRICTS } from "@/mocks/mockData";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { INTEREST_ICON_MAP } from "@/features/profile/mocks";
import type { PriceLevel } from "@/features/admin/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { buildDefaultAvatarDataUrl } from "@/features/profile/utils/defaultAvatar";

const BUDGET_OPTIONS: Array<{ value: PriceLevel; label: string }> = [
  { value: "price_cheapest", label: "Cheapest ($)" },
  { value: "cheap", label: "Cheap ($$)" },
  { value: "mid_range", label: "Mid Range ($$$)" },
  { value: "expensive", label: "Expensive ($$$$)" },
  { value: "luxury", label: "Luxury ($$$$$)" },
];

const roleLabel = (role: number | undefined): string => {
  if (role === 2) return "Admin";
  if (role === 1) return "Moderator";
  return "User";
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
  } = useProfile();

  const avatarSrc = useMemo(
    () =>
      profile?.avatarUrl || buildDefaultAvatarDataUrl(profile?.name || "User"),
    [profile?.avatarUrl, profile?.name],
  );

  const handleSave = async () => {
    try {
      await savePreferences();
      // Optionally show success message
    } catch (err) {
      // Error is already logged in hook
      console.error("Error saving preferences:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await handleSignOut();
      navigate("/");
    } catch (err) {
      // Error is already logged in hook
      console.error("Error signing out:", err);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner size="md" text="Loading profile..." fullScreen={true} />
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load profile</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden">
          <img
            src={avatarSrc}
            alt="Profile avatar"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">
            {profile?.name || "User"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile?.email || "user@couting.app"}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {roleLabel(profile?.role)}
            </span>
            {profile?.isBanned ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
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
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-card to-muted/30 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <p className="text-xs uppercase tracking-wide">Phone</p>
          </div>
          <p className="text-sm font-semibold text-foreground mt-2 break-words">
            {profile?.phoneNumber || "Not set"}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-card to-muted/30 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cake className="h-4 w-4" />
            <p className="text-xs uppercase tracking-wide">Age</p>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2 leading-none">
            {profile?.age ?? "-"}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-card to-muted/30 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4" />
            <p className="text-xs uppercase tracking-wide">Interactions</p>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2 leading-none">
            {profile?.totalInteractions ?? 0}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="preferences" className="flex-1">
            Preferences
          </TabsTrigger>
          <TabsTrigger value="account" className="flex-1">
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6 pt-4">
          {/* Interests */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((item) => {
                const selected = selectedInterests.includes(item.id);
                const InterestIcon = INTEREST_ICON_MAP[item.icon] ?? Palette;
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleInterest(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      selected
                        ? "border-secondary bg-secondary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-secondary/40",
                    )}
                  >
                    <InterestIcon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vibe */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Vibe
            </h3>
            <div className="space-y-2 px-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>🧘 Quiet</span>
                <span>🎉 Energetic</span>
              </div>
              <Slider value={vibe} onValueChange={setVibe} max={100} step={1} />
            </div>
          </div>

          {/* Districts */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Areas
            </h3>
            <div className="flex flex-wrap gap-2">
              {DISTRICTS.map((d) => {
                const selected = selectedDistricts.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDistrict(d)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      selected
                        ? "border-secondary bg-secondary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-secondary/40",
                    )}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Budget */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Budget
            </h3>
            <div className="flex flex-wrap gap-2">
              {BUDGET_OPTIONS.map((d) => {
                return (
                  <button
                    key={d.value}
                    onClick={() => setSelectedBudget(d.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      selectedBudget === d.value
                        ? "border-secondary bg-secondary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-secondary/40",
                    )}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </TabsContent>

        <TabsContent value="account" className="space-y-3 pt-4">
          {[
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
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
    </div>
  );
};

export default ProfilePage;
