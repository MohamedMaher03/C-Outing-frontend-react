import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/components/i18n";
import { usePublicProfile } from "@/features/users/hooks/usePublicProfile";
import {
  buildPublicProfileSidebarView,
  resolvePublicProfileLiveMessageKey,
} from "@/features/users/utils/publicProfilePresentation";

export const usePublicProfilePage = () => {
  const { t, locale } = useI18n();
  const { id: routeUserId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const profileBundle = usePublicProfile(routeUserId ?? "");

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale),
    [locale],
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [locale],
  );

  const sidebarView = profileBundle.profile
    ? buildPublicProfileSidebarView(
        profileBundle.profile,
        profileBundle.reviews.length,
        numberFormatter,
        {
          isReloading: profileBundle.isReloading,
          hasReviewsWarning: Boolean(profileBundle.reviewsWarning),
        },
      )
    : null;

  const liveStatusMessage = sidebarView
    ? t(resolvePublicProfileLiveMessageKey(sidebarView.liveStatusKey))
    : "";

  const goBack = () => navigate(-1);
  const retryProfileLoad = () => void profileBundle.reload();

  return {
    t,
    dateFormatter,
    ...profileBundle,
    sidebarView,
    liveStatusMessage,
    recentCountLabel: sidebarView?.recentCountLabel ?? "",
    goBack,
    retryProfileLoad,
  };
};
