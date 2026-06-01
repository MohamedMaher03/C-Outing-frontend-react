import {
  Bell,
  MessageSquare,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { SystemSettings } from "@/features/admin/types";

export interface SystemSettingToggleSpec {
  key: keyof Pick<
    SystemSettings,
    "enableNotifications" | "enableReviews" | "moderationRequired"
  >;
  labelKey: string;
  descriptionKey: string;
  icon: LucideIcon;
}

export const SYSTEM_SETTING_TOGGLES: readonly SystemSettingToggleSpec[] = [
  {
    key: "enableNotifications",
    labelKey: "admin.settings.toggle.notifications.label",
    descriptionKey: "admin.settings.toggle.notifications.description",
    icon: Bell,
  },
  {
    key: "enableReviews",
    labelKey: "admin.settings.toggle.reviews.label",
    descriptionKey: "admin.settings.toggle.reviews.description",
    icon: MessageSquare,
  },
  {
    key: "moderationRequired",
    labelKey: "admin.settings.toggle.moderation.label",
    descriptionKey: "admin.settings.toggle.moderation.description",
    icon: Shield,
  },
];

type SettingsTranslator = (
  key: string,
  values?: Record<string, string | number>,
  fallback?: string,
) => string;

export const resolveSystemSettingsSaveLabel = (
  saved: boolean,
  saving: boolean,
  translate: SettingsTranslator,
): string => {
  if (saved) return translate("admin.settings.actions.saved");
  if (saving) return translate("admin.settings.actions.saving");
  return translate("admin.settings.actions.save");
};
