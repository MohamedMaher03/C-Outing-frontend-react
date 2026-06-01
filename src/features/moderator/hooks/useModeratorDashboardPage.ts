import { useModeratorDashboard } from "@/features/moderator/hooks/useModeratorDashboard";
import {
  buildModeratorDashboardMetricCards,
  buildModeratorQuickNavLinks,
  splitModeratorDashboardMetricCards,
} from "@/features/moderator/utils/moderatorDashboardPresentation";
import { formatDateTime } from "@/features/moderator/utils/formatters";
import { useI18n } from "@/components/i18n";

export const useModeratorDashboardPage = () => {
  const { t, locale } = useI18n();
  const dashboard = useModeratorDashboard();

  const metricCards = dashboard.stats
    ? buildModeratorDashboardMetricCards(dashboard.stats, t)
    : [];
  const { primary: primaryMetricCards, secondary: secondaryMetricCards } =
    splitModeratorDashboardMetricCards(metricCards, 3);

  const quickNavLinks = dashboard.stats
    ? buildModeratorQuickNavLinks(dashboard.stats, t, locale)
    : [];

  const formatActionTimestamp = (timestamp: string | Date) =>
    formatDateTime(timestamp, locale);

  const resolveActionVerb = (action: string) =>
    t(`moderator.dashboard.action.${action}`, undefined, action);

  const resolveItemTypeLabel = (itemType: string) =>
    t(`moderator.dashboard.itemType.${itemType}`, undefined, itemType);

  const retryDashboard = () => void dashboard.retry();

  return {
    t,
    locale,
    ...dashboard,
    primaryMetricCards,
    secondaryMetricCards,
    quickNavLinks,
    formatActionTimestamp,
    resolveActionVerb,
    resolveItemTypeLabel,
    retryDashboard,
  };
};
