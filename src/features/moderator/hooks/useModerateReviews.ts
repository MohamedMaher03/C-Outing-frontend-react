import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AdminReview, AdminReviewStatus } from "@/features/admin/types";
import { moderatorService } from "@/features/moderator/services/moderatorService";
import type { ModeratorReviewStatusFilter } from "@/features/moderator/types";
import { getErrorMessage } from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

interface UseModerateReviewsReturn {
  reviews: AdminReview[];
  loading: boolean;
  error: string | null;
  pendingReviewIds: string[];
  pendingReviewIdSet: ReadonlySet<string>;
  search: string;
  statusFilter: ModeratorReviewStatusFilter;
  filteredReviews: AdminReview[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;

  setSearch: (value: string) => void;
  setStatusFilter: (value: ModeratorReviewStatusFilter) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;

  retry: () => Promise<void>;
  handleApprove: (reviewId: string) => Promise<void>;
  handleReject: (reviewId: string) => Promise<void>;
  handleFlag: (reviewId: string) => Promise<void>;
}

const toApiStatus = (
  filter: ModeratorReviewStatusFilter,
): string | undefined => {
  switch (filter) {
    case "published":
      return "Approved";
    case "flagged":
      return "Flagged";
    case "pending":
      return "Pending";
    case "removed":
      return "Rejected";
    case "all":
    default:
      return undefined;
  }
};

const mapReviewStatusToApi = (value: AdminReviewStatus) => {
  switch (value) {
    case "published":
      return "Approved";
    case "flagged":
      return "Flagged";
    case "pending":
      return "Pending";
    case "removed":
      return "Rejected";
    default:
      return value;
  }
};

export const useModerateReviews = (): UseModerateReviewsReturn => {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingReviewIds, setPendingReviewIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ModeratorReviewStatusFilter>("pending");
  const mountedRef = useRef(true);
  const inFlightRef = useRef(new Set<string>());
  const pendingReviewIdSet = useMemo(
    () => new Set(pendingReviewIds),
    [pendingReviewIds],
  );

  const REVIEWS_PAGE_SIZE = 10;
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(REVIEWS_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [deferredSearch, setDeferredSearch] = useState(search);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      setDeferredSearch(search);
      debounceTimerRef.current = null;
    }, 650);

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search]);

  const loadReviews = useCallback(
    async (explicitPage?: number) => {
      setLoading(true);
      setError(null);
      const targetPage = explicitPage ?? pageIndex;

      try {
        const data = await moderatorService.getReviews({
          page: targetPage,
          count: pageSize,
          status: toApiStatus(statusFilter) as
            | ModeratorReviewStatusFilter
            | undefined,
          searchTerm: deferredSearch || undefined,
        });
        if (!mountedRef.current) return;

        const normalizedTotalPages = Math.max(1, data.totalPages);
        const normalizedPage = Math.min(
          Math.max(1, targetPage),
          normalizedTotalPages,
        );

        setReviews(data.items);
        setPageIndex(normalizedPage);
        setPageSize(Math.max(1, data.pageSize));
        setTotalCount(Math.max(0, data.totalCount));
        setTotalPages(normalizedTotalPages);
        setHasPreviousPage(normalizedPage > 1);
        setHasNextPage(normalizedPage < normalizedTotalPages);
      } catch (err) {
        if (!mountedRef.current) return;
        setError(getErrorMessage(err, t("moderator.error.loadReviews")));
        setReviews([]);
        setTotalCount(0);
        setTotalPages(1);
        setHasPreviousPage(false);
        setHasNextPage(false);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [t, deferredSearch, pageSize, statusFilter],
  );

  const initialLoadDone = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    void loadReviews();
    initialLoadDone.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, [loadReviews]);

  useEffect(() => {
    if (!initialLoadDone.current) return;
    void loadReviews(1);
  }, [deferredSearch, statusFilter, loadReviews]);

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
        await moderatorService.updateReviewStatus(
          reviewId,
          mapReviewStatusToApi(status),
        );
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

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(1);
  };

  const handleStatusFilterChange = (value: ModeratorReviewStatusFilter) => {
    setStatusFilter(value);
    setPageIndex(1);
  };

  const goToPreviousPage = () => {
    if (!hasPreviousPage || loading) return;
    const nextPage = Math.max(1, pageIndex - 1);
    setPageIndex(nextPage);
    void loadReviews(nextPage);
  };

  const goToNextPage = () => {
    if (!hasNextPage || loading) return;
    const nextPage = Math.min(totalPages, pageIndex + 1);
    setPageIndex(nextPage);
    void loadReviews(nextPage);
  };

  return {
    reviews,
    loading,
    error,
    pendingReviewIds,
    pendingReviewIdSet,
    search,
    statusFilter,
    filteredReviews: reviews,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setSearch: handleSearchChange,
    setStatusFilter: handleStatusFilterChange,
    goToPreviousPage,
    goToNextPage,
    retry: loadReviews,
    handleApprove,
    handleReject,
    handleFlag,
  };
};
