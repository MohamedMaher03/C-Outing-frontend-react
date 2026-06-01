import { useNavigate } from "react-router-dom";
import { useI18n } from "@/components/i18n";
import { useEditProfile } from "@/features/profile/hooks/useEditProfile";
import { buildDefaultAvatarDataUrl } from "@/features/profile/utils/defaultAvatar";

export const resolveMaxBirthDateIso = (): string =>
  new Date().toISOString().slice(0, 10);

export const useEditProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const editProfile = useEditProfile();

  const avatarDisplaySrc =
    editProfile.avatarPreview ||
    buildDefaultAvatarDataUrl(
      editProfile.formData.name || t("profile.userFallback"),
    );

  const photoHintKey = editProfile.avatarPreview
    ? "profile.edit.photoHint.withPhoto"
    : "profile.edit.photoHint.withoutPhoto";

  const returnToProfile = () => navigate("/profile");

  return {
    t,
    ...editProfile,
    avatarDisplaySrc,
    photoHintKey,
    maxBirthDate: resolveMaxBirthDateIso(),
    returnToProfile,
  };
};
