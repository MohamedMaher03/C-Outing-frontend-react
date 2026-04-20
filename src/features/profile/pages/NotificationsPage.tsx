import { ArrowLeft, Bell, Mail, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useNotifications } from "@/features/profile/hooks/useNotifications";
import type { NotificationSettings } from "@/features/profile/types";
import { useI18n } from "@/components/i18n";

type PushNotificationKey = keyof NotificationSettings["push"];
type EmailNotificationKey = keyof NotificationSettings["email"];

type NotificationItem = {
  key: PushNotificationKey | EmailNotificationKey;
  labelKey: string;
  descriptionKey: string;
};

type NotificationGroup = {
  id: "push" | "email";
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  items: NotificationItem[];
  type: "push" | "email";
};

const NOTIFICATION_GROUPS: NotificationGroup[] = [
  {
    id: "push",
    titleKey: "profile.notifications.group.push.title",
    descriptionKey: "profile.notifications.group.push.description",
    icon: Bell,
    items: [
      {
        key: "recommendations",
        labelKey: "profile.notifications.group.push.recommendations.label",
        descriptionKey:
          "profile.notifications.group.push.recommendations.description",
      },
      {
        key: "favorites",
        labelKey: "profile.notifications.group.push.favorites.label",
        descriptionKey:
          "profile.notifications.group.push.favorites.description",
      },
      {
        key: "reviews",
        labelKey: "profile.notifications.group.push.reviews.label",
        descriptionKey: "profile.notifications.group.push.reviews.description",
      },
      {
        key: "updates",
        labelKey: "profile.notifications.group.push.updates.label",
        descriptionKey: "profile.notifications.group.push.updates.description",
      },
    ],
    type: "push",
  },
  {
    id: "email",
    titleKey: "profile.notifications.group.email.title",
    descriptionKey: "profile.notifications.group.email.description",
    icon: Mail,
    items: [
      {
        key: "monthlyDigest",
        labelKey: "profile.notifications.group.email.monthlyDigest.label",
        descriptionKey:
          "profile.notifications.group.email.monthlyDigest.description",
      },
      {
        key: "promotions",
        labelKey: "profile.notifications.group.email.promotions.label",
        descriptionKey:
          "profile.notifications.group.email.promotions.description",
      },
      {
        key: "tips",
        labelKey: "profile.notifications.group.email.tips.label",
        descriptionKey: "profile.notifications.group.email.tips.description",
      },
    ],
    type: "email",
  },
];

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
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
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            aria-label={t("profile.notifications.backToProfileAria")}
            className="h-11 w-11 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
          <h1 className="text-role-subheading text-foreground">
            {t("profile.notifications.title")}
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
                {t("common.retry")}
              </Button>
            </div>
          </div>
        )}
        <div className="grid gap-[clamp(1rem,2vw,1.75rem)] xl:grid-cols-2">
          {NOTIFICATION_GROUPS.map((group) => (
            <section key={group.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <group.icon className="h-5 w-5 text-secondary dark:text-primary" />
                </div>
                <div>
                  <h2 className="text-role-body font-semibold text-foreground">
                    {t(group.titleKey)}
                  </h2>
                  <p className="text-role-caption text-muted-foreground">
                    {t(group.descriptionKey)}
                  </p>
                </div>
              </div>

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
                            {t(item.labelKey)}
                          </Label>
                          <p className="text-role-caption text-muted-foreground break-words">
                            {t(item.descriptionKey)}
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

        <Card className="rounded-xl border-secondary/20 bg-secondary/5">
          <CardContent className="p-4">
            <p className="text-role-secondary text-foreground">
              <span className="font-semibold">
                {t("profile.notifications.tipLabel")}
              </span>{" "}
              {t("profile.notifications.tipBody")}
            </p>
          </CardContent>
        </Card>

        <div className="hidden gap-3 pt-2 sm:flex">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="flex-1"
          >
            {t("profile.notifications.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
          >
            {saving
              ? t("profile.notifications.saving")
              : t("profile.notifications.save")}
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
              {t("profile.notifications.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
            >
              {saving
                ? t("profile.notifications.saving")
                : t("profile.notifications.save")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
