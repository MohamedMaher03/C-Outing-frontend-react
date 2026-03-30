import { ArrowLeft, Shield, Eye, Database, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePrivacy } from "@/features/profile/hooks/usePrivacy";
import type { PrivacySettings } from "@/features/profile/types";

type PrivacySettingKey = keyof PrivacySettings;

type PrivacySection = {
  title: string;
  icon: typeof Eye | typeof Database;
  items: Array<{
    key: PrivacySettingKey;
    label: string;
    description: string;
  }>;
};

const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    title: "Profile Visibility",
    icon: Eye,
    items: [
      {
        key: "showFavorites",
        label: "Show my favorites",
        description: "Allow others to see the places you save.",
      },
      {
        key: "showActivity",
        label: "Show my activity",
        description: "Show your recent reviews and check-ins.",
      },
    ],
  },
  {
    title: "Data & Personalization",
    icon: Database,
    items: [
      {
        key: "dataCollection",
        label: "Allow usage analytics",
        description:
          "Help us improve the app by collecting anonymous usage data.",
      },
      {
        key: "personalization",
        label: "Use my activity for recommendations",
        description:
          "Use your preferences and activity to suggest better places.",
      },
    ],
  },
];

const PrivacyPage = () => {
  const navigate = useNavigate();
  const {
    privacySettings,
    loading,
    saving,
    deleting,
    error,
    toggleSetting,
    handleSave,
    handleDeleteAccount,
    reloadSettings,
  } = usePrivacy();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            aria-label="Back to profile"
            className="h-11 w-11 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-secondary" />
            <h1 className="text-role-subheading text-foreground">
              Privacy & Data
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-24 pt-[clamp(1rem,2vw,1.5rem)] sm:pb-6 sm:pt-[clamp(1.25rem,2.5vw,2rem)] space-y-[clamp(1rem,2.4vw,2rem)]">
        {error && (
          <div
            className="rounded-md border border-destructive/30 bg-destructive/5 p-3"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-sm text-destructive text-center break-words">
              {error}
            </p>
            <div className="mt-3 flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void reloadSettings()}
                disabled={loading || saving || deleting}
              >
                Try again
              </Button>
            </div>
          </div>
        )}
        <div className="grid gap-[clamp(1rem,2vw,1.75rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="space-y-[clamp(1rem,2.2vw,1.75rem)]">
            {/* Privacy Settings */}
            {PRIVACY_SECTIONS.map((section) => (
              <section key={section.title} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <section.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <h2 className="text-role-body font-semibold text-foreground">
                    {section.title}
                  </h2>
                </div>

                <Card className="overflow-hidden rounded-2xl border-border/80 bg-card/60">
                  <CardContent className="divide-y divide-border/70 p-0">
                    {section.items.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-start gap-3 px-4 py-3 transition-colors duration-200 ease-out hover:bg-muted/20 motion-reduce:transition-none sm:gap-4 sm:px-5 sm:py-4"
                      >
                        <Checkbox
                          id={item.key}
                          checked={privacySettings[item.key]}
                          onCheckedChange={() => toggleSetting(item.key)}
                          className="mt-1 h-5 w-5"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <Label
                            htmlFor={item.key}
                            className="block py-1 text-role-secondary font-semibold text-foreground cursor-pointer break-words"
                          >
                            {item.label}
                          </Label>
                          <p className="text-role-caption text-muted-foreground break-words">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            ))}
          </div>

          {/* Data Management */}
          <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-secondary" />
              </div>
              <h2 className="text-role-body font-semibold text-foreground">
                Account Safety
              </h2>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-2xl border border-destructive/45 bg-card px-4 py-4 text-left transition-colors duration-200 ease-out hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5 text-destructive" />
                    <div className="text-left min-w-0">
                      <p className="text-sm font-medium text-destructive">
                        Delete my account
                      </p>
                      <p className="text-xs text-muted-foreground break-words">
                        Permanently remove your profile and data
                      </p>
                    </div>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. You will lose your profile,
                    favorites, reviews, and saved preferences.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? "Deleting account..." : "Yes, delete account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Card className="rounded-xl border-border/70 bg-card/60">
              <CardContent className="p-3">
                <p className="text-role-caption text-muted-foreground">
                  Deletion is permanent. If you only need a break, contact
                  support before deleting your account.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* Info Card */}
        <Card className="rounded-xl border-secondary/20 bg-secondary/5">
          <CardContent className="p-4">
            <p className="text-role-secondary text-foreground">
              <span className="font-semibold">Your privacy matters.</span> Learn
              more about how we handle data in our{" "}
              <a
                href="mailto:farouqdiaaeldin@gmail.com?subject=Privacy%20Policy%20Request"
                className="text-secondary underline"
              >
                Privacy Policy
              </a>
              .
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="hidden gap-3 pt-4 sm:flex">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || deleting}
            className="flex-1 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
          >
            {saving ? "Saving changes..." : "Save privacy settings"}
          </Button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-sm sm:hidden">
        <div className="mx-auto max-w-4xl px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || deleting}
              className="flex-1 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
            >
              {saving ? "Saving changes..." : "Save privacy settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
