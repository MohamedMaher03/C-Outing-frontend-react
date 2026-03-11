/**
 * useAdminDashboard Hook
 * Manages state for the Admin Dashboard page.
 */

import { useState, useEffect } from "react";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminStats, RecentActivity } from "@/features/admin/types";
import { getErrorMessage } from "@/utils/apiError";

interface UseAdminDashboardReturn {
  stats: AdminStats | null;
  activity: RecentActivity[];
  loading: boolean;
  error: string | null;
}

export const useAdminDashboard = (): UseAdminDashboardReturn => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a] = await Promise.all([
          adminService.getStats(),
          adminService.getRecentActivity(),
        ]);
        setStats(s);
        setActivity(a);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load dashboard data"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { stats, activity, loading, error };
};
