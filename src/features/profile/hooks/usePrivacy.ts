/**
 * usePrivacy Hook
 *
 * Manages state and async actions for the Privacy & Data page.
 * All data flows through profileService → (mock | API) according to
 * which path is active in the service layer.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPrivacySettings,
  updatePrivacySettings,
  requestDataDownload,
  deleteUserAccount,
} from "@/features/profile/services/profileService";
import type { PrivacySettings } from "@/features/profile/types";

interface UsePrivacyReturn {
  /** Current privacy toggle values */
  privacySettings: PrivacySettings;
  /** True while the initial data is being fetched */
  loading: boolean;
  /** True while a save request is in-flight */
  saving: boolean;
  /** True while a download request is in-flight */
  downloading: boolean;
  /** True while an account deletion request is in-flight */
  deleting: boolean;
  /** Error message, if any */
  error: string | null;
  /** Toggle a single privacy flag */
  toggleSetting: (key: keyof PrivacySettings) => void;
  /** Persist current settings and navigate back */
  handleSave: () => Promise<void>;
  /** Trigger a data-export download */
  handleDownloadData: () => Promise<void>;
  /** Permanently delete the account */
  handleDeleteAccount: () => Promise<void>;
}

export const usePrivacy = (): UsePrivacyReturn => {
  const navigate = useNavigate();

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisible: true,
    showLocation: true,
    showFavorites: false,
    showActivity: true,
    dataCollection: true,
    personalization: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current settings on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPrivacySettings();
        setPrivacySettings(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load privacy settings",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleSetting = (key: keyof PrivacySettings) => {
    setPrivacySettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updatePrivacySettings(privacySettings);
      navigate("/profile");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save privacy settings",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      setDownloading(true);
      setError(null);
      await requestDataDownload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download data");
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      setError(null);
      await deleteUserAccount();
      // After deletion, clear local auth data and redirect
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  return {
    privacySettings,
    loading,
    saving,
    downloading,
    deleting,
    error,
    toggleSetting,
    handleSave,
    handleDownloadData,
    handleDeleteAccount,
  };
};
