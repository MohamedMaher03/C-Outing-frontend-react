/**
 * System Settings Page (Admin)
 *
 * App-wide configuration: maintenance mode, upload limits, feature toggles.
 */

import {
  Settings,
  Save,
  Shield,
  Bell,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { useSystemSettings } from "@/features/admin/hooks/useSystemSettings";

const SystemSettingsPage = () => {
  const navigate = useNavigate();
  const {
    settings,
    loading,
    saving,
    saved,
    error,
    hasUnsavedChanges,
    retry,
    update,
    handleSave,
  } = useSystemSettings();

  if (loading) {
    return <LoadingSpinner size="md" text="Loading settings..." fullScreen />;
  }

  if (!settings) {
    return (
      <AdminPageLayout maxWidth="3xl" className="py-8">
        <AdminPageHeader
          title="System Settings"
          description="Configure application-wide settings"
          icon={Settings}
        />
        <AdminErrorBanner
          title="Couldn't load settings"
          message={error ?? "Failed to load system settings."}
          onRetry={() => {
            void retry();
          }}
        />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout maxWidth="3xl">
      {/* Header */}
      <AdminPageHeader
        title="System Settings"
        description="Configure application-wide settings"
        icon={Settings}
      />

      <AdminErrorBanner
        title="Couldn't load or save settings"
        message={error}
        onRetry={() => {
          void retry();
        }}
      />

      <AdminSection
        title="Feature Toggles"
        description="Control global behavior for communication and moderation"
        tone="surface"
        contentClassName="gap-4"
      >
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/25 px-3 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
            <Shield className="h-5 w-5 text-secondary" />
          </div>
          <p className="text-role-secondary text-muted-foreground">
            Changes take effect after saving this page.
          </p>
        </div>

        <div className="space-y-2">
          {[
            {
              key: "enableNotifications" as const,
              label: "Enable Notifications",
              desc: "Allow push and email notifications to users",
              icon: Bell,
            },
            {
              key: "enableReviews" as const,
              label: "Enable Reviews",
              desc: "Allow users to post reviews on places",
              icon: MessageSquare,
            },
            {
              key: "moderationRequired" as const,
              label: "Require Moderation",
              desc: "New reviews must be approved before publishing",
              icon: Shield,
            },
          ].map((item) => (
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
                  {item.label}
                </Label>
                <p className="text-role-caption text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AdminSection>

      {/* Maintenance Mode */}
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
              Maintenance Mode
            </h2>
            <p className="text-role-caption text-muted-foreground">
              When enabled, only admins can access the app
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
            Enable Maintenance Mode
          </Label>
        </div>
      </AdminSection>

      {/* Save Button */}
      <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-border/60 bg-background/95 pt-3 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex-1 w-full"
        >
          Cancel
        </Button>
        <Button
          onClick={() => void handleSave()}
          disabled={saving || !hasUnsavedChanges}
          className="w-full flex-1 gap-2 font-semibold"
        >
          <Save className="h-4 w-4" />
          {saved ? "Saved ✓" : saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </AdminPageLayout>
  );
};

export default SystemSettingsPage;
