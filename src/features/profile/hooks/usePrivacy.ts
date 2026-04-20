import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPrivacySettings,
  updatePrivacySettings,
  deleteUserAccount,
} from "@/features/profile/services/profileService";
import type { PrivacySettings } from "@/features/profile/types";
import { getErrorMessage } from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

interface UsePrivacyReturn {
  privacySettings: PrivacySettings;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  toggleSetting: (key: keyof PrivacySettings) => void;
  handleSave: () => Promise<void>;
  handleDeleteAccount: () => Promise<void>;
  reloadSettings: () => Promise<void>;
}

export const usePrivacy = (): UsePrivacyReturn => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    showFavorites: false,
    showActivity: true,
    dataCollection: true,
    personalization: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveInFlightRef = useRef(false);
  const deleteInFlightRef = useRef(false);
  const latestLoadRunRef = useRef(0);

  const reloadSettings = useCallback(async () => {
    const runId = ++latestLoadRunRef.current;

    try {
      setLoading(true);
      setError(null);
      const data = await getPrivacySettings();

      if (runId !== latestLoadRunRef.current) {
        return;
      }

      setPrivacySettings(data);
    } catch (err) {
      if (runId !== latestLoadRunRef.current) {
        return;
      }

      setError(getErrorMessage(err, t("profile.privacy.error.load")));
    } finally {
      if (runId === latestLoadRunRef.current) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    void reloadSettings();
  }, [reloadSettings]);

  const toggleSetting = (key: keyof PrivacySettings) => {
    setError(null);
    setPrivacySettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (saveInFlightRef.current || deleting || saving) {
      return;
    }

    saveInFlightRef.current = true;

    try {
      setSaving(true);
      setError(null);
      await updatePrivacySettings(privacySettings);
      navigate("/profile");
    } catch (err) {
      setError(getErrorMessage(err, t("profile.privacy.error.save")));
    } finally {
      saveInFlightRef.current = false;
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInFlightRef.current || saving || deleting) {
      return;
    }

    deleteInFlightRef.current = true;

    try {
      setDeleting(true);
      setError(null);
      await deleteUserAccount();
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      navigate("/login");
    } catch (err) {
      setError(getErrorMessage(err, t("profile.privacy.error.delete")));
    } finally {
      deleteInFlightRef.current = false;
      setDeleting(false);
    }
  };

  return {
    privacySettings,
    loading,
    saving,
    deleting,
    error,
    toggleSetting,
    handleSave,
    handleDeleteAccount,
    reloadSettings,
  };
};
