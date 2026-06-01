import { useMemo } from "react";
import { useModerateReviews } from "@/features/moderator/hooks/useModerateReviews";
import { MODERATOR_REVIEW_STATUS_FILTER_OPTIONS } from "@/features/moderator/constants/filterOptions";
import { localizeAdminStatusFilters } from "@/features/admin/utils/adminFilterLabels";
import { tallyReviewQueueSummary } from "@/features/moderator/utils/moderatorQueueMetrics";
import { usePaginationJump } from "@/hooks/usePaginationJump";
import { useI18n } from "@/components/i18n";

export const useModerateReviewsPage = () => {
  const { t, locale } = useI18n();
  const reviewQueue = useModerateReviews();

  const statusFilterOptions = useMemo(
    () =>
      localizeAdminStatusFilters(MODERATOR_REVIEW_STATUS_FILTER_OPTIONS, t),
    [t],
  );

  const paginationJump = usePaginationJump(
    reviewQueue.pageIndex,
    reviewQueue.goToPage,
  );

  const reviewQueueSummary = useMemo(
    () => tallyReviewQueueSummary(reviewQueue.reviews),
    [reviewQueue.reviews],
  );

  const resolveEmptyDescription = () =>
    reviewQueue.search.trim().length > 0
      ? t("moderator.reviews.empty.withSearch")
      : t("moderator.reviews.empty.default");

  const retryReviewQueue = () => void reviewQueue.retry();

  return {
    t,
    locale,
    ...reviewQueue,
    ...paginationJump,
    statusFilterOptions,
    reviewQueueSummary,
    resolveEmptyDescription,
    retryReviewQueue,
  };
};
