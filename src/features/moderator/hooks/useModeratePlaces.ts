/**
 * useModeratePlaces Hook
 * Manages state and actions for the Moderate Places moderator page.
 *
 * Data access is delegated to moderatorService to keep hook concerns focused on UI state.
 */

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AdminCategory,
  AdminPlace,
  AdminPlaceStatus,
} from "@/features/admin/types";
import { moderatorService } from "@/features/moderator/services/moderatorService";
import type {
  ModeratePlaceFormData,
  ModeratePlaceFormErrors,
  ModeratorPlaceStatusFilter,
  ModeratePlaceToast,
} from "@/features/moderator/types";
import { filterModerationPlaces } from "@/features/moderator/utils/moderatorFilters";
import { getErrorMessage } from "@/utils/apiError";
import { useI18n } from "@/components/i18n";

const EMPTY_FORM: ModeratePlaceFormData = {
  name: "",
  category: "",
  district: "",
  description: "",
  priceLevel: "mid_range",
  tags: [],
  image: "",
  phone: "",
  website: "",
};

interface UseModeratePlacesReturn {
  // Data state
  places: AdminPlace[];
  categories: AdminCategory[];
  loading: boolean;
  error: string | null;
  pendingPlaceIds: string[];
  pendingPlaceIdSet: ReadonlySet<string>;

  // Filter state
  search: string;
  statusFilter: ModeratorPlaceStatusFilter;
  filteredPlaces: AdminPlace[];

  // Form state
  showAddForm: boolean;
  form: ModeratePlaceFormData;
  formErrors: ModeratePlaceFormErrors;
  submittingForm: boolean;
  showTagPicker: boolean;

  // Toast state
  toasts: ModeratePlaceToast[];

  // Setters
  setSearch: (value: string) => void;
  setStatusFilter: (value: ModeratorPlaceStatusFilter) => void;
  setShowAddForm: (value: boolean | ((prev: boolean) => boolean)) => void;
  setForm: (
    value:
      | ModeratePlaceFormData
      | ((prev: ModeratePlaceFormData) => ModeratePlaceFormData),
  ) => void;
  setShowTagPicker: (value: boolean) => void;

  // Actions
  retry: () => Promise<void>;
  handleApprove: (placeId: string) => Promise<void>;
  handleFlag: (placeId: string) => Promise<void>;
  handleDeletePlace: (placeId: string, placeName: string) => Promise<void>;
  handleAddPlace: () => Promise<void>;
  toggleTag: (tag: string) => void;
}

export const useModeratePlaces = (): UseModeratePlacesReturn => {
  const { t } = useI18n();
  const [places, setPlaces] = useState<AdminPlace[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingPlaceIds, setPendingPlaceIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ModeratorPlaceStatusFilter>("all");
  const deferredSearch = useDeferredValue(search);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<ModeratePlaceFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<ModeratePlaceFormErrors>({});
  const [submittingForm, setSubmittingForm] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
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

    try {
      const [placesData, categoriesData] = await Promise.all([
        moderatorService.getPlaces(),
        moderatorService.getCategories(),
      ]);

      if (!mountedRef.current) return;

      setPlaces(placesData);
      setCategories(categoriesData);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(getErrorMessage(err, t("moderator.error.loadPlaces")));
      setPlaces([]);
      setCategories([]);
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
    const trimmedName = form.name.trim();
    const trimmedDescription = form.description.trim();
    const trimmedImage = form.image.trim();

    if (!trimmedName) {
      errors.name = t("admin.places.form.error.nameRequired");
    } else if (trimmedName.length > 120) {
      errors.name = t("admin.places.form.error.nameMax", { max: 120 });
    }

    if (!form.category)
      errors.category = t("admin.places.form.error.categoryRequired");
    if (!form.district)
      errors.district = t("admin.places.form.error.districtRequired");

    if (!trimmedDescription) {
      errors.description = t("admin.places.form.error.descriptionRequired");
    } else if (trimmedDescription.length < 20) {
      errors.description = t("admin.places.form.error.descriptionMin", {
        min: 20,
      });
    } else if (trimmedDescription.length > 1200) {
      errors.description = t("admin.places.form.error.descriptionMax", {
        max: 1200,
      });
    }

    if (!trimmedImage) {
      errors.image = t("admin.places.form.error.imageRequired");
    } else {
      const isValidImageUrl = /^https?:\/\//i.test(trimmedImage);
      if (!isValidImageUrl) {
        errors.image = t("admin.places.form.error.imageUrlInvalid");
      }
    }

    if (form.website.trim() && !/^https?:\/\//i.test(form.website.trim())) {
      errors.website = t("admin.places.form.error.websiteUrlInvalid");
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
      const newPlace = await moderatorService.addPlace({
        name: form.name.trim(),
        category: form.category,
        district: form.district,
        image: form.image.trim(),
        tags: form.tags,
        description: form.description.trim(),
        priceLevel: form.priceLevel,
        phone: form.phone.trim(),
        website: form.website.trim(),
      });

      if (!mountedRef.current) return;

      setPlaces((prev) => [newPlace, ...prev]);
      setForm(EMPTY_FORM);
      setFormErrors({});
      setShowAddForm(false);
      setShowTagPicker(false);
      showToast(t("moderator.places.toast.submitted", { name: newPlace.name }));
    } catch (err) {
      if (!mountedRef.current) return;

      const message = getErrorMessage(err, t("moderator.error.addPlace"));
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
    () => filterModerationPlaces(places, deferredSearch, statusFilter),
    [places, deferredSearch, statusFilter],
  );

  return {
    places,
    categories,
    loading,
    error,
    pendingPlaceIds,
    pendingPlaceIdSet,
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
    handleApprove,
    handleFlag,
    handleDeletePlace,
    handleAddPlace,
    toggleTag,
  };
};
