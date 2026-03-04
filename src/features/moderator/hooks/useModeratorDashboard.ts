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

interface UseModeratorDashboardReturn {
  stats: ModeratorStats | null;
  actions: ModerationAction[];
  loading: boolean;
}

export const useModeratorDashboard = (): UseModeratorDashboardReturn => {
  const [stats, setStats] = useState<ModeratorStats | null>(null);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a] = await Promise.all([
          moderatorService.getStats(),
          moderatorService.getRecentActions(),
        ]);
        setStats(s);
        setActions(a);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { stats, actions, loading };
};
