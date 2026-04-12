/**
 * useManagePlaces Hook
 * Manages state and actions for the Manage Places admin page.
 */

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { adminService } from "@/features/admin/services/adminService";
import type {
  AdminPlace,
  AdminPlaceStatusFilter,
  AdminToast,
  PlaceFormData,
  PlaceFormErrors,
} from "@/features/admin/types";
import { filterPlaces } from "@/features/admin/utils/adminFilters";
import {
  EMPTY_PLACE_FORM,
  toCreatePlaceInput,
  validatePlaceForm,
} from "@/features/admin/utils/placeForm";
import { getErrorMessage } from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

type PlaceActionNoticeType = "removed" | "deleted";

interface PlaceActionNotice {
  type: PlaceActionNoticeType;
  message: string;
}

interface UseManagePlacesReturn {
  // Data state
  places: AdminPlace[];
  loading: boolean;
  error: string | null;
  pendingPlaceIds: string[];

  // Filter state
  search: string;
  statusFilter: AdminPlaceStatusFilter;
  filteredPlaces: AdminPlace[];

  // Form state
  showAddForm: boolean;
  form: PlaceFormData;
  formErrors: PlaceFormErrors;
  submittingForm: boolean;
  scrapeStartedMessage: string | null;
  placeActionNotice: PlaceActionNotice | null;

  // Toast state
  toasts: AdminToast[];

  // Setters
  setSearch: (value: string) => void;
  setStatusFilter: (value: AdminPlaceStatusFilter) => void;
  setShowAddForm: (value: boolean | ((prev: boolean) => boolean)) => void;
  setForm: (
    value: PlaceFormData | ((prev: PlaceFormData) => PlaceFormData),
  ) => void;
  dismissScrapeStartedMessage: () => void;
  dismissPlaceActionNotice: () => void;

  // Actions
  retry: () => Promise<void>;
  handleStatusChange: (
    placeId: string,
    status: AdminPlace["status"],
  ) => Promise<void>;
  handleDelete: (placeId: string, placeName: string) => Promise<void>;
  handleAddPlace: () => Promise<void>;
}

export const useManagePlaces = (): UseManagePlacesReturn => {
  const { t } = useI18n();
  const [places, setPlaces] = useState<AdminPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingPlaceIds, setPendingPlaceIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AdminPlaceStatusFilter>("all");
  const deferredSearch = useDeferredValue(search);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<PlaceFormData>(EMPTY_PLACE_FORM);
  const [formErrors, setFormErrors] = useState<PlaceFormErrors>({});
  const [submittingForm, setSubmittingForm] = useState(false);
  const [scrapeStartedMessage, setScrapeStartedMessage] = useState<
    string | null
  >(null);
  const [placeActionNotice, setPlaceActionNotice] =
    useState<PlaceActionNotice | null>(null);
  const [toasts, setToasts] = useState<AdminToast[]>([]);
  const mountedRef = useRef(true);
  const inFlightRef = useRef(new Set<string>());
  const toastTimersRef = useRef<number[]>([]);

  const addPendingPlace = (placeId: string) => {
    setPendingPlaceIds((prev) =>
      prev.includes(placeId) ? prev : [...prev, placeId],
    );
  };

  const removePendingPlace = (placeId: string) => {
    setPendingPlaceIds((prev) => prev.filter((id) => id !== placeId));
  };

  const getStatusLabel = (status: AdminPlace["status"]): string =>
    t(`admin.status.${status}`, undefined, status);

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const placesData = await adminService.getPlaces();

      if (!mountedRef.current) return;

      setPlaces(placesData);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, t("admin.error.loadPlaces")));
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

  const showToast = (
    message: string,
    variant: AdminToast["variant"] = "success",
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

  const dismissScrapeStartedMessage = () => {
    setScrapeStartedMessage(null);
  };

  const dismissPlaceActionNotice = () => {
    setPlaceActionNotice(null);
  };

  const handleStatusChange = async (
    placeId: string,
    status: AdminPlace["status"],
  ) => {
    if (inFlightRef.current.has(placeId)) {
      return;
    }

    inFlightRef.current.add(placeId);
    addPendingPlace(placeId);
    setError(null);

    try {
      await adminService.updatePlaceStatus(placeId, status);
      if (!mountedRef.current) return;

      setPlaces((prev) =>
        prev.map((p) => (p.id === placeId ? { ...p, status } : p)),
      );
      const statusUpdatedMessage = t("admin.places.toast.statusUpdated", {
        status: getStatusLabel(status),
      });

      if (status === "removed") {
        setPlaceActionNotice({
          type: "removed",
          message: statusUpdatedMessage,
        });
      } else {
        showToast(statusUpdatedMessage);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      const message = getErrorMessage(err, t("admin.error.updatePlaceStatus"));
      setError(message);
      showToast(message, "error");
    } finally {
      inFlightRef.current.delete(placeId);
      if (mountedRef.current) {
        removePendingPlace(placeId);
      }
    }
  };

  const handleDelete = async (placeId: string, placeName: string) => {
    if (inFlightRef.current.has(placeId)) {
      return;
    }

    inFlightRef.current.add(placeId);
    addPendingPlace(placeId);
    setError(null);

    try {
      await adminService.deletePlace(placeId);
      if (!mountedRef.current) return;

      setPlaces((prev) => prev.filter((p) => p.id !== placeId));
      setPlaceActionNotice({
        type: "deleted",
        message: t("admin.places.toast.deleted", { name: placeName }),
      });
    } catch (err) {
      if (!mountedRef.current) return;
      const message = getErrorMessage(err, t("admin.error.deletePlace"));
      setError(message);
      showToast(message, "error");
    } finally {
      inFlightRef.current.delete(placeId);
      if (mountedRef.current) {
        removePendingPlace(placeId);
      }
    }
  };

  const handleAddPlace = async () => {
    if (submittingForm) {
      return;
    }

    const errors = validatePlaceForm(form, t);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError(t("admin.places.error.fixValidation"));
      return;
    }

    setScrapeStartedMessage(null);
    setSubmittingForm(true);
    setError(null);

    try {
      await adminService.addPlace(toCreatePlaceInput(form));
      if (!mountedRef.current) return;

      const startedMessage = t(
        "admin.places.toast.scrapeStarted",
        undefined,
        "Scraping started. The venue will appear after processing.",
      );

      void loadPlaces();
      setForm(EMPTY_PLACE_FORM);
      setFormErrors({});
      setShowAddForm(false);
      setScrapeStartedMessage(startedMessage);
    } catch (err) {
      if (!mountedRef.current) return;
      const message = getErrorMessage(err, t("admin.error.addPlace"));
      setError(message);
      showToast(message, "error");
    } finally {
      if (mountedRef.current) {
        setSubmittingForm(false);
      }
    }
  };

  const filteredPlaces = useMemo(
    () => filterPlaces(places, deferredSearch, statusFilter),
    [places, deferredSearch, statusFilter],
  );

  return {
    places,
    loading,
    error,
    pendingPlaceIds,
    search,
    statusFilter,
    filteredPlaces,
    showAddForm,
    form,
    formErrors,
    submittingForm,
    scrapeStartedMessage,
    placeActionNotice,
    toasts,
    setSearch,
    setStatusFilter,
    setShowAddForm,
    setForm,
    dismissScrapeStartedMessage,
    dismissPlaceActionNotice,
    retry: loadPlaces,
    handleStatusChange,
    handleDelete,
    handleAddPlace,
  };
};
