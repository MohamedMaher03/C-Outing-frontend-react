import type { Notification } from "../types";

export type NotificationDateGroup = "Today" | "Yesterday" | "Earlier";

export function formatRelativeNotificationTime(input: Date): string {
  const diffMs = Date.now() - input.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return input.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getDateGroup(input: Date): NotificationDateGroup {
  const now = new Date();
  const itemDate = new Date(input);

  const isToday =
    itemDate.getDate() === now.getDate() &&
    itemDate.getMonth() === now.getMonth() &&
    itemDate.getFullYear() === now.getFullYear();

  if (isToday) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    itemDate.getDate() === yesterday.getDate() &&
    itemDate.getMonth() === yesterday.getMonth() &&
    itemDate.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return "Yesterday";

  return "Earlier";
}

export function groupNotificationsByDate(
  notifications: Notification[],
): [NotificationDateGroup, Notification[]][] {
  const groups: Partial<Record<NotificationDateGroup, Notification[]>> = {};

  for (const notification of notifications) {
    const key = getDateGroup(new Date(notification.createdAt));
    if (!groups[key]) groups[key] = [];
    groups[key]!.push(notification);
  }

  const order: NotificationDateGroup[] = ["Today", "Yesterday", "Earlier"];
  return order.filter((key) => groups[key]).map((key) => [key, groups[key]!]);
}
