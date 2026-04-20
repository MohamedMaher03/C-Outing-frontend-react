import { useCallback, useEffect, useRef, useState } from "react";
import { moderatorService } from "@/features/moderator/services/moderatorService";
import type {
  ModeratorStats,
  ModerationAction,
} from "@/features/moderator/types";
import { getErrorMessage } from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

interface UseModeratorDashboardReturn {
  stats: ModeratorStats | null;
  actions: ModerationAction[];
  loading: boolean;
  error: string | null;
  retry: () => Promise<void>;
}

export const useModeratorDashboard = (): UseModeratorDashboardReturn => {
  const { t } = useI18n();
  const [stats, setStats] = useState<ModeratorStats | null>(null);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsData, actionsData] = await Promise.all([
        moderatorService.getStats(),
        moderatorService.getRecentActions(),
      ]);

      if (!mountedRef.current) return;

      setStats(statsData);
      setActions(actionsData);
    } catch (err) {
      if (!mountedRef.current) return;

      setError(getErrorMessage(err, t("moderator.error.loadDashboardData")));
      setStats(null);
      setActions([]);
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

  return { stats, actions, loading, error, retry: loadDashboard };
};
