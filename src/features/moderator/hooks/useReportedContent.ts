/**
 * useReportedContent Hook
 * Manages state and actions for the Reported Content moderator page.
 */

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { moderatorService } from "@/features/moderator/services/moderatorService";
import type {
  ReportedContent,
  ModeratorToast,
  ReportedContentStatusFilter,
  ReportedContentTypeFilter,
} from "@/features/moderator/types";
import { filterReportedContent } from "@/features/moderator/utils/moderatorFilters";
import { getErrorMessage } from "@/utils/apiError";

interface UseReportedContentReturn {
  // State
  reports: ReportedContent[];
  loading: boolean;
  error: string | null;
  pendingReportIds: string[];
  pendingReportIdSet: ReadonlySet<string>;
  search: string;
  statusFilter: ReportedContentStatusFilter;
  typeFilter: ReportedContentTypeFilter;
  expandedId: string | null;
  actionLoading: string | null;
  toasts: ModeratorToast[];
  filteredReports: ReportedContent[];

  // Setters
  setSearch: (value: string) => void;
  setStatusFilter: (value: ReportedContentStatusFilter) => void;
  setTypeFilter: (value: ReportedContentTypeFilter) => void;
  setExpandedId: (id: string | null) => void;

  // Actions
  retry: () => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);
  const [pendingReportIds, setPendingReportIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ReportedContentStatusFilter>("all");
  const [typeFilter, setTypeFilter] =
    useState<ReportedContentTypeFilter>("all");
  const deferredSearch = useDeferredValue(search);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ModeratorToast[]>([]);
  const mountedRef = useRef(true);
  const inFlightRef = useRef(new Set<string>());
  const toastTimersRef = useRef<number[]>([]);
  const pendingReportIdSet = useMemo(
    () => new Set(pendingReportIds),
    [pendingReportIds],
  );

  const loadReportedContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await moderatorService.getReportedContent();
      if (!mountedRef.current) return;
      setReports(data);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, "Failed to load reported content"));
      setReports([]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadReportedContent();

    return () => {
      mountedRef.current = false;
      toastTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      toastTimersRef.current = [];
    };
  }, [loadReportedContent]);

  const addPendingReport = useCallback((reportId: string) => {
    setPendingReportIds((prev) =>
      prev.includes(reportId) ? prev : [...prev, reportId],
    );
  }, []);

  const removePendingReport = useCallback((reportId: string) => {
    setPendingReportIds((prev) => prev.filter((id) => id !== reportId));
  }, []);

  const showToast = (
    message: string,
    variant: ModeratorToast["variant"] = "success",
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    const timerId = window.setTimeout(() => {
      if (!mountedRef.current) return;
      setToasts((prev) => prev.filter((t) => t.id !== id));
      toastTimersRef.current = toastTimersRef.current.filter(
        (value) => value !== timerId,
      );
    }, 3200);

    toastTimersRef.current.push(timerId);
  };

  const handleStatusChange = async (
    reportId: string,
    status: ReportedContent["status"],
  ) => {
    const actionKey = `${reportId}_status_${status}`;

    if (inFlightRef.current.has(actionKey)) {
      return;
    }

    inFlightRef.current.add(actionKey);
    addPendingReport(reportId);
    setActionLoading(actionKey);
    setError(null);

    try {
      await moderatorService.updateReportStatus(reportId, status);
      if (!mountedRef.current) return;

      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status,
                ...(["resolved", "dismissed"].includes(status)
                  ? { resolvedAt: new Date() }
                  : {}),
              }
            : report,
        ),
      );

      showToast(`Report marked as ${status}.`, "info");
    } catch (err) {
      if (!mountedRef.current) return;

      const message = getErrorMessage(err, "Failed to update report status");
      setError(message);
      showToast(message, "error");
    } finally {
      inFlightRef.current.delete(actionKey);

      if (mountedRef.current) {
        setActionLoading(null);
        removePendingReport(reportId);
      }
    }
  };

  const handleDeleteReview = async (reportId: string) => {
    const actionKey = `${reportId}_delete`;
    if (inFlightRef.current.has(actionKey)) {
      return;
    }

    try {
      inFlightRef.current.add(actionKey);
      addPendingReport(reportId);
      setActionLoading(actionKey);
      setError(null);

      await moderatorService.deleteReview(reportId);
      if (!mountedRef.current) return;

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status: "resolved", resolvedAt: new Date() }
            : r,
        ),
      );
      setExpandedId(null);
      showToast("Review deleted successfully.", "destructive");
    } catch (err) {
      if (!mountedRef.current) return;

      const message = getErrorMessage(err, "Failed to delete review");
      setError(message);
      showToast(message, "error");
    } finally {
      inFlightRef.current.delete(actionKey);
      if (mountedRef.current) {
        setActionLoading(null);
        removePendingReport(reportId);
      }
    }
  };

  const handleWarnUser = async (reportId: string, authorName?: string) => {
    const actionKey = `${reportId}_warn`;
    if (inFlightRef.current.has(actionKey)) {
      return;
    }

    try {
      inFlightRef.current.add(actionKey);
      addPendingReport(reportId);
      setActionLoading(actionKey);
      setError(null);

      await moderatorService.warnUser(reportId);
      if (!mountedRef.current) return;

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status: "resolved", resolvedAt: new Date() }
            : r,
        ),
      );
      showToast(`Warning sent to ${authorName ?? "user"}.`, "warning");
    } catch (err) {
      if (!mountedRef.current) return;

      const message = getErrorMessage(err, "Failed to send warning");
      setError(message);
      showToast(message, "error");
    } finally {
      inFlightRef.current.delete(actionKey);
      if (mountedRef.current) {
        setActionLoading(null);
        removePendingReport(reportId);
      }
    }
  };

  const handleBanUser = async (reportId: string, authorName?: string) => {
    const actionKey = `${reportId}_ban`;
    if (inFlightRef.current.has(actionKey)) {
      return;
    }

    try {
      inFlightRef.current.add(actionKey);
      addPendingReport(reportId);
      setActionLoading(actionKey);
      setError(null);

      await moderatorService.banUser(reportId);
      if (!mountedRef.current) return;

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
    } catch (err) {
      if (!mountedRef.current) return;

      const message = getErrorMessage(err, "Failed to escalate user ban");
      setError(message);
      showToast(message, "error");
    } finally {
      inFlightRef.current.delete(actionKey);
      if (mountedRef.current) {
        setActionLoading(null);
        removePendingReport(reportId);
      }
    }
  };

  const filteredReports = useMemo(
    () =>
      filterReportedContent(reports, deferredSearch, statusFilter, typeFilter),
    [reports, deferredSearch, statusFilter, typeFilter],
  );

  return {
    reports,
    loading,
    error,
    pendingReportIds,
    pendingReportIdSet,
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
    retry: loadReportedContent,
    handleStatusChange,
    handleDeleteReview,
    handleWarnUser,
    handleBanUser,
  };
};
