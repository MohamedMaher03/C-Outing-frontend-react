import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSystemSettings } from "@/features/admin/hooks/useSystemSettings";
import {
  SYSTEM_SETTING_TOGGLES,
  resolveSystemSettingsSaveLabel,
} from "@/features/admin/utils/adminSystemSettingsView";
import { useI18n } from "@/components/i18n";

export const useSystemSettingsPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const settingsStore = useSystemSettings();

  const saveActionLabel = resolveSystemSettingsSaveLabel(
    settingsStore.saved,
    settingsStore.saving,
    t,
  );

  const navigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const persistSettings = () => void settingsStore.handleSave();

  const retrySettingsLoad = () => void settingsStore.retry();

  return {
    t,
    ...settingsStore,
    settingToggleSpecs: SYSTEM_SETTING_TOGGLES,
    saveActionLabel,
    navigateBack,
    persistSettings,
    retrySettingsLoad,
  };
};
