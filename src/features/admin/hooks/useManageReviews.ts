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

  const addProcessingId = (id: string) => {
    setProcessingReviewIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
  };

  const removeProcessingId = (id: string) => {
    setProcessingReviewIds((prev) => prev.filter((item) => item !== id));
  };

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await adminService.getReviews();
      if (!mountedRef.current) return;
      setReviews(data);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, t("admin.error.loadReviews")));
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

  return {
    reviews,
    loading,
    error,
    processingReviewIds,
    search,
    statusFilter,
    filteredReviews,
    setSearch,
    setStatusFilter,
    retry: loadReviews,
    handleStatusChange,
    handleDelete,
  };
};
