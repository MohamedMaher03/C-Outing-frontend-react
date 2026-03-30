import { ArrowLeft, Bell, Mail, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useNotifications } from "@/features/profile/hooks/useNotifications";
import type { NotificationSettings } from "@/features/profile/types";

type PushNotificationKey = keyof NotificationSettings["push"];
type EmailNotificationKey = keyof NotificationSettings["email"];

type NotificationItem = {
  key: PushNotificationKey | EmailNotificationKey;
  label: string;
  description: string;
};

type NotificationGroup = {
  id: "push" | "email";
  title: string;
  description: string;
  icon: LucideIcon;
  items: NotificationItem[];
  type: "push" | "email";
};

const NOTIFICATION_GROUPS: NotificationGroup[] = [
  {
    id: "push",
    title: "Push Notifications",
    description: "Alerts sent to your phone",
    icon: Bell,
    items: [
      {
        key: "recommendations",
        label: "New Recommendations",
        description: "Know when we find new spots that match your preferences.",
      },
      {
        key: "favorites",
        label: "Favorites Updates",
        description: "Get updates about places you have saved.",
      },
      {
        key: "reviews",
        label: "Review Responses",
        description: "Know when there is new activity on places you reviewed.",
      },
      {
        key: "updates",
        label: "App Updates",
        description: "Get product updates and important changes.",
      },
    ],
    type: "push",
  },
  {
    id: "email",
    title: "Email Notifications",
    description: "Updates sent to your inbox",
    icon: Mail,
    items: [
      {
        key: "monthlyDigest",
        label: "Monthly Digest",
        description: "A monthly roundup of trending places and updates.",
      },
      {
        key: "promotions",
        label: "Promotions & Offers",
        description: "Special offers from partner venues.",
      },
      {
        key: "tips",
        label: "Tips & Tricks",
        description: "Simple tips to get more from C-Outing.",
      },
    ],
    type: "email",
  },
];

const NotificationsPage = () => {
  const navigate = useNavigate();
  const {
    pushNotifications,
    emailNotifications,
    loading,
    saving,
    error,
    togglePush,
    toggleEmail,
    handleSave,
    reloadSettings,
  } = useNotifications();

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
          <h1 className="text-role-subheading text-foreground">
            Notifications
          </h1>
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
                disabled={loading || saving}
              >
                Try again
              </Button>
            </div>
          </div>
        )}
        <div className="grid gap-[clamp(1rem,2vw,1.75rem)] xl:grid-cols-2">
          {NOTIFICATION_GROUPS.map((group) => (
            <section key={group.title} className="space-y-3">
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <group.icon className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h2 className="text-role-body font-semibold text-foreground">
                    {group.title}
                  </h2>
                  <p className="text-role-caption text-muted-foreground">
                    {group.description}
                  </p>
                </div>
              </div>

              {/* Notification Items */}
              <Card className="overflow-hidden rounded-2xl border-border/80 bg-card/60">
                <CardContent className="divide-y divide-border/70 p-0">
                  {group.items.map((item) => {
                    const itemId = `${group.id}-${item.key}`;
                    const isChecked =
                      group.type === "push"
                        ? pushNotifications[item.key as PushNotificationKey]
                        : emailNotifications[item.key as EmailNotificationKey];

                    const handleToggle = () => {
                      if (group.type === "push") {
                        togglePush(item.key as PushNotificationKey);
                      } else {
                        toggleEmail(item.key as EmailNotificationKey);
                      }
                    };

                    return (
                      <div
                        key={itemId}
                        className="flex items-start gap-3 px-4 py-3 transition-colors duration-200 ease-out hover:bg-muted/20 motion-reduce:transition-none sm:gap-4 sm:px-5 sm:py-4"
                      >
                        <Checkbox
                          id={itemId}
                          checked={Boolean(isChecked)}
                          onCheckedChange={handleToggle}
                          className="mt-1 h-5 w-5"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <Label
                            htmlFor={itemId}
                            className="block py-1 text-role-secondary font-semibold text-foreground cursor-pointer break-words"
                          >
                            {item.label}
                          </Label>
                          <p className="text-role-caption text-muted-foreground break-words">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </section>
          ))}
        </div>

        {/* Info Card */}
        <Card className="rounded-xl border-secondary/20 bg-secondary/5">
          <CardContent className="p-4">
            <p className="text-role-secondary text-foreground">
              <span className="font-semibold">Tip:</span> You can change these
              at any time. We only send what you keep enabled.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="hidden gap-3 pt-2 sm:flex">
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
            disabled={saving}
            className="flex-1 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
          >
            {saving ? "Saving changes..." : "Save notification settings"}
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
              disabled={saving}
              className="flex-1 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
            >
              {saving ? "Saving changes..." : "Save notification settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
