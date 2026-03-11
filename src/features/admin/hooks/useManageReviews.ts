/**
 * useManageReviews Hook
 * Manages state and actions for the Manage Reviews admin page.
 */

import { useState, useEffect } from "react";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminReview } from "@/features/admin/types";
import { getErrorMessage } from "@/utils/apiError";

interface UseManageReviewsReturn {
  // State
  reviews: AdminReview[];
  loading: boolean;
  error: string | null;
  search: string;
  statusFilter: string;
  filteredReviews: AdminReview[];

  // Setters
  setSearch: (value: string) => void;
  setStatusFilter: (value: string) => void;

  // Actions
  handleStatusChange: (
    reviewId: string,
    status: AdminReview["status"],
  ) => Promise<void>;
  handleDelete: (reviewId: string) => Promise<void>;
}

export const useManageReviews = (): UseManageReviewsReturn => {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getReviews();
        setReviews(data);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load reviews"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStatusChange = async (
    reviewId: string,
    status: AdminReview["status"],
  ) => {
    await adminService.updateReviewStatus(reviewId, status);
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status } : r)),
    );
  };

  const handleDelete = async (reviewId: string) => {
    await adminService.deleteReview(reviewId);
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.placeName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    reviews,
    loading,
    error,
    search,
    statusFilter,
    filteredReviews,
    setSearch,
    setStatusFilter,
    handleStatusChange,
    handleDelete,
  };
};
