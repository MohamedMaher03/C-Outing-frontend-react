import { Database, Eye } from "lucide-react";
import type { PrivacySettings } from "@/features/profile/types";

export type PrivacySettingKey = keyof PrivacySettings;

export interface PrivacyCatalogSection {
  titleKey: string;
  icon: typeof Eye | typeof Database;
  items: Array<{
    key: PrivacySettingKey;
    labelKey: string;
    descriptionKey: string;
  }>;
}

export const PRIVACY_CATALOG: PrivacyCatalogSection[] = [
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

export const PRIVACY_SUPPORT_MAILTO =
  "mailto:support@cairo-outing.com?subject=Privacy%20Policy%20Request";
