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
  pushNotifications: NotificationSettings["push"];
  emailNotifications: NotificationSettings["email"];
  loading: boolean;
  saving: boolean;
  error: string | null;
  togglePush: (key: keyof NotificationSettings["push"]) => void;
  toggleEmail: (key: keyof NotificationSettings["email"]) => void;
  handleSave: () => Promise<void>;
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

  useEffect(() => {
    void reloadSettings();
  }, [reloadSettings]);

  const togglePush = (key: keyof NotificationSettings["push"]) => {
    setError(null);
    setPushNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleEmail = (key: keyof NotificationSettings["email"]) => {
    setError(null);
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
