/**
 * usePrivacy Hook
 *
 * Manages state and async actions for the Privacy & Data page.
 * All data flows through profileService → (mock | API) according to
 * which path is active in the service layer.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPrivacySettings,
  updatePrivacySettings,
  deleteUserAccount,
} from "@/features/profile/services/profileService";
import type { PrivacySettings } from "@/features/profile/types";
import { getErrorMessage } from "@/utils/apiError";

interface UsePrivacyReturn {
  /** Current privacy toggle values */
  privacySettings: PrivacySettings;
  /** True while the initial data is being fetched */
  loading: boolean;
  /** True while a save request is in-flight */
  saving: boolean;
  /** True while an account deletion request is in-flight */
  deleting: boolean;
  /** Error message, if any */
  error: string | null;
  /** Toggle a single privacy flag */
  toggleSetting: (key: keyof PrivacySettings) => void;
  /** Persist current settings and navigate back */
  handleSave: () => Promise<void>;
  /** Permanently delete the account */
  handleDeleteAccount: () => Promise<void>;
  /** Re-fetch privacy settings after an error */
  reloadSettings: () => Promise<void>;
}

export const usePrivacy = (): UsePrivacyReturn => {
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

      setError(
        getErrorMessage(
          err,
          "We couldn't load your privacy settings. Please try again.",
        ),
      );
    } finally {
      if (runId === latestLoadRunRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Load current settings on mount
  useEffect(() => {
    void reloadSettings();
  }, [reloadSettings]);

  const toggleSetting = (key: keyof PrivacySettings) => {
    setError((prev) => (prev ? null : prev));
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
      setError(
        getErrorMessage(
          err,
          "We couldn't save your privacy settings. Please try again.",
        ),
      );
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
      // After deletion, clear local auth data and redirect
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      navigate("/login");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "We couldn't delete your account right now. Please try again or contact support.",
        ),
      );
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
