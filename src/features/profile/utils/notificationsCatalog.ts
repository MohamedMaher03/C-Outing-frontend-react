import { Bell, Mail, type LucideIcon } from "lucide-react";
import type { NotificationSettings } from "@/features/profile/types";

export type PushNotificationKey = keyof NotificationSettings["push"];
export type EmailNotificationKey = keyof NotificationSettings["email"];

export interface NotificationCatalogItem {
  key: PushNotificationKey | EmailNotificationKey;
  labelKey: string;
  descriptionKey: string;
}

export interface NotificationCatalogGroup {
  id: "push" | "email";
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  items: NotificationCatalogItem[];
  channel: "push" | "email";
}

export const NOTIFICATION_CATALOG: NotificationCatalogGroup[] = [
  {
    id: "push",
    titleKey: "profile.notifications.group.push.title",
    descriptionKey: "profile.notifications.group.push.description",
    icon: Bell,
    channel: "push",
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
  },
  {
    id: "email",
    titleKey: "profile.notifications.group.email.title",
    descriptionKey: "profile.notifications.group.email.description",
    icon: Mail,
    channel: "email",
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
  },
];

export const resolveNotificationToggleState = (
  channel: "push" | "email",
  key: PushNotificationKey | EmailNotificationKey,
  pushSettings: NotificationSettings["push"],
  emailSettings: NotificationSettings["email"],
): boolean =>
  channel === "push"
    ? pushSettings[key as PushNotificationKey]
    : emailSettings[key as EmailNotificationKey];
