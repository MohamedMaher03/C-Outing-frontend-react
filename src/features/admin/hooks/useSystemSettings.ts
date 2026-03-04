/**
 * useSystemSettings Hook
 * Manages state and actions for the System Settings admin page.
 */

import { useState, useEffect } from "react";
import { adminService } from "@/features/admin/services/adminService";
import type { SystemSettings } from "@/features/admin/types";

interface UseSystemSettingsReturn {
  // State
  settings: SystemSettings | null;
  loading: boolean;
  saving: boolean;
  saved: boolean;

  // Actions
  update: <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K],
  ) => void;
  handleSave: () => Promise<void>;
}

export const useSystemSettings = (): UseSystemSettingsReturn => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getSettings();
        setSettings(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const update = <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K],
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return { settings, loading, saving, saved, update, handleSave };
};
