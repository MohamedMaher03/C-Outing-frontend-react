import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useI18n } from "@/components/i18n";
import { useAuth } from "@/features/auth";
import { INTERACTION_ACTION_TYPES } from "@/features/interactions";
import { usePlaceDetail } from "@/features/place-detail/hooks/usePlaceDetail";
import {
  SOCIAL_REVIEW_PREFETCH_DELAY_MS,
  buildPlaceDetailChromeView,
  isPrivilegedPlaceViewer,
  resolveNotificationMessageKey,
  resolveSocialCountCompact,
  resolveSocialReviewTotalCount,
  resolveWebsiteReviewTotalCount,
  type PlaceDetailReviewTab,
} from "@/features/place-detail/utils/placeDetailPresentation";

export const usePlaceDetailPage = () => {
  const { t, formatNumber, isArabic } = useI18n();
  const { id } = useParams();
  const { user } = useAuth();
  const detail = usePlaceDetail(id);

  const [activeReviewTab, setActiveReviewTab] =
    useState<PlaceDetailReviewTab>("website");

  useEffect(() => {
    if (activeReviewTab !== "social") return;
    void detail.ensureSocialReviewsLoaded();
  }, [activeReviewTab, detail.ensureSocialReviewsLoaded]);

  useEffect(() => {
    if (detail.socialReviewsLoaded) return;

    const timer = window.setTimeout(() => {
      void detail.ensureSocialReviewsLoaded();
    }, SOCIAL_REVIEW_PREFETCH_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [detail.ensureSocialReviewsLoaded, detail.socialReviewsLoaded]);

  const isPrivilegedUser = isPrivilegedPlaceViewer(user?.role);

  const websiteTotalCount = resolveWebsiteReviewTotalCount(
    detail.reviewsPagination.totalCount,
    detail.reviews.length,
  );

  const socialTotalCount = resolveSocialReviewTotalCount(
    detail.socialReviewsPagination.totalCount,
    detail.place?.googleMapsRatingCount,
    detail.socialReviews.length,
  );

  const socialCountCompact = resolveSocialCountCompact(
    detail.socialReviewsLoaded,
    socialTotalCount,
    detail.place?.googleMapsRatingCount,
    formatNumber,
  );

  const chrome = useMemo(
    () =>
      buildPlaceDetailChromeView(detail.place, {
        isPrivilegedUser,
        websiteTotalCount,
        socialTotalCount,
        socialCountCompact,
        notification: detail.notification,
      }),
    [
      detail.notification,
      detail.place,
      isPrivilegedUser,
      socialCountCompact,
      socialTotalCount,
      websiteTotalCount,
    ],
  );

  const notificationMessageKey = resolveNotificationMessageKey(
    detail.notification,
  );

  const trackExternalClick = useCallback(() => {
    void detail.trackInteraction(INTERACTION_ACTION_TYPES.view);
  }, [detail.trackInteraction]);

  const trackPhotoView = useCallback(() => {
    void detail.trackInteraction(INTERACTION_ACTION_TYPES.viewPhotos);
  }, [detail.trackInteraction]);

  const sharePlace = useCallback(async () => {
    if (!detail.place) return;

    const shareUrl = window.location.href;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: detail.place.name,
          text: t("placeDetail.share.text", { name: detail.place.name }),
          url: shareUrl,
        });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }

      await detail.trackInteraction(INTERACTION_ACTION_TYPES.share);
    } catch {
      return;
    }
  }, [detail.place, detail.trackInteraction, t]);

  const selectReviewTab = useCallback((value: string) => {
    setActiveReviewTab(value as PlaceDetailReviewTab);
  }, []);

  return {
    t,
    formatNumber,
    isArabic,
    ...detail,
    activeReviewTab,
    selectReviewTab,
    chrome,
    notificationMessageKey,
    trackExternalClick,
    trackPhotoView,
    sharePlace,
  };
};
