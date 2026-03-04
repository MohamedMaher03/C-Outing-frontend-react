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
  Globe,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useSystemSettings } from "@/features/admin/hooks/useSystemSettings";

const SystemSettingsPage = () => {
  const { settings, loading, saving, saved, update, handleSave } =
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
      </div>

      {/* General Settings */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <Globe className="h-5 w-5 text-secondary" />
          </div>
          <h2 className="text-base font-semibold text-foreground">General</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Site Name</Label>
            <Input
              value={settings.siteName}
              onChange={(e) => update("siteName", e.target.value)}
              placeholder="Site name"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Default Language</Label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => update("defaultLanguage", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" /> Max Upload Size (MB)
            </Label>
            <Input
              type="number"
              value={settings.maxUploadSize}
              onChange={(e) =>
                update("maxUploadSize", parseInt(e.target.value) || 1)
              }
              min={1}
              max={50}
            />
          </div>
        </div>
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

      {/* Moderation Settings */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-secondary" />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Moderation
          </h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Auto-Flag Threshold (reports to auto-flag:{" "}
              {settings.autoFlagThreshold})
            </Label>
            <Slider
              value={[settings.autoFlagThreshold]}
              onValueChange={(v) => update("autoFlagThreshold", v[0])}
              min={1}
              max={10}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 report</span>
              <span>10 reports</span>
            </div>
          </div>
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
