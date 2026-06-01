import {
  Activity,
  AlertTriangle,
  MapPin,
  MessageSquare,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AdminStats } from "@/features/admin/types";
import { partitionStatCards } from "@/features/admin/utils/adminRecordMetrics";

export const ADMIN_ACTIVITY_ICON_LOOKUP: Record<string, LucideIcon> = {
  user_joined: UserPlus,
  review_posted: MessageSquare,
  place_added: MapPin,
  report_filed: AlertTriangle,
};

export const ADMIN_ACTIVITY_TONE_LOOKUP: Record<string, string> = {
  user_joined: "bg-primary/10 text-primary",
  review_posted: "bg-secondary/18 text-foreground",
  place_added: "bg-muted text-foreground",
  report_filed: "bg-destructive/10 text-destructive",
};

export const ADMIN_ACTIVITY_ROW_INTRINSIC_SIZE = "88px";

const SYSTEM_STATUS_LABEL_KEY: Record<string, string> = {
  healthy: "admin.status.healthy",
  degraded: "admin.status.degraded",
  down: "admin.status.down",
};

export interface AdminDashboardMetricCard {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

export interface AdminOperationalHealthView {
  isHealthy: boolean;
  statusLabel: string;
  healthTimestampLabel: string;
}

type DashboardTranslator = (
  key: string,
  values?: Record<string, string | number>,
  fallback?: string,
) => string;

export const buildAdminDashboardMetricCards = (
  stats: AdminStats,
  translate: DashboardTranslator,
): AdminDashboardMetricCard[] => [
  {
    label: translate("admin.dashboard.stat.totalUsers"),
    value: stats.totalUsers,
    icon: Users,
    color: "bg-primary/10 text-primary",
  },
  {
    label: translate("admin.dashboard.stat.totalPlaces"),
    value: stats.totalPlaces,
    icon: MapPin,
    color: "bg-secondary/18 text-foreground",
  },
  {
    label: translate("admin.dashboard.stat.totalReviews"),
    value: stats.totalReviews,
    icon: MessageSquare,
    color: "bg-muted text-foreground",
  },
  {
    label: translate("admin.dashboard.stat.openReports"),
    value: stats.totalReports,
    icon: AlertTriangle,
    color: "bg-destructive/10 text-destructive",
  },
];

export const resolveAdminActivityVisuals = (activityType: string) => ({
  Icon: ADMIN_ACTIVITY_ICON_LOOKUP[activityType] ?? Activity,
  toneClass:
    ADMIN_ACTIVITY_TONE_LOOKUP[activityType] ??
    "bg-muted text-muted-foreground",
});

export const buildAdminOperationalHealthView = (
  stats: AdminStats,
  translate: DashboardTranslator,
  formatTimestamp: (value: Date) => string,
): AdminOperationalHealthView => {
  const normalizedStatus = (stats.systemStatus ?? "healthy").toLowerCase();
  const healthTimestamp = stats.healthTimestamp
    ? new Date(stats.healthTimestamp)
    : null;
  const hasValidTimestamp =
    healthTimestamp !== null && !Number.isNaN(healthTimestamp.getTime());

  return {
    isHealthy: normalizedStatus === "healthy",
    statusLabel:
      SYSTEM_STATUS_LABEL_KEY[normalizedStatus] !== undefined
        ? translate(SYSTEM_STATUS_LABEL_KEY[normalizedStatus])
        : (stats.systemStatus ?? translate("admin.status.unknown")),
    healthTimestampLabel: hasValidTimestamp
      ? formatTimestamp(healthTimestamp)
      : translate("admin.status.unknown"),
  };
};

export { partitionStatCards as splitAdminDashboardMetricCards };
