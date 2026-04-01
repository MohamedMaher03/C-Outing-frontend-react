/**
 * useNotifications Hook
 *
 * Manages state and async actions for the Notifications settings page.
 * All data flows through profileService → (mock | API) according to
 * which path is active in the service layer.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "@/features/profile/services/profileService";
import type { NotificationSettings } from "@/features/profile/types";
import { getErrorMessage } from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

interface UseNotificationsReturn {
  /** Current push notification toggles */
  pushNotifications: NotificationSettings["push"];
  /** Current email notification toggles */
  emailNotifications: NotificationSettings["email"];
  /** True while the initial data is being fetched */
  loading: boolean;
  /** True while a save request is in-flight */
  saving: boolean;
  /** Error message, if any */
  error: string | null;
  /** Toggle a single push notification flag */
  togglePush: (key: keyof NotificationSettings["push"]) => void;
  /** Toggle a single email notification flag */
  toggleEmail: (key: keyof NotificationSettings["email"]) => void;
  /** Persist current settings and navigate back */
  handleSave: () => Promise<void>;
  /** Re-fetch notification settings after an error */
  reloadSettings: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [pushNotifications, setPushNotifications] = useState<
    NotificationSettings["push"]
  >({
    recommendations: true,
    favorites: true,
    reviews: false,
    updates: true,
  });

  const [emailNotifications, setEmailNotifications] = useState<
    NotificationSettings["email"]
  >({
    monthlyDigest: true,
    promotions: true,
    tips: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveInFlightRef = useRef(false);
  const latestLoadRunRef = useRef(0);

  const reloadSettings = useCallback(async () => {
    const runId = ++latestLoadRunRef.current;

    try {
      setLoading(true);
      setError(null);
      const data = await getNotificationSettings();

      if (runId !== latestLoadRunRef.current) {
        return;
      }

      setPushNotifications(data.push);
      setEmailNotifications(data.email);
    } catch (err) {
      if (runId !== latestLoadRunRef.current) {
        return;
      }

      setError(getErrorMessage(err, t("profile.notifications.error.load")));
    } finally {
      if (runId === latestLoadRunRef.current) {
        setLoading(false);
      }
    }
  }, [t]);

  // Load current settings on mount
  useEffect(() => {
    void reloadSettings();
  }, [reloadSettings]);

  const togglePush = (key: keyof NotificationSettings["push"]) => {
    setError((prev) => (prev ? null : prev));
    setPushNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleEmail = (key: keyof NotificationSettings["email"]) => {
    setError((prev) => (prev ? null : prev));
    setEmailNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (saveInFlightRef.current || saving) {
      return;
    }

    saveInFlightRef.current = true;

    try {
      setSaving(true);
      setError(null);
      await updateNotificationSettings({
        push: pushNotifications,
        email: emailNotifications,
      });
      navigate("/profile");
    } catch (err) {
      setError(getErrorMessage(err, t("profile.notifications.error.save")));
    } finally {
      saveInFlightRef.current = false;
      setSaving(false);
    }
  };

  return {
    pushNotifications,
    emailNotifications,
    loading,
    saving,
    error,
    togglePush,
    toggleEmail,
    handleSave,
    reloadSettings,
  };
};
