import { useMemo } from "react";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";
import {
  buildAdminDashboardMetricCards,
  buildAdminOperationalHealthView,
  splitAdminDashboardMetricCards,
} from "@/features/admin/utils/adminDashboardPresentation";
import { useI18n } from "@/components/i18n";

export const useAdminDashboardPage = () => {
  const { t, locale, formatNumber } = useI18n();
  const dashboard = useAdminDashboard();

  const activityDateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  );

  const metricCards = dashboard.stats
    ? buildAdminDashboardMetricCards(dashboard.stats, t)
    : [];
  const { primary: primaryMetricCards, secondary: secondaryMetricCards } =
    splitAdminDashboardMetricCards(metricCards);

  const operationalHealth = dashboard.stats
    ? buildAdminOperationalHealthView(
        dashboard.stats,
        t,
        (value) => activityDateTimeFormatter.format(value),
      )
    : null;

  const formatActivityTimestamp = (timestamp: string | Date) =>
    activityDateTimeFormatter.format(
      timestamp instanceof Date ? timestamp : new Date(timestamp),
    );

  const retryDashboard = () => void dashboard.retry();

  return {
    t,
    formatNumber,
    ...dashboard,
    primaryMetricCards,
    secondaryMetricCards,
    operationalHealth,
    formatActivityTimestamp,
    retryDashboard,
  };
};
