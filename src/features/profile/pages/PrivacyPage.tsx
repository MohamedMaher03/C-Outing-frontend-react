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
import { useI18n } from "@/components/i18n";

type PrivacySettingKey = keyof PrivacySettings;

type PrivacySection = {
  titleKey: string;
  icon: typeof Eye | typeof Database;
  items: Array<{
    key: PrivacySettingKey;
    labelKey: string;
    descriptionKey: string;
  }>;
};

const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    titleKey: "profile.privacy.section.visibility",
    icon: Eye,
    items: [
      {
        key: "showFavorites",
        labelKey: "profile.privacy.item.showFavorites.label",
        descriptionKey: "profile.privacy.item.showFavorites.description",
      },
      {
        key: "showActivity",
        labelKey: "profile.privacy.item.showActivity.label",
        descriptionKey: "profile.privacy.item.showActivity.description",
      },
    ],
  },
  {
    titleKey: "profile.privacy.section.data",
    icon: Database,
    items: [
      {
        key: "dataCollection",
        labelKey: "profile.privacy.item.dataCollection.label",
        descriptionKey: "profile.privacy.item.dataCollection.description",
      },
      {
        key: "personalization",
        labelKey: "profile.privacy.item.personalization.label",
        descriptionKey: "profile.privacy.item.personalization.description",
      },
    ],
  },
];

const PrivacyPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
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
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            aria-label={t("profile.privacy.backToProfileAria")}
            className="h-11 w-11 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-secondary" />
            <h1 className="text-role-subheading text-foreground">
              {t("profile.privacy.title")}
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
                {t("common.retry")}
              </Button>
            </div>
          </div>
        )}
        <div className="grid gap-[clamp(1rem,2vw,1.75rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="space-y-[clamp(1rem,2.2vw,1.75rem)]">
            {PRIVACY_SECTIONS.map((section) => (
              <section key={section.titleKey} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <section.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <h2 className="text-role-body font-semibold text-foreground">
                    {t(section.titleKey)}
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
                            {t(item.labelKey)}
                          </Label>
                          <p className="text-role-caption text-muted-foreground break-words">
                            {t(item.descriptionKey)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            ))}
          </div>

          <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-secondary" />
              </div>
              <h2 className="text-role-body font-semibold text-foreground">
                {t("profile.privacy.accountSafety")}
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
                        {t("profile.privacy.delete.title")}
                      </p>
                      <p className="text-xs text-muted-foreground break-words">
                        {t("profile.privacy.delete.description")}
                      </p>
                    </div>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("profile.privacy.delete.dialogTitle")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("profile.privacy.delete.dialogDescription")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {t("profile.privacy.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting
                      ? t("profile.privacy.delete.deleting")
                      : t("profile.privacy.delete.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Card className="rounded-xl border-border/70 bg-card/60">
              <CardContent className="p-3">
                <p className="text-role-caption text-muted-foreground">
                  {t("profile.privacy.delete.note")}
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>

        <Card className="rounded-xl border-secondary/20 bg-secondary/5">
          <CardContent className="p-4">
            <p className="text-role-secondary text-foreground">
              <span className="font-semibold">
                {t("profile.privacy.info.title")}
              </span>{" "}
              {t("profile.privacy.info.descriptionPrefix")}{" "}
              <a
                href="mailto:farouqdiaaeldin@gmail.com?subject=Privacy%20Policy%20Request"
                className="text-secondary underline"
              >
                {t("profile.privacy.info.link")}
              </a>
              {t("profile.privacy.info.descriptionSuffix")}
            </p>
          </CardContent>
        </Card>

        <div className="hidden gap-3 pt-4 sm:flex">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="flex-1"
          >
            {t("profile.privacy.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || deleting}
            className="flex-1 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
          >
            {saving ? t("profile.privacy.saving") : t("profile.privacy.save")}
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
              {t("profile.privacy.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || deleting}
              className="flex-1 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
            >
              {saving ? t("profile.privacy.saving") : t("profile.privacy.save")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
