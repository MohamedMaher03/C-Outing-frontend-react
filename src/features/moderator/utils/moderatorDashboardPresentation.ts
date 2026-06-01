import {
  Activity,
  AlertTriangle,
  MapPin,
  MessageSquare,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { ModeratorStats } from "@/features/moderator/types";
import { partitionStatCards } from "@/features/admin/utils/adminRecordMetrics";
import { formatCount } from "@/features/moderator/utils/formatters";

export interface ModeratorDashboardMetricCard {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

export interface ModeratorQuickNavLink {
  label: string;
  subtitle: string;
  to: string;
  icon: LucideIcon;
  iconClass: string;
}

type DashboardTranslator = (
  key: string,
  values?: Record<string, string | number>,
  fallback?: string,
) => string;

export const buildModeratorDashboardMetricCards = (
  stats: ModeratorStats,
  translate: DashboardTranslator,
): ModeratorDashboardMetricCard[] => [
  {
    label: translate("moderator.dashboard.stat.pendingReviews"),
    value: stats.pendingReviews,
    icon: MessageSquare,
    color: "bg-secondary/18 text-foreground",
  },
  {
    label: translate("moderator.dashboard.stat.flaggedPlaces"),
    value: stats.flaggedPlaces,
    icon: AlertTriangle,
    color: "bg-destructive/10 text-destructive",
  },
  {
    label: translate("moderator.dashboard.stat.openReports"),
    value: stats.openReports,
    icon: Shield,
    color: "bg-destructive/10 text-destructive",
  },
  {
    label: translate("moderator.dashboard.stat.resolvedToday"),
    value: stats.resolvedToday,
    icon: Activity,
    color: "bg-primary/10 text-primary",
  },
  {
    label: translate("moderator.dashboard.stat.resolvedThisWeek"),
    value: stats.resolvedThisWeek,
    icon: Activity,
    color: "bg-primary/10 text-primary",
  },
  {
    label: translate("moderator.dashboard.stat.totalModerated"),
    value: stats.totalModerated,
    icon: Shield,
    color: "bg-primary/20 text-primary",
  },
];

export const buildModeratorQuickNavLinks = (
  stats: ModeratorStats,
  translate: DashboardTranslator,
  locale: string,
): ModeratorQuickNavLink[] => [
  {
    label: translate("moderator.dashboard.quick.reviewQueue"),
    subtitle: translate("moderator.dashboard.quick.pending", {
      count: formatCount(stats.pendingReviews, locale),
    }),
    to: "/moderator/reviews",
    icon: MessageSquare,
    iconClass: "bg-secondary/18 text-foreground",
  },
  {
    label: translate("moderator.dashboard.quick.flaggedPlaces"),
    subtitle: translate("moderator.dashboard.quick.toReview", {
      count: formatCount(stats.flaggedPlaces, locale),
    }),
    to: "/moderator/places",
    icon: MapPin,
    iconClass: "bg-destructive/10 text-destructive",
  },
  {
    label: translate("moderator.dashboard.quick.reports"),
    subtitle: translate("moderator.dashboard.quick.open", {
      count: formatCount(stats.openReports, locale),
    }),
    to: "/moderator/reports",
    icon: AlertTriangle,
    iconClass: "bg-destructive/10 text-destructive",
  },
];

export { partitionStatCards as splitModeratorDashboardMetricCards };
