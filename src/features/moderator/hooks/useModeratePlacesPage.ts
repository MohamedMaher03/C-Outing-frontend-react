import { useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useModeratePlaces } from "@/features/moderator/hooks/useModeratePlaces";
import { MODERATOR_PLACE_STATUS_FILTER_OPTIONS } from "@/features/moderator/constants/filterOptions";
import { localizeAdminStatusFilters } from "@/features/admin/utils/adminFilterLabels";
import {
  snapshotVenueUrlField,
  resolveModeratorVenueUrlHint,
  venueUrlHintToneClass,
} from "@/features/admin/utils/venueUrlFieldState";
import { PLACE_PLACEHOLDER_IMAGE } from "@/features/moderator/utils/moderatorQueueMetrics";
import { usePaginationJump } from "@/hooks/usePaginationJump";
import { useScrollAnchorWhen } from "@/hooks/useScrollAnchorWhen";
import { useI18n } from "@/components/i18n";

const EMPTY_VENUE_URL_FORM = { venueUrl: "" };

export const useModeratePlacesPage = () => {
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const placeQueue = useModeratePlaces();
  const addPlaceFormAnchorRef = useRef<HTMLDivElement>(null);

  const statusFilterOptions = useMemo(
    () =>
      localizeAdminStatusFilters(MODERATOR_PLACE_STATUS_FILTER_OPTIONS, t),
    [t],
  );

  const paginationJump = usePaginationJump(
    placeQueue.pageIndex,
    placeQueue.goToPage,
  );

  useScrollAnchorWhen(placeQueue.showAddForm, addPlaceFormAnchorRef);

  const placeQueueSummary = useMemo(
    () => ({ pending: placeQueue.pendingCount, flagged: placeQueue.flaggedCount }),
    [placeQueue.pendingCount, placeQueue.flaggedCount],
  );

  const venueUrlField = snapshotVenueUrlField(placeQueue.form.venueUrl);
  const venueUrlHintMessage = resolveModeratorVenueUrlHint(venueUrlField.phase, t);
  const venueUrlHintClass = venueUrlHintToneClass(venueUrlField.phase);

  const queueErrorTitle =
    placeQueue.queueErrorState?.kind === "load-failure"
      ? t("moderator.places.error.loadFailureTitle")
      : t("moderator.places.error.updateTitle");

  const resolveEmptyDescription = () =>
    placeQueue.search.trim().length > 0
      ? t("moderator.places.empty.withSearch")
      : t("moderator.places.empty.default");

  const dismissAddPlaceForm = useCallback(() => {
    placeQueue.setShowAddForm(false);
    placeQueue.setForm(EMPTY_VENUE_URL_FORM);
  }, [placeQueue]);

  const openVenueDetail = useCallback(
    (venueId: string) => {
      navigate(`/venue/${venueId}`);
    },
    [navigate],
  );

  const navigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const retryPlaceQueue = () => void placeQueue.retry();

  return {
    t,
    locale,
    ...placeQueue,
    ...paginationJump,
    addPlaceFormAnchorRef,
    statusFilterOptions,
    placeQueueSummary,
    venueUrlField,
    venueUrlHintMessage,
    venueUrlHintClass,
    queueErrorTitle,
    placePlaceholderImage: PLACE_PLACEHOLDER_IMAGE,
    resolveEmptyDescription,
    dismissAddPlaceForm,
    openVenueDetail,
    navigateBack,
    retryPlaceQueue,
  };
};
