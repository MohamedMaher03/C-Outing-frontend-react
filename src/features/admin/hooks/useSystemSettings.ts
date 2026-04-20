import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { adminService } from "@/features/admin/services/adminService";
import type { SystemSettings } from "@/features/admin/types";
import { getErrorMessage } from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

interface UseSystemSettingsReturn {
  settings: SystemSettings | null;
  loading: boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  retry: () => Promise<void>;
  update: <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K],
  ) => void;
  handleSave: () => Promise<void>;
}

export const useSystemSettings = (): UseSystemSettingsReturn => {
  const { t } = useI18n();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const saveInFlightRef = useRef(false);
  const savedTimerRef = useRef<number | null>(null);
  const initialSettingsRef = useRef<SystemSettings | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await adminService.getSettings();
      if (!mountedRef.current) return;

      setSettings(data);
      initialSettingsRef.current = data;
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, t("admin.error.loadSettings")));
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    mountedRef.current = true;
    void loadSettings();

    return () => {
      mountedRef.current = false;
      if (savedTimerRef.current) {
        window.clearTimeout(savedTimerRef.current);
        savedTimerRef.current = null;
      }
    };
  }, [loadSettings]);

  const update = <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K],
  ) => {
    setError(null);
    setSaved(false);
    setSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!settings || !initialSettingsRef.current) {
      return false;
    }

    return (
      JSON.stringify(settings) !== JSON.stringify(initialSettingsRef.current)
    );
  }, [settings]);

  const handleSave = async () => {
    if (!settings || saveInFlightRef.current || saving || !hasUnsavedChanges) {
      return;
    }

    saveInFlightRef.current = true;
    setSaving(true);
    setError(null);

    try {
      await adminService.updateSettings(settings);
      if (!mountedRef.current) return;

      setSaved(true);
      initialSettingsRef.current = settings;

      if (savedTimerRef.current) {
        window.clearTimeout(savedTimerRef.current);
      }

      savedTimerRef.current = window.setTimeout(() => {
        if (!mountedRef.current) return;
        setSaved(false);
      }, 2000);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, t("admin.error.saveSettings")));
    } finally {
      saveInFlightRef.current = false;
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  };

  return {
    settings,
    loading,
    saving,
    saved,
    error,
    hasUnsavedChanges,
    retry: loadSettings,
    update,
    handleSave,
  };
};
