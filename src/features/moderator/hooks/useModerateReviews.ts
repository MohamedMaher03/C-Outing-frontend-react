/**
 * useModerateReviews Hook
 * Manages state and actions for the Moderate Reviews moderator page.
 *
 * Note: Reviews are an admin-managed resource, so this hook delegates
 * data fetching and status updates to adminService.
 */

import { useState, useEffect } from "react";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminReview } from "@/features/admin/types";

interface UseModerateReviewsReturn {
  // State
  reviews: AdminReview[];
  loading: boolean;
  search: string;
  statusFilter: string;
  filteredReviews: AdminReview[];

  // Setters
  setSearch: (value: string) => void;
  setStatusFilter: (value: string) => void;

  // Actions
  handleApprove: (reviewId: string) => Promise<void>;
  handleReject: (reviewId: string) => Promise<void>;
  handleFlag: (reviewId: string) => Promise<void>;
}

export const useModerateReviews = (): UseModerateReviewsReturn => {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getReviews();
        setReviews(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (reviewId: string) => {
    await adminService.updateReviewStatus(reviewId, "published");
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, status: "published" as const } : r,
      ),
    );
  };

  const handleReject = async (reviewId: string) => {
    await adminService.updateReviewStatus(reviewId, "removed");
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, status: "removed" as const } : r,
      ),
    );
  };

  const handleFlag = async (reviewId: string) => {
    await adminService.updateReviewStatus(reviewId, "flagged");
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, status: "flagged" as const } : r,
      ),
    );
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
    search,
    statusFilter,
    filteredReviews,
    setSearch,
    setStatusFilter,
    handleApprove,
    handleReject,
    handleFlag,
  };
};
