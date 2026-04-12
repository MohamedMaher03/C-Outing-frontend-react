/**
 * useAdminDashboard Hook
 * Manages state for the Admin Dashboard page.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminStats, RecentActivity } from "@/features/admin/types";
import { getErrorMessage } from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

interface UseAdminDashboardReturn {
  stats: AdminStats | null;
  activity: RecentActivity[];
  loading: boolean;
  error: string | null;
  retry: () => Promise<void>;
}

export const useAdminDashboard = (): UseAdminDashboardReturn => {
  const { t } = useI18n();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [s, a] = await Promise.all([
        adminService.getStats(),
        adminService.getRecentActivity(),
      ]);

      if (!mountedRef.current) return;

      setStats(s);
      setActivity(a);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, t("admin.error.loadDashboardData")));
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    mountedRef.current = true;
    void loadDashboard();

    return () => {
      mountedRef.current = false;
    };
  }, [loadDashboard]);

  return { stats, activity, loading, error, retry: loadDashboard };
};
