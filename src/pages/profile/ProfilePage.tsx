import { User, Settings, LogOut, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Slider } from "../../components/ui/slider";
import { cn } from "../../libs/utils";
import { INTERESTS, DISTRICTS } from "../../data/mockData";
import { useProfile } from "../../hooks/useProfile";

const ProfilePage = () => {
  const navigate = useNavigate();
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
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
        <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
          <User className="h-8 w-8 text-secondary" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">
            {profile?.name || "User"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile?.email || "user@couting.app"}
          </p>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <Tabs defaultValue="preferences" className="w-full">
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
                    <span>{item.emoji}</span>
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
              {["Low", "Medium", "High"].map((d) => {
                return (
                  <button
                    key={d}
                    onClick={() =>
                      setSelectedBudget(d as "Low" | "Medium" | "High")
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      selectedBudget === d
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
