/**
 * useModeratePlaces Hook
 * Manages state and actions for the Moderate Places moderator page.
 *
 * Note: Places are an admin-managed resource, so this hook delegates
 * data fetching and mutations to adminService.
 */

import { useState, useEffect } from "react";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminPlace, AdminCategory } from "@/features/admin/types";
import type {
  ModeratePlaceFormData,
  ModeratePlaceFormErrors,
  ModeratePlaceToast,
} from "@/features/moderator/types";
import { getErrorMessage } from "@/utils/apiError";

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

  // Filter state
  search: string;
  statusFilter: string;
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
  setStatusFilter: (value: string) => void;
  setShowAddForm: (value: boolean | ((prev: boolean) => boolean)) => void;
  setForm: (
    value:
      | ModeratePlaceFormData
      | ((prev: ModeratePlaceFormData) => ModeratePlaceFormData),
  ) => void;
  setShowTagPicker: (value: boolean) => void;

  // Actions
  handleApprove: (placeId: string) => Promise<void>;
  handleFlag: (placeId: string) => Promise<void>;
  handleEscalateDelete: (placeId: string, placeName: string) => Promise<void>;
  handleAddPlace: () => Promise<void>;
  toggleTag: (tag: string) => void;
}

export const useModeratePlaces = (): UseModeratePlacesReturn => {
  const [places, setPlaces] = useState<AdminPlace[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<ModeratePlaceFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<ModeratePlaceFormErrors>({});
  const [submittingForm, setSubmittingForm] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [toasts, setToasts] = useState<ModeratePlaceToast[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [placesData, catsData] = await Promise.all([
          adminService.getPlaces(),
          adminService.getCategories(),
        ]);
        setPlaces(placesData);
        setCategories(catsData);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load places"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const showToast = (
    message: string,
    variant: ModeratePlaceToast["variant"] = "success",
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  };

  const handleApprove = async (placeId: string) => {
    await adminService.updatePlaceStatus(placeId, "active");
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === placeId ? { ...p, status: "active" as const } : p,
      ),
    );
    showToast("Place approved successfully.");
  };

  const handleFlag = async (placeId: string) => {
    await adminService.updatePlaceStatus(placeId, "flagged");
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === placeId ? { ...p, status: "flagged" as const } : p,
      ),
    );
    showToast("Place flagged for review.", "warning");
  };

  const handleEscalateDelete = async (placeId: string, placeName: string) => {
    await adminService.deletePlace(placeId);
    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
    showToast(
      `"${placeName}" escalated for deletion — pending admin review.`,
      "warning",
    );
  };

  const validateForm = (): boolean => {
    const errors: ModeratePlaceFormErrors = {};
    if (!form.name.trim()) errors.name = "Place name is required.";
    if (!form.category) errors.category = "Please select a category.";
    if (!form.district) errors.district = "Please select a district.";
    if (!form.description.trim()) {
      errors.description = "Description is required.";
    } else if (form.description.trim().length < 20) {
      errors.description = "Description must be at least 20 characters.";
    }
    if (!form.image.trim()) errors.image = "Image URL is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPlace = async () => {
    if (!validateForm()) return;
    setSubmittingForm(true);
    try {
      const newPlace = await adminService.addPlace({
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
      setPlaces((prev) => [newPlace, ...prev]);
      setForm(EMPTY_FORM);
      setFormErrors({});
      setShowAddForm(false);
      showToast(`"${newPlace.name}" submitted for admin review.`);
    } catch {
      showToast("Failed to submit place. Please try again.", "error");
    } finally {
      setSubmittingForm(false);
    }
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const filteredPlaces = places.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.district.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    places,
    categories,
    loading,
    error,
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
    handleApprove,
    handleFlag,
    handleEscalateDelete,
    handleAddPlace,
    toggleTag,
  };
};
