/**
 * useReportedContent Hook
 * Manages state and actions for the Reported Content moderator page.
 */

import { useState, useEffect } from "react";
import { moderatorService } from "@/features/moderator/services/moderatorService";
import type {
  ReportedContent,
  ModeratorToast,
} from "@/features/moderator/types";
import { getErrorMessage } from "@/utils/apiError";

interface UseReportedContentReturn {
  // State
  reports: ReportedContent[];
  loading: boolean;
  error: string | null;
  search: string;
  statusFilter: string;
  typeFilter: string;
  expandedId: string | null;
  actionLoading: string | null;
  toasts: ModeratorToast[];
  filteredReports: ReportedContent[];

  // Setters
  setSearch: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setTypeFilter: (value: string) => void;
  setExpandedId: (id: string | null) => void;

  // Actions
  handleStatusChange: (
    reportId: string,
    status: ReportedContent["status"],
  ) => Promise<void>;
  handleDeleteReview: (reportId: string) => Promise<void>;
  handleWarnUser: (reportId: string, authorName?: string) => Promise<void>;
  handleBanUser: (reportId: string, authorName?: string) => Promise<void>;
}

export const useReportedContent = (): UseReportedContentReturn => {
  const [reports, setReports] = useState<ReportedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("review");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ModeratorToast[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await moderatorService.getReportedContent();
        setReports(data);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load reported content"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const showToast = (
    message: string,
    variant: ModeratorToast["variant"] = "success",
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  };

  const handleStatusChange = async (
    reportId: string,
    status: ReportedContent["status"],
  ) => {
    await moderatorService.updateReportStatus(reportId, status);
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status,
              ...(["resolved", "dismissed"].includes(status)
                ? { resolvedAt: new Date() }
                : {}),
            }
          : r,
      ),
    );
  };

  const handleDeleteReview = async (reportId: string) => {
    try {
      setActionLoading(reportId + "_delete");
      await moderatorService.deleteReview(reportId);
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status: "resolved", resolvedAt: new Date() }
            : r,
        ),
      );
      setExpandedId(null);
      showToast("Review deleted successfully.", "destructive");
    } finally {
      setActionLoading(null);
    }
  };

  const handleWarnUser = async (reportId: string, authorName?: string) => {
    try {
      setActionLoading(reportId + "_warn");
      await moderatorService.warnUser(reportId);
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status: "resolved", resolvedAt: new Date() }
            : r,
        ),
      );
      showToast(`Warning sent to ${authorName ?? "user"}.`, "warning");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async (reportId: string, authorName?: string) => {
    try {
      setActionLoading(reportId + "_ban");
      await moderatorService.banUser(reportId);
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status: "resolved", resolvedAt: new Date() }
            : r,
        ),
      );
      showToast(
        `${authorName ?? "User"} escalated to admin for ban review.`,
        "destructive",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.reportedItemName.toLowerCase().includes(search.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesType = typeFilter === "all" || r.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return {
    reports,
    loading,
    error,
    search,
    statusFilter,
    typeFilter,
    expandedId,
    actionLoading,
    toasts,
    filteredReports,
    setSearch,
    setStatusFilter,
    setTypeFilter,
    setExpandedId,
    handleStatusChange,
    handleDeleteReview,
    handleWarnUser,
    handleBanUser,
  };
};
