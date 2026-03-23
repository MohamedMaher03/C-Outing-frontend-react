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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useSystemSettings } from "@/features/admin/hooks/useSystemSettings";

const SystemSettingsPage = () => {
  const { settings, loading, saving, saved, error, update, handleSave } =
    useSystemSettings();

  if (loading || !settings) {
    return <LoadingSpinner size="md" text="Loading settings..." fullScreen />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-secondary" />
          System Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure application-wide settings
        </p>
        {error && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* Feature Toggles */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-secondary" />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Feature Toggles
          </h2>
        </div>

        <div className="space-y-4">
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
              <div className="space-y-1">
                <Label
                  htmlFor={item.key}
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  {item.label}
                </Label>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-card border border-red-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Maintenance Mode
            </h2>
            <p className="text-xs text-muted-foreground">
              When enabled, only admins can access the app
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-3 rounded-xl border border-red-100 bg-red-50/30">
          <Checkbox
            id="maintenanceMode"
            checked={settings.maintenanceMode}
            onCheckedChange={(checked) => update("maintenanceMode", !!checked)}
            className="mt-0.5"
          />
          <Label
            htmlFor="maintenanceMode"
            className="text-sm font-medium text-red-700 cursor-pointer"
          >
            Enable Maintenance Mode
          </Label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-navy-light font-semibold"
        >
          <Save className="h-4 w-4" />
          {saved ? "Saved ✓" : saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
