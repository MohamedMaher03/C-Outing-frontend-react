import { useMemo } from "react";
import { useManageReviews } from "@/features/admin/hooks/useManageReviews";
import { REVIEW_STATUS_FILTER_OPTIONS } from "@/features/admin/constants/filterOptions";
import { reviewStatusConfig } from "@/features/admin/constants/statusConfigs";
import { localizeAdminStatusFilters } from "@/features/admin/utils/adminFilterLabels";
import { countRecordsWhere } from "@/features/admin/utils/adminRecordMetrics";
import { usePaginationJump } from "@/hooks/usePaginationJump";
import { useI18n } from "@/components/i18n";

export const useManageReviewsPage = () => {
  const { t, locale, formatNumber } = useI18n();
  const reviewRegistry = useManageReviews();

  const monthDayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
      }),
    [locale],
  );

  const statusFilterOptions = useMemo(
    () => localizeAdminStatusFilters(REVIEW_STATUS_FILTER_OPTIONS, t),
    [t],
  );

  const paginationJump = usePaginationJump(
    reviewRegistry.pageIndex,
    reviewRegistry.goToPage,
  );

  const flaggedReviewsCount = countRecordsWhere(
    reviewRegistry.reviews,
    (review) => review.status === "flagged",
  );

  const pendingReviewsCount = countRecordsWhere(
    reviewRegistry.reviews,
    (review) => review.status === "pending",
  );

  const resolveStatusLabel = (status: keyof typeof reviewStatusConfig) =>
    t(`admin.status.${status}`);

  const formatReviewCreatedOn = (createdAt: string | Date) =>
    monthDayFormatter.format(
      createdAt instanceof Date ? createdAt : new Date(createdAt),
    );

  const retryReviewRegistry = () => void reviewRegistry.retry();

  return {
    t,
    formatNumber,
    ...reviewRegistry,
    ...paginationJump,
    statusFilterOptions,
    flaggedReviewsCount,
    pendingReviewsCount,
    resolveStatusLabel,
    formatReviewCreatedOn,
    retryReviewRegistry,
  };
};
