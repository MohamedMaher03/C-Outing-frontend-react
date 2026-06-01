import type { NotificationFilterTab } from "@/features/notifications/types";

export const NOTIFICATION_FILTER_TABS = [
  "all",
  "unread",
] as const satisfies readonly NotificationFilterTab[];

export const NOTIFICATION_FILTER_TAB_LABEL_KEY: Readonly<
  Record<NotificationFilterTab, string>
> = {
  all: "notifications.filter.all",
  unread: "notifications.filter.unread",
};

export const NOTIFICATION_EMPTY_STATE_KEY: Readonly<
  Record<NotificationFilterTab, { title: string; hint: string }>
> = {
  all: {
    title: "notifications.empty.all",
    hint: "notifications.empty.hint",
  },
  unread: {
    title: "notifications.empty.unread",
    hint: "notifications.empty.hint",
  },
};
