import { ArrowLeft, Bell, Mail, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useNotifications } from "@/features/profile/hooks/useNotifications";
import type { NotificationSettings } from "@/features/profile/types";

const NotificationsPage = () => {
  const {
    pushNotifications,
    emailNotifications,
    loading,
    saving,
    error,
    togglePush,
    toggleEmail,
    handleSave,
  } = useNotifications();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const notificationGroups = [
    {
      title: "Push Notifications",
      description: "Receive notifications on your device",
      icon: Bell,
      items: [
        {
          key: "recommendations" as const,
          label: "New Recommendations",
          description: "Get notified when we have new places for you",
          icon: Star,
        },
        {
          key: "favorites" as const,
          label: "Favorites Updates",
          description: "Updates about your saved places",
          icon: Heart,
        },
        {
          key: "reviews" as const,
          label: "Review Responses",
          description: "When someone adds a review on a place you reviewed",
          icon: Star,
        },
        {
          key: "updates" as const,
          label: "App Updates",
          description: "New features and improvements",
          icon: Bell,
        },
      ],
      type: "push" as const,
    },
    {
      title: "Email Notifications",
      description: "Receive updates via email",
      icon: Mail,
      items: [
        {
          key: "monthlyDigest" as const,
          label: "Monthly Digest",
          description: "Monthly summary of top places and updates",
        },
        {
          key: "promotions" as const,
          label: "Promotions & Offers",
          description: "Special deals from partner venues",
        },
        {
          key: "tips" as const,
          label: "Tips & Tricks",
          description: "How to get the most out of the app",
        },
      ],
      type: "email" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => history.back()}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
        {notificationGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <group.icon className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {group.title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {group.description}
                </p>
              </div>
            </div>

            {/* Notification Items */}
            <div className="space-y-3">
              {group.items.map((item) => {
                const isChecked =
                  group.type === "push"
                    ? pushNotifications[
                        item.key as keyof NotificationSettings["push"]
                      ]
                    : emailNotifications[
                        item.key as keyof NotificationSettings["email"]
                      ];

                const handleToggle = () => {
                  if (group.type === "push") {
                    togglePush(item.key as keyof NotificationSettings["push"]);
                  } else {
                    toggleEmail(
                      item.key as keyof NotificationSettings["email"],
                    );
                  }
                };

                return (
                  <div
                    key={item.key}
                    className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:bg-muted/30 transition-colors"
                  >
                    <Checkbox
                      id={`${group.title}-${item.key}`}
                      checked={isChecked}
                      onCheckedChange={handleToggle}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor={`${group.title}-${item.key}`}
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        {item.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Info Card */}
        <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
          <p className="text-sm text-foreground">
            <span className="font-medium">💡 Tip:</span> You can customize these
            settings anytime. We'll respect your preferences.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => history.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
