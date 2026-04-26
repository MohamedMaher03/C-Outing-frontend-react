import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { adminService } from "@/features/admin/services/adminService";
import type {
  AdminReview,
  AdminReviewStatusFilter,
} from "@/features/admin/types";
import { filterReviews } from "@/features/admin/utils/adminFilters";
import { getErrorMessage } from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

interface UseManageReviewsReturn {
  reviews: AdminReview[];
  loading: boolean;
  error: string | null;
  processingReviewIds: string[];
  search: string;
  statusFilter: AdminReviewStatusFilter;
  filteredReviews: AdminReview[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  setSearch: (value: string) => void;
  setStatusFilter: (value: AdminReviewStatusFilter) => void;
  retry: () => Promise<void>;
  handleStatusChange: (
    reviewId: string,
    status: AdminReview["status"],
  ) => Promise<void>;
  handleDelete: (reviewId: string) => Promise<void>;
}

export const useManageReviews = (): UseManageReviewsReturn => {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingReviewIds, setProcessingReviewIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AdminReviewStatusFilter>("all");
  const deferredSearch = useDeferredValue(search);
  const mountedRef = useRef(true);
  const inFlightRef = useRef(new Set<string>());
  const REVIEWS_PAGE_SIZE = 10;
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(REVIEWS_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const addProcessingId = (id: string) => {
    setProcessingReviewIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
  };

  const removeProcessingId = (id: string) => {
    setProcessingReviewIds((prev) => prev.filter((item) => item !== id));
  };

  const loadReviews = useCallback(
    async (explicitPage?: number) => {
      setLoading(true);
      setError(null);
      const targetPage = explicitPage ?? pageIndex;

      try {
        const data = await adminService.getReviews({
          page: targetPage,
          count: pageSize,
          status: statusFilter !== "all" ? statusFilter : undefined,
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
        setError(getErrorMessage(err, t("admin.error.loadReviews")));
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [t],
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadReviews();

    return () => {
      mountedRef.current = false;
    };
  }, [loadReviews]);

  const handleStatusChange = async (
    reviewId: string,
    status: AdminReview["status"],
  ) => {
    if (inFlightRef.current.has(reviewId)) {
      return;
    }

    inFlightRef.current.add(reviewId);
    addProcessingId(reviewId);
    setError(null);

    try {
      await adminService.updateReviewStatus(reviewId, status);
      if (!mountedRef.current) return;

      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status } : r)),
      );
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, t("admin.error.updateReviewStatus")));
    } finally {
      inFlightRef.current.delete(reviewId);
      if (mountedRef.current) {
        removeProcessingId(reviewId);
      }
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (inFlightRef.current.has(reviewId)) {
      return;
    }

    inFlightRef.current.add(reviewId);
    addProcessingId(reviewId);
    setError(null);

    try {
      await adminService.deleteReview(reviewId);
      if (!mountedRef.current) return;
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, t("admin.error.deleteReview")));
    } finally {
      inFlightRef.current.delete(reviewId);
      if (mountedRef.current) {
        removeProcessingId(reviewId);
      }
    }
  };

  const filteredReviews = useMemo(
    () => filterReviews(reviews, deferredSearch, statusFilter),
    [reviews, deferredSearch, statusFilter],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(1);
    void loadReviews(1);
  };

  const handleStatusFilterChange = (value: AdminReviewStatusFilter) => {
    setStatusFilter(value);
    setPageIndex(1);
    void loadReviews(1);
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
    processingReviewIds,
    search,
    statusFilter,
    filteredReviews,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    goToPreviousPage,
    goToNextPage,
    setSearch: handleSearchChange,
    setStatusFilter: handleStatusFilterChange,
    retry: loadReviews,
    handleStatusChange,
    handleDelete,
  };
};
