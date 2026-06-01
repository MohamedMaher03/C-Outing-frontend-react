import { useCallback, useMemo } from "react";
import { useReportedContent } from "@/features/moderator/hooks/useReportedContent";
import { MODERATOR_REPORT_STATUS_FILTER_OPTIONS } from "@/features/moderator/constants/filterOptions";
import { localizeModeratorReportFilters } from "@/features/admin/utils/adminFilterLabels";
import {
  deriveReportRowActionPendingFlags,
  tallyReportQueueSummary,
} from "@/features/moderator/utils/moderatorQueueMetrics";
import { useI18n } from "@/components/i18n";

export const useReportedContentPage = () => {
  const { t, locale } = useI18n();
  const reportQueue = useReportedContent();

  const statusFilterOptions = useMemo(
    () =>
      localizeModeratorReportFilters(
        MODERATOR_REPORT_STATUS_FILTER_OPTIONS,
        t,
      ),
    [t],
  );

  const reportQueueSummary = useMemo(
    () => tallyReportQueueSummary(reportQueue.reports),
    [reportQueue.reports],
  );

  const resolveEmptyDescription = () =>
    reportQueue.search.trim().length > 0
      ? t("moderator.reports.empty.withSearch")
      : t("moderator.reports.empty.default");

  const toggleReportDetails = useCallback(
    (reportId: string, isExpanded: boolean) => {
      reportQueue.setExpandedId(isExpanded ? null : reportId);
    },
    [reportQueue],
  );

  const deriveRowActionFlags = (reportId: string) =>
    deriveReportRowActionPendingFlags(
      reportId,
      reportQueue.pendingReportIdSet,
      reportQueue.actionLoading,
    );

  const retryReportQueue = () => void reportQueue.retry();

  return {
    t,
    locale,
    ...reportQueue,
    statusFilterOptions,
    reportQueueSummary,
    resolveEmptyDescription,
    toggleReportDetails,
    deriveRowActionFlags,
    retryReportQueue,
  };
};
