import { useCallback, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useI18n } from "@/components/i18n";
import type { PlaceCardProps } from "@/features/home/types";
import { getDistanceDisplayState } from "@/features/home/utils/distance";
import { buildHomeImageCandidates } from "@/features/home/utils/imageUrl";
import {
  advanceImageRetry,
  buildVenueCardShellClass,
  coerceFiniteMetric,
  pickAtmosphereTags,
  qualifyAsTopRatedVenue,
  resolveActiveImageIndex,
  resolveDistanceCaption,
  resolveDistanceChipClass,
  resolveOpenStatusTone,
  resolvePriceBandMeta,
  resolveVenueOpenLabel,
  VENUE_TOP_RATED_THRESHOLD,
  type VenueImageRetryState,
} from "@/features/home/utils/placeCardPresentation";

export const usePlaceCard = ({
  place,
  variant = "grid",
  userLocation,
  onToggleSave,
  isSavePending = false,
  hideTopRatedBadge = false,
  onClick,
}: PlaceCardProps) => {
  const { t, formatNumber } = useI18n();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [imageRetry, setImageRetry] = useState<VenueImageRetryState>({
    sourceKey: "",
    index: 0,
  });

  const isHorizontal = variant === "horizontal";
  const rating = coerceFiniteMetric(place.rating);
  const reviewCount = coerceFiniteMetric(place.reviewCount);
  const venueName = place.name?.trim() || t("home.place.untitled");
  const venueAddress =
    place.address?.trim() || t("home.place.addressUnavailable");
  const atmosphereTags = pickAtmosphereTags(place.atmosphereTags);
  const ratingLabel = Number.isFinite(rating) ? rating.toFixed(2) : "0.00";
  const reviewCountLabel = formatNumber(Math.max(0, reviewCount));
  const showTopRatedRibbon =
    qualifyAsTopRatedVenue(rating) && !hideTopRatedBadge;
  const cardAriaLabel = t("home.place.cardAria", {
    name: venueName,
    rating: ratingLabel,
  });
  const openStatusLabel = resolveVenueOpenLabel(place.isOpen, t);
  const openStatusTone = resolveOpenStatusTone(place.isOpen);
  const distanceState = getDistanceDisplayState(
    userLocation,
    place.latitude,
    place.longitude,
  );
  const distanceCaption = useMemo(
    () => resolveDistanceCaption(distanceState, t, formatNumber),
    [distanceState, formatNumber, t],
  );
  const distanceChipClass = resolveDistanceChipClass(distanceState);
  const priceBand = resolvePriceBandMeta(place.priceLevel);
  const imageCandidates = useMemo(
    () => buildHomeImageCandidates(place.image),
    [place.image],
  );
  const imageSourceKey = place.image;
  const activeImageIndex = resolveActiveImageIndex(imageRetry, imageSourceKey);
  const activeImageSrc = imageCandidates[activeImageIndex];
  const isImageMissing = !activeImageSrc;
  const shellClassName = buildVenueCardShellClass(isHorizontal);
  const heroHeightClass = isHorizontal ? "h-40" : "h-48";
  const favoriteAriaLabel = place.isSaved
    ? t("home.place.removeFavorite")
    : t("home.place.addFavorite");

  const cardMotion = useMemo(
    () => ({
      hover: prefersReducedMotion
        ? undefined
        : { y: -3, transition: { duration: 0.2, ease: [0.25, 1, 0.5, 1] as const } },
      tap: prefersReducedMotion
        ? undefined
        : { scale: 0.99, transition: { duration: 0.1 } },
      favoriteHover: prefersReducedMotion
        ? undefined
        : { scale: 1.05, transition: { duration: 0.16 } },
      favoriteTap: prefersReducedMotion
        ? undefined
        : { scale: 0.92, transition: { duration: 0.1 } },
      heartPulse: prefersReducedMotion
        ? { scale: 1, rotate: 0 }
        : { scale: [1, 1.2, 1], rotate: [0, -10, 0] },
      heartTransition: {
        duration: prefersReducedMotion ? 0.01 : 0.28,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
    [prefersReducedMotion],
  );

  const commitCardActivation = useCallback(() => {
    onClick?.(place.id);
  }, [onClick, place.id]);

  const commitFavoriteToggle = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onToggleSave?.(place.id);
    },
    [onToggleSave, place.id],
  );

  const commitImageFallback = useCallback(() => {
    setImageRetry((prev) =>
      advanceImageRetry(prev, imageSourceKey, imageCandidates.length),
    );
  }, [imageCandidates.length, imageSourceKey]);

  const commitKeyboardActivation = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      commitCardActivation();
    },
    [commitCardActivation],
  );

  return {
    t,
    place,
    isSavePending,
    isHorizontal,
    venueName,
    venueAddress,
    atmosphereTags,
    ratingLabel,
    reviewCountLabel,
    showTopRatedRibbon,
    cardAriaLabel,
    openStatusLabel,
    openStatusTone,
    distanceCaption,
    distanceChipClass,
    priceBand,
    activeImageSrc,
    isImageMissing,
    shellClassName,
    heroHeightClass,
    favoriteAriaLabel,
    cardMotion,
    topRatedThresholdLabel: VENUE_TOP_RATED_THRESHOLD.toFixed(2),
    commitCardActivation,
    commitFavoriteToggle,
    commitImageFallback,
    commitKeyboardActivation,
  };
};
