/**
 * useModerateReviews Hook
 * Manages state and actions for the Moderate Reviews moderator page.
 *
 * Data access is delegated to moderatorService to keep hook concerns focused on UI state.
 */

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AdminReview, AdminReviewStatus } from "@/features/admin/types";
import { moderatorService } from "@/features/moderator/services/moderatorService";
import type { ModeratorReviewStatusFilter } from "@/features/moderator/types";
import { filterModerationReviews } from "@/features/moderator/utils/moderatorFilters";
import { getErrorMessage } from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

interface UseModerateReviewsReturn {
  // State
  reviews: AdminReview[];
  loading: boolean;
  error: string | null;
  pendingReviewIds: string[];
  pendingReviewIdSet: ReadonlySet<string>;
  search: string;
  statusFilter: ModeratorReviewStatusFilter;
  filteredReviews: AdminReview[];

  // Setters
  setSearch: (value: string) => void;
  setStatusFilter: (value: ModeratorReviewStatusFilter) => void;

  // Actions
  retry: () => Promise<void>;
  handleApprove: (reviewId: string) => Promise<void>;
  handleReject: (reviewId: string) => Promise<void>;
  handleFlag: (reviewId: string) => Promise<void>;
}

export const useModerateReviews = (): UseModerateReviewsReturn => {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingReviewIds, setPendingReviewIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ModeratorReviewStatusFilter>("pending");
  const deferredSearch = useDeferredValue(search);
  const mountedRef = useRef(true);
  const inFlightRef = useRef(new Set<string>());
  const pendingReviewIdSet = useMemo(
    () => new Set(pendingReviewIds),
    [pendingReviewIds],
  );

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await moderatorService.getReviews();
      if (!mountedRef.current) return;
      setReviews(data);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, t("moderator.error.loadReviews")));
      setReviews([]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    mountedRef.current = true;
    void loadReviews();

    return () => {
      mountedRef.current = false;
    };
  }, [loadReviews]);

  const addPendingReview = useCallback((reviewId: string) => {
    setPendingReviewIds((prev) =>
      prev.includes(reviewId) ? prev : [...prev, reviewId],
    );
  }, []);

  const removePendingReview = useCallback((reviewId: string) => {
    setPendingReviewIds((prev) => prev.filter((id) => id !== reviewId));
  }, []);

  const handleStatusChange = useCallback(
    async (reviewId: string, status: AdminReviewStatus) => {
      if (inFlightRef.current.has(reviewId)) {
        return;
      }

      inFlightRef.current.add(reviewId);
      addPendingReview(reviewId);
      setError(null);

      try {
        await moderatorService.updateReviewStatus(reviewId, status);
        if (!mountedRef.current) return;

        setReviews((prev) =>
          prev.map((review) =>
            review.id === reviewId ? { ...review, status } : review,
          ),
        );
      } catch (err) {
        if (!mountedRef.current) return;
        setError(getErrorMessage(err, t("moderator.error.updateReviewStatus")));
      } finally {
        inFlightRef.current.delete(reviewId);
        if (mountedRef.current) {
          removePendingReview(reviewId);
        }
      }
    },
    [addPendingReview, removePendingReview, t],
  );

  const handleApprove = useCallback(
    async (reviewId: string) => {
      await handleStatusChange(reviewId, "published");
    },
    [handleStatusChange],
  );

  const handleReject = useCallback(
    async (reviewId: string) => {
      await handleStatusChange(reviewId, "removed");
    },
    [handleStatusChange],
  );

  const handleFlag = useCallback(
    async (reviewId: string) => {
      await handleStatusChange(reviewId, "flagged");
    },
    [handleStatusChange],
  );

  const filteredReviews = useMemo(
    () => filterModerationReviews(reviews, deferredSearch, statusFilter),
    [reviews, deferredSearch, statusFilter],
  );

  return {
    reviews,
    loading,
    error,
    pendingReviewIds,
    pendingReviewIdSet,
    search,
    statusFilter,
    filteredReviews,
    setSearch,
    setStatusFilter,
    retry: loadReviews,
    handleApprove,
    handleReject,
    handleFlag,
  };
};
