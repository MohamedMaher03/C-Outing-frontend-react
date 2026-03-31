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
  AdminCategory,
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

interface UseManagePlacesReturn {
  // Data state
  places: AdminPlace[];
  categories: AdminCategory[];
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
  showTagPicker: boolean;

  // Toast state
  toasts: AdminToast[];

  // Setters
  setSearch: (value: string) => void;
  setStatusFilter: (value: AdminPlaceStatusFilter) => void;
  setShowAddForm: (value: boolean | ((prev: boolean) => boolean)) => void;
  setForm: (
    value: PlaceFormData | ((prev: PlaceFormData) => PlaceFormData),
  ) => void;
  setShowTagPicker: (value: boolean) => void;

  // Actions
  retry: () => Promise<void>;
  handleStatusChange: (
    placeId: string,
    status: AdminPlace["status"],
  ) => Promise<void>;
  handleDelete: (placeId: string, placeName: string) => Promise<void>;
  handleAddPlace: () => Promise<void>;
  toggleTag: (tag: string) => void;
}

export const useManagePlaces = (): UseManagePlacesReturn => {
  const [places, setPlaces] = useState<AdminPlace[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
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
  const [showTagPicker, setShowTagPicker] = useState(false);
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

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [placesData, catsData] = await Promise.all([
        adminService.getPlaces(),
        adminService.getCategories(),
      ]);

      if (!mountedRef.current) return;

      setPlaces(placesData);
      setCategories(catsData);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, "Failed to load places"));
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

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
      showToast(`Place status updated to ${status}.`);
    } catch (err) {
      if (!mountedRef.current) return;
      const message = getErrorMessage(err, "Failed to update place status");
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
      showToast(`"${placeName}" has been permanently deleted.`, "warning");
    } catch (err) {
      if (!mountedRef.current) return;
      const message = getErrorMessage(err, "Failed to delete place");
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

    const errors = validatePlaceForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please fix validation errors before submitting.");
      return;
    }

    setSubmittingForm(true);
    setError(null);

    try {
      const newPlace = await adminService.addPlace(toCreatePlaceInput(form));
      if (!mountedRef.current) return;

      setPlaces((prev) => [newPlace, ...prev]);
      setForm(EMPTY_PLACE_FORM);
      setFormErrors({});
      setShowAddForm(false);
      setShowTagPicker(false);
      showToast(
        `"${newPlace.name}" added successfully! Status: pending review.`,
      );
    } catch (err) {
      if (!mountedRef.current) return;
      const message = getErrorMessage(err, "Failed to add place");
      setError(message);
      showToast(message, "error");
    } finally {
      if (mountedRef.current) {
        setSubmittingForm(false);
      }
    }
  };

  const toggleTag = (tag: string) => {
    setError(null);
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const filteredPlaces = useMemo(
    () => filterPlaces(places, deferredSearch, statusFilter),
    [places, deferredSearch, statusFilter],
  );

  return {
    places,
    categories,
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
    showTagPicker,
    toasts,
    setSearch,
    setStatusFilter,
    setShowAddForm,
    setForm,
    setShowTagPicker,
    retry: loadPlaces,
    handleStatusChange,
    handleDelete,
    handleAddPlace,
    toggleTag,
  };
};
