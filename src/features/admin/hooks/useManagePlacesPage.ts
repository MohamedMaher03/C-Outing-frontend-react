import { useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useManagePlaces } from "@/features/admin/hooks/useManagePlaces";
import { PLACE_STATUS_FILTER_OPTIONS } from "@/features/admin/constants/filterOptions";
import { localizeAdminStatusFilters } from "@/features/admin/utils/adminFilterLabels";
import { countRecordsWhere } from "@/features/admin/utils/adminRecordMetrics";
import { EMPTY_PLACE_FORM } from "@/features/admin/utils/placeForm";
import {
  snapshotVenueUrlField,
  resolveAdminVenueUrlHint,
  venueUrlHintToneClass,
} from "@/features/admin/utils/venueUrlFieldState";
import { usePaginationJump } from "@/hooks/usePaginationJump";
import { useScrollAnchorWhen } from "@/hooks/useScrollAnchorWhen";
import { useI18n } from "@/components/i18n";

export const useManagePlacesPage = () => {
  const navigate = useNavigate();
  const { t, formatNumber } = useI18n();
  const placeRegistry = useManagePlaces();
  const addPlaceFormAnchorRef = useRef<HTMLDivElement>(null);

  const statusFilterOptions = useMemo(
    () => localizeAdminStatusFilters(PLACE_STATUS_FILTER_OPTIONS, t),
    [t],
  );

  const paginationJump = usePaginationJump(
    placeRegistry.pageIndex,
    placeRegistry.goToPage,
  );

  useScrollAnchorWhen(placeRegistry.showAddForm, addPlaceFormAnchorRef);

  const flaggedPlacesCount = countRecordsWhere(
    placeRegistry.places,
    (place) => place.status === "flagged",
  );

  const venueUrlField = snapshotVenueUrlField(placeRegistry.form.venueUrl);
  const venueUrlHintMessage = resolveAdminVenueUrlHint(venueUrlField.phase, t);
  const venueUrlHintClass = venueUrlHintToneClass(venueUrlField.phase);

  const resolveStatusLabel = (status: string) =>
    t(`admin.status.${status}`, undefined, status);

  const toggleAddPlaceForm = useCallback(() => {
    placeRegistry.setShowAddForm((visible) => !visible);
  }, [placeRegistry]);

  const dismissAddPlaceForm = useCallback(() => {
    placeRegistry.setShowAddForm(false);
    placeRegistry.setForm(EMPTY_PLACE_FORM);
  }, [placeRegistry]);

  const openVenueDetail = useCallback(
    (venueId: string) => {
      navigate(`/venue/${venueId}`);
    },
    [navigate],
  );

  const retryPlaceRegistry = () => void placeRegistry.retry();

  return {
    t,
    formatNumber,
    ...placeRegistry,
    ...paginationJump,
    addPlaceFormAnchorRef,
    statusFilterOptions,
    flaggedPlacesCount,
    venueUrlField,
    venueUrlHintMessage,
    venueUrlHintClass,
    resolveStatusLabel,
    toggleAddPlaceForm,
    dismissAddPlaceForm,
    openVenueDetail,
    retryPlaceRegistry,
  };
};
