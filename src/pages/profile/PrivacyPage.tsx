import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
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
} from "../../components/ui/alert-dialog";

const PrivacyPage = () => {
  const navigate = useNavigate();
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showLocation: true,
    showFavorites: false,
    showActivity: true,
    dataCollection: true,
    personalization: true,
  });

  const toggleSetting = (key: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    console.log("Saved privacy settings:", privacySettings);
    navigate("/profile");
  };

  const handleDownloadData = () => {
    console.log("Downloading user data...");
    // Implementation for downloading user data
  };

  const handleDeleteAccount = () => {
    console.log("Account deletion requested");
    // Implementation for account deletion
  };

  const privacySections = [
    {
      title: "Profile Visibility",
      icon: Eye,
      items: [
        {
          key: "profileVisible" as const,
          label: "Public Profile",
          description: "Allow others to see your profile information",
        },
        {
          key: "showLocation" as const,
          label: "Show Location",
          description: "Display your approximate location to others",
        },
        {
          key: "showFavorites" as const,
          label: "Show Favorites",
          description: "Let others see your saved places",
        },
        {
          key: "showActivity" as const,
          label: "Show Activity",
          description: "Display your recent reviews and check-ins",
        },
      ],
    },
    {
      title: "Data & Personalization",
      icon: Database,
      items: [
        {
          key: "dataCollection" as const,
          label: "Data Collection",
          description:
            "Allow us to collect usage data to improve your experience",
        },
        {
          key: "personalization" as const,
          label: "Personalized Recommendations",
          description: "Use your preferences for better suggestions",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-secondary" />
            <h1 className="text-xl font-bold text-foreground">
              Privacy & Data
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Privacy Settings */}
        {privacySections.map((section) => (
          <div key={section.title} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <section.icon className="h-5 w-5 text-secondary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">
                {section.title}
              </h2>
            </div>

            <div className="space-y-3">
              {section.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:bg-muted/30 transition-colors"
                >
                  <Checkbox
                    id={item.key}
                    checked={privacySettings[item.key]}
                    onCheckedChange={() => toggleSetting(item.key)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={item.key}
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      {item.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Data Management */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-secondary" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Data Management
            </h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDownloadData}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-foreground" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">
                    Download Your Data
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get a copy of your information
                  </p>
                </div>
              </div>
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-destructive/50 hover:bg-destructive/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5 text-destructive" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-destructive">
                        Delete Account
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Permanently remove your account
                      </p>
                    </div>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove all your data from our servers
                    including your favorites, reviews, and preferences.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
          <p className="text-sm text-foreground">
            <span className="font-medium">🔒 Your Privacy Matters:</span> We're
            committed to protecting your data. Learn more in our{" "}
            <a href="#" className="text-secondary underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
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
            className="flex-1 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
