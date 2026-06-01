import { useNavigate } from "react-router-dom";
import { useI18n } from "@/components/i18n";
import { useNotifications } from "@/features/profile/hooks/useNotifications";
import {
  NOTIFICATION_CATALOG,
  resolveNotificationToggleState,
  type EmailNotificationKey,
  type PushNotificationKey,
} from "@/features/profile/utils/notificationsCatalog";

export const useNotificationsPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const notificationState = useNotifications();

  const returnToProfile = () => navigate("/profile");

  const flipNotificationPreference = (
    channel: "push" | "email",
    key: PushNotificationKey | EmailNotificationKey,
  ) => {
    if (channel === "push") {
      notificationState.togglePush(key as PushNotificationKey);
      return;
    }
    notificationState.toggleEmail(key as EmailNotificationKey);
  };

  const resolveToggleChecked = (
    channel: "push" | "email",
    key: PushNotificationKey | EmailNotificationKey,
  ) =>
    resolveNotificationToggleState(
      channel,
      key,
      notificationState.pushNotifications,
      notificationState.emailNotifications,
    );

  return {
    t,
    ...notificationState,
    catalog: NOTIFICATION_CATALOG,
    returnToProfile,
    flipNotificationPreference,
    resolveToggleChecked,
  };
};
