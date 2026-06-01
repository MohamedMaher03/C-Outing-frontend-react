import {
  Settings,
  Save,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  AdminErrorBanner,
  AdminPageHeader,
  AdminPageLayout,
  AdminSection,
} from "@/features/admin/components";
import { useSystemSettingsPage } from "@/features/admin/hooks/useSystemSettingsPage";

const SystemSettingsPage = () => {
  const {
    t,
    settings,
    loading,
    saving,
    error,
    hasUnsavedChanges,
    settingToggleSpecs,
    saveActionLabel,
    navigateBack,
    persistSettings,
    retrySettingsLoad,
    update,
  } = useSystemSettingsPage();

  if (loading) {
    return (
      <LoadingSpinner size="md" text={t("admin.settings.loading")} fullScreen />
    );
  }

  if (!settings) {
    return (
      <AdminPageLayout maxWidth="3xl" className="py-8">
        <AdminPageHeader
          title={t("admin.settings.header.title")}
          description={t("admin.settings.header.description")}
          icon={Settings}
        />
        <AdminErrorBanner
          title={t("admin.settings.error.loadTitle")}
          message={error ?? t("admin.settings.error.loadMessage")}
          onRetry={retrySettingsLoad}
        />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout maxWidth="3xl">
      <AdminPageHeader
        title={t("admin.settings.header.title")}
        description={t("admin.settings.header.description")}
        icon={Settings}
      />

      <AdminErrorBanner
        title={t("admin.settings.error.syncTitle")}
        message={error}
        onRetry={retrySettingsLoad}
      />

      <AdminSection
        title={t("admin.settings.section.toggles.title")}
        description={t("admin.settings.section.toggles.description")}
        tone="surface"
        contentClassName="gap-4"
      >
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/25 px-3 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
            <Shield className="h-5 w-5 text-secondary" />
          </div>
          <p className="text-role-secondary text-muted-foreground">
            {t("admin.settings.section.toggles.notice")}
          </p>
        </div>

        <div className="space-y-2">
          {settingToggleSpecs.map((item) => (
            <div
              key={item.key}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors"
            >
              <Checkbox
                id={item.key}
                checked={settings[item.key] as boolean}
                onCheckedChange={(checked) => update(item.key, !!checked)}
                className="mt-0.5"
              />
              <item.icon
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <Label
                  htmlFor={item.key}
                  className="cursor-pointer text-role-secondary font-medium text-foreground"
                >
                  {t(item.labelKey)}
                </Label>
                <p className="text-role-caption text-muted-foreground">
                  {t(item.descriptionKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AdminSection>
      <AdminSection
        tone="surface"
        className="border-destructive/30"
        contentClassName="gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-role-body font-semibold text-foreground">
              {t("admin.settings.maintenance.title")}
            </h2>
            <p className="text-role-caption text-muted-foreground">
              {t("admin.settings.maintenance.description")}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-3 rounded-xl border border-destructive/20 bg-destructive/5">
          <Checkbox
            id="maintenanceMode"
            checked={settings.maintenanceMode}
            onCheckedChange={(checked) => update("maintenanceMode", !!checked)}
            className="mt-0.5"
          />
          <Label
            htmlFor="maintenanceMode"
            className="cursor-pointer text-role-secondary font-medium text-destructive"
          >
            {t("admin.settings.maintenance.toggle")}
          </Label>
        </div>
      </AdminSection>
      <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-border/60 bg-background/95 pt-3 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row">
        <Button
          variant="ghost"
          onClick={navigateBack}
          className="flex-1 w-full"
        >
          {t("admin.settings.actions.cancel")}
        </Button>
        <Button
          onClick={persistSettings}
          disabled={saving || !hasUnsavedChanges}
          className="w-full flex-1 gap-2 font-semibold"
        >
          <Save className="h-4 w-4" />
          {saveActionLabel}
        </Button>
      </div>
    </AdminPageLayout>
  );
};

export default SystemSettingsPage;
