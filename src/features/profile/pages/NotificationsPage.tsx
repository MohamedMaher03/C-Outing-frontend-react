import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  Heart,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [pushNotifications, setPushNotifications] = useState({
    recommendations: true,
    favorites: true,
    reviews: false,
    messages: true,
    updates: true,
  });

  const [emailNotifications, setEmailNotifications] = useState({
    weekly: true,
    monthly: false,
    promotions: true,
    tips: true,
  });

  const togglePush = (key: keyof typeof pushNotifications) => {
    setPushNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleEmail = (key: keyof typeof emailNotifications) => {
    setEmailNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    console.log("Saved notifications:", {
      pushNotifications,
      emailNotifications,
    });
    navigate("/profile");
  };

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
          description: "When someone responds to your reviews",
          icon: MessageSquare,
        },
        {
          key: "messages" as const,
          label: "Messages",
          description: "Direct messages from other users",
          icon: MessageSquare,
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
          key: "weekly" as const,
          label: "Weekly Digest",
          description: "Summary of top places and updates",
        },
        {
          key: "monthly" as const,
          label: "Monthly Newsletter",
          description: "Curated content and city guides",
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
            onClick={() => navigate("/profile")}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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
                        item.key as keyof typeof pushNotifications
                      ]
                    : emailNotifications[
                        item.key as keyof typeof emailNotifications
                      ];

                const handleToggle = () => {
                  if (group.type === "push") {
                    togglePush(item.key as keyof typeof pushNotifications);
                  } else {
                    toggleEmail(item.key as keyof typeof emailNotifications);
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
            onClick={() => navigate("/profile")}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
