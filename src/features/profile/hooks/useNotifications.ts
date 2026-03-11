/**
 * useNotifications Hook
 *
 * Manages state and async actions for the Notifications settings page.
 * All data flows through profileService → (mock | API) according to
 * which path is active in the service layer.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "@/features/profile/services/profileService";
import type { NotificationSettings } from "@/features/profile/types";
import { getErrorMessage } from "@/utils/apiError";

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
}

export const useNotifications = (): UseNotificationsReturn => {
  const navigate = useNavigate();

  const [pushNotifications, setPushNotifications] = useState<
    NotificationSettings["push"]
  >({
    recommendations: true,
    favorites: true,
    reviews: false,
    messages: true,
    updates: true,
  });

  const [emailNotifications, setEmailNotifications] = useState<
    NotificationSettings["email"]
  >({
    weekly: true,
    monthly: false,
    promotions: true,
    tips: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current settings on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNotificationSettings();
        setPushNotifications(data.push);
        setEmailNotifications(data.email);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load notification settings"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const togglePush = (key: keyof NotificationSettings["push"]) => {
    setPushNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleEmail = (key: keyof NotificationSettings["email"]) => {
    setEmailNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateNotificationSettings({
        push: pushNotifications,
        email: emailNotifications,
      });
      navigate("/profile");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save notification settings"));
    } finally {
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
  };
};
