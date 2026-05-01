import { useCallback, useEffect, useRef, useState } from "react";
import { adminService } from "@/features/admin/services/adminService";
import type {
  AdminReview,
  AdminReviewStatusFilter,
} from "@/features/admin/types";
import { getErrorMessage } from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

interface UseManageReviewsReturn {
  reviews: AdminReview[];
  loading: boolean;
  error: string | null;
  processingReviewIds: string[];
  search: string;
  statusFilter: AdminReviewStatusFilter;
  // NOTE:take care anyone will work here after me : filteredReviews is now identical to `reviews` – filtering and
  // searching are fully delegated to the backend. The field is kept in the
  // public interface so callers don't need to change.
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

/**
 * here i map the frontend AdminReviewStatusFilter union to the exact string the
 * backend API accepts as the `status` query parameter.
 *
 * Backend allowed values: Approved | Flagged | Pending | Rejected
 * Frontend domain values:  published | flagged  | pending | removed | all
 */
const toApiStatus = (filter: AdminReviewStatusFilter): string | undefined => {
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

export const useManageReviews = (): UseManageReviewsReturn => {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingReviewIds, setProcessingReviewIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AdminReviewStatusFilter>("all");

  const mountedRef = useRef(true);
  const inFlightRef = useRef(new Set<string>());

  const REVIEWS_PAGE_SIZE = 10;
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(REVIEWS_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Debounced search value ─ actual API calls only fire after 650 ms idle
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
          status: toApiStatus(statusFilter) as
            | AdminReviewStatusFilter
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
        setError(getErrorMessage(err, t("admin.error.loadReviews")));
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [t, pageSize, deferredSearch, statusFilter],
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
  }, [deferredSearch, statusFilter]);

  const mapReviewStatusToApi = (status: AdminReview["status"]) => {
    switch (status) {
      case "published":
        return "Approved";
      case "flagged":
        return "Flagged";
      case "pending":
        return "Pending";
      case "removed":
        return "Rejected";
      default:
        return status;
    }
  };

  const handleStatusChange = async (
    reviewId: string,
    status: AdminReview["status"],
  ) => {
    if (inFlightRef.current.has(reviewId)) return;

    inFlightRef.current.add(reviewId);
    addProcessingId(reviewId);
    setError(null);

    try {
      await adminService.updateReviewStatus(
        reviewId,
        mapReviewStatusToApi(status),
      );

      if (!mountedRef.current) return;

      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status } : r)),
      );
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, t("admin.error.updateReviewStatus")));
    } finally {
      inFlightRef.current.delete(reviewId);
      if (mountedRef.current) removeProcessingId(reviewId);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (inFlightRef.current.has(reviewId)) return;

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
      if (mountedRef.current) removeProcessingId(reviewId);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(1);
  };

  const handleStatusFilterChange = (value: AdminReviewStatusFilter) => {
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
    processingReviewIds,
    search,
    statusFilter,
    filteredReviews: reviews,
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
