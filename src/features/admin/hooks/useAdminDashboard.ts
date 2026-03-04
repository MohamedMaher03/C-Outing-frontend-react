/**
 * useAdminDashboard Hook
 * Manages state for the Admin Dashboard page.
 */

import { useState, useEffect } from "react";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminStats, RecentActivity } from "@/features/admin/types";

interface UseAdminDashboardReturn {
  stats: AdminStats | null;
  activity: RecentActivity[];
  loading: boolean;
}

export const useAdminDashboard = (): UseAdminDashboardReturn => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a] = await Promise.all([
          adminService.getStats(),
          adminService.getRecentActivity(),
        ]);
        setStats(s);
        setActivity(a);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { stats, activity, loading };
};
