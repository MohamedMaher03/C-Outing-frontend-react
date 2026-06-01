import { useNavigate } from "react-router-dom";
import { useI18n } from "@/components/i18n";
import { usePrivacy } from "@/features/profile/hooks/usePrivacy";
import { PRIVACY_CATALOG } from "@/features/profile/utils/privacyCatalog";

export const usePrivacyPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const privacyState = usePrivacy();

  const returnToProfile = () => navigate("/profile");

  return {
    t,
    ...privacyState,
    catalog: PRIVACY_CATALOG,
    returnToProfile,
  };
};
