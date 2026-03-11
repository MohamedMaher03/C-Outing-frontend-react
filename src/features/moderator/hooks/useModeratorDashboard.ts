/**
 * useModeratorDashboard Hook
 * Manages state for the Moderator Dashboard page.
 */

import { useState, useEffect } from "react";
import { moderatorService } from "@/features/moderator/services/moderatorService";
import type {
  ModeratorStats,
  ModerationAction,
} from "@/features/moderator/types";
import { getErrorMessage } from "@/utils/apiError";

interface UseModeratorDashboardReturn {
  stats: ModeratorStats | null;
  actions: ModerationAction[];
  loading: boolean;
  error: string | null;
}

export const useModeratorDashboard = (): UseModeratorDashboardReturn => {
  const [stats, setStats] = useState<ModeratorStats | null>(null);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a] = await Promise.all([
          moderatorService.getStats(),
          moderatorService.getRecentActions(),
        ]);
        setStats(s);
        setActions(a);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load dashboard data"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { stats, actions, loading, error };
};
