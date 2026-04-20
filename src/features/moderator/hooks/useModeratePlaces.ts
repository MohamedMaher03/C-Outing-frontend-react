import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AdminPlace, AdminPlaceStatus } from "@/features/admin/types";
import { moderatorService } from "@/features/moderator/services/moderatorService";
import type {
  ModeratePlaceFormData,
  ModeratePlaceFormErrors,
  ModeratorPlaceStatusFilter,
  ModeratePlaceToast,
} from "@/features/moderator/types";
import { isGoogleMapsVenueUrl } from "@/features/admin/utils/placeForm";
import { filterModerationPlaces } from "@/features/moderator/utils/moderatorFilters";
import {
  getErrorMessage,
  resolveApiUiErrorState,
  type ApiUiErrorState,
} from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

const EMPTY_FORM: ModeratePlaceFormData = {
  venueUrl: "",
};

interface UseModeratePlacesReturn {
  places: AdminPlace[];
  loading: boolean;
  error: string | null;
  queueErrorState: ApiUiErrorState | null;
  pendingPlaceIds: string[];
  pendingPlaceIdSet: ReadonlySet<string>;

  search: string;
  statusFilter: ModeratorPlaceStatusFilter;
  filteredPlaces: AdminPlace[];

  showAddForm: boolean;
  form: ModeratePlaceFormData;
  formErrors: ModeratePlaceFormErrors;
  submittingForm: boolean;

  toasts: ModeratePlaceToast[];

  setSearch: (value: string) => void;
  setStatusFilter: (value: ModeratorPlaceStatusFilter) => void;
  setShowAddForm: (value: boolean | ((prev: boolean) => boolean)) => void;
  setForm: (
    value:
      | ModeratePlaceFormData
      | ((prev: ModeratePlaceFormData) => ModeratePlaceFormData),
  ) => void;

  retry: () => Promise<void>;
  handleApprove: (placeId: string) => Promise<void>;
  handleFlag: (placeId: string) => Promise<void>;
  handleDeletePlace: (placeId: string, placeName: string) => Promise<void>;
  handleAddPlace: () => Promise<void>;
}

export const useModeratePlaces = (): UseModeratePlacesReturn => {
  const { t } = useI18n();
  const [places, setPlaces] = useState<AdminPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queueErrorState, setQueueErrorState] =
    useState<ApiUiErrorState | null>(null);
  const [pendingPlaceIds, setPendingPlaceIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ModeratorPlaceStatusFilter>("all");
  const deferredSearch = useDeferredValue(search);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<ModeratePlaceFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<ModeratePlaceFormErrors>({});
  const [submittingForm, setSubmittingForm] = useState(false);
  const [toasts, setToasts] = useState<ModeratePlaceToast[]>([]);
  const mountedRef = useRef(true);
  const inFlightRef = useRef(new Set<string>());
  const toastTimersRef = useRef<number[]>([]);
  const pendingPlaceIdSet = useMemo(
    () => new Set(pendingPlaceIds),
    [pendingPlaceIds],
  );

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    setQueueErrorState(null);

    try {
      const placesData = await moderatorService.getPlaces();

      if (!mountedRef.current) return;

      setPlaces(placesData);
      setQueueErrorState(null);
    } catch (err) {
      if (!mountedRef.current) return;

      const resolvedError = resolveApiUiErrorState(err, {
        forbiddenMessage: t("moderator.places.error.forbiddenMessage"),
        loadFailureMessage: t("moderator.places.error.loadFailureMessage"),
        genericMessage: t("moderator.error.loadPlaces"),
      });

      setQueueErrorState(resolvedError);
      setError(resolvedError.message);
      setPlaces([]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    mountedRef.current = true;
    void loadPlaces();

    return () => {
      mountedRef.current = false;
      toastTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      toastTimersRef.current = [];
    };
  }, [loadPlaces]);

  const addPendingPlace = useCallback((placeId: string) => {
    setPendingPlaceIds((prev) =>
      prev.includes(placeId) ? prev : [...prev, placeId],
    );
  }, []);

  const removePendingPlace = useCallback((placeId: string) => {
    setPendingPlaceIds((prev) => prev.filter((id) => id !== placeId));
  }, []);

  const showToast = (
    message: string,
    variant: ModeratePlaceToast["variant"] = "success",
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    const timerId = window.setTimeout(() => {
      if (!mountedRef.current) return;
      setToasts((prev) => prev.filter((t) => t.id !== id));
      toastTimersRef.current = toastTimersRef.current.filter(
        (value) => value !== timerId,
      );
    }, 3500);

    toastTimersRef.current.push(timerId);
  };

  const handleStatusChange = useCallback(
    async (
      placeId: string,
      status: AdminPlaceStatus,
      successMessage: string,
    ) => {
      if (inFlightRef.current.has(placeId)) {
        return;
      }

      inFlightRef.current.add(placeId);
      addPendingPlace(placeId);
      setError(null);

      try {
        await moderatorService.updatePlaceStatus(placeId, status);
        if (!mountedRef.current) return;

        setPlaces((prev) =>
          prev.map((place) =>
            place.id === placeId ? { ...place, status } : place,
          ),
        );

        showToast(successMessage, status === "flagged" ? "warning" : "success");
      } catch (err) {
        if (!mountedRef.current) return;

        const resolvedError = resolveApiUiErrorState(err, {
          forbiddenMessage: t("moderator.places.error.forbiddenMessage"),
          loadFailureMessage: t("moderator.places.error.loadFailureMessage"),
          genericMessage: t("moderator.error.updatePlaceStatus"),
        });

        if (resolvedError.kind === "forbidden") {
          setQueueErrorState(resolvedError);
        }

        const message = getErrorMessage(
          err,
          t("moderator.error.updatePlaceStatus"),
        );
        setError(message);
        showToast(message, "error");
      } finally {
        inFlightRef.current.delete(placeId);
        if (mountedRef.current) {
          removePendingPlace(placeId);
        }
      }
    },
    [addPendingPlace, removePendingPlace, t],
  );

  const validateForm = (): boolean => {
    const errors: ModeratePlaceFormErrors = {};
    const trimmedVenueUrl = form.venueUrl.trim();

    if (!trimmedVenueUrl) {
      errors.venueUrl = t(
        "admin.places.form.error.venueUrlRequired",
        undefined,
        "Google Maps URL is required.",
      );
    } else if (!isGoogleMapsVenueUrl(trimmedVenueUrl)) {
      errors.venueUrl = t(
        "admin.places.form.error.venueUrlInvalid",
        undefined,
        "Please enter a valid Google Maps place URL.",
      );
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApprove = useCallback(
    async (placeId: string) => {
      await handleStatusChange(
        placeId,
        "active",
        t("moderator.places.toast.approved"),
      );
    },
    [handleStatusChange, t],
  );

  const handleFlag = useCallback(
    async (placeId: string) => {
      await handleStatusChange(
        placeId,
        "flagged",
        t("moderator.places.toast.flagged"),
      );
    },
    [handleStatusChange, t],
  );

  const handleDeletePlace = useCallback(
    async (placeId: string, placeName: string) => {
      if (inFlightRef.current.has(placeId)) {
        return;
      }

      inFlightRef.current.add(placeId);
      addPendingPlace(placeId);
      setError(null);

      try {
        await moderatorService.deletePlace(placeId);
        if (!mountedRef.current) return;

        setPlaces((prev) => prev.filter((place) => place.id !== placeId));
        showToast(
          t("moderator.places.toast.deleted", { name: placeName }),
          "warning",
        );
      } catch (err) {
        if (!mountedRef.current) return;

        const resolvedError = resolveApiUiErrorState(err, {
          forbiddenMessage: t("moderator.places.error.forbiddenMessage"),
          loadFailureMessage: t("moderator.places.error.loadFailureMessage"),
          genericMessage: t("moderator.error.deletePlace"),
        });

        if (resolvedError.kind === "forbidden") {
          setQueueErrorState(resolvedError);
        }

        const message = getErrorMessage(err, t("moderator.error.deletePlace"));
        setError(message);
        showToast(message, "error");
      } finally {
        inFlightRef.current.delete(placeId);
        if (mountedRef.current) {
          removePendingPlace(placeId);
        }
      }
    },
    [addPendingPlace, removePendingPlace, t],
  );

  const handleAddPlace = async () => {
    if (submittingForm) {
      return;
    }

    if (!validateForm()) {
      setError(t("moderator.error.fixValidation"));
      return;
    }

    setSubmittingForm(true);
    setError(null);

    try {
      await moderatorService.addPlace({
        venueUrl: form.venueUrl.trim(),
      });

      if (!mountedRef.current) return;

      void loadPlaces();
      setForm(EMPTY_FORM);
      setFormErrors({});
      setShowAddForm(false);
      showToast(
        t(
          "moderator.places.toast.scrapeStarted",
          undefined,
          "Scraping started. The venue will appear after processing.",
        ),
      );
    } catch (err) {
      if (!mountedRef.current) return;

      const resolvedError = resolveApiUiErrorState(err, {
        forbiddenMessage: t("moderator.places.error.forbiddenMessage"),
        loadFailureMessage: t("moderator.places.error.loadFailureMessage"),
        genericMessage: t("moderator.error.addPlace"),
      });

      if (resolvedError.kind === "forbidden") {
        setQueueErrorState(resolvedError);
      }

      const message = getErrorMessage(err, t("moderator.error.addPlace"));
      setError(message);
      showToast(message, "error");
    } finally {
      if (mountedRef.current) {
        setSubmittingForm(false);
      }
    }
  };

  const filteredPlaces = useMemo(
    () => filterModerationPlaces(places, deferredSearch, statusFilter),
    [places, deferredSearch, statusFilter],
  );

  return {
    places,
    loading,
    error,
    queueErrorState,
    pendingPlaceIds,
    pendingPlaceIdSet,
    search,
    statusFilter,
    filteredPlaces,
    showAddForm,
    form,
    formErrors,
    submittingForm,
    toasts,
    setSearch,
    setStatusFilter,
    setShowAddForm,
    setForm,
    retry: loadPlaces,
    handleApprove,
    handleFlag,
    handleDeletePlace,
    handleAddPlace,
  };
};
