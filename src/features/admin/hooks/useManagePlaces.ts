/**
 * useManagePlaces Hook
 * Manages state and actions for the Manage Places admin page.
 */

import { useState, useEffect } from "react";
import { adminService } from "@/features/admin/services/adminService";
import type {
  AdminPlace,
  AdminCategory,
  AdminToast,
  PlaceFormData,
  PlaceFormErrors,
} from "@/features/admin/types";

const EMPTY_FORM: PlaceFormData = {
  name: "",
  category: "",
  district: "",
  description: "",
  whyRecommend: "",
  priceLevel: 2,
  tags: [],
  image: "",
  phone: "",
  website: "",
};

interface UseManagePlacesReturn {
  // Data state
  places: AdminPlace[];
  categories: AdminCategory[];
  loading: boolean;

  // Filter state
  search: string;
  statusFilter: string;
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
  setStatusFilter: (value: string) => void;
  setShowAddForm: (value: boolean | ((prev: boolean) => boolean)) => void;
  setForm: (
    value: PlaceFormData | ((prev: PlaceFormData) => PlaceFormData),
  ) => void;
  setShowTagPicker: (value: boolean) => void;

  // Actions
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<PlaceFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<PlaceFormErrors>({});
  const [submittingForm, setSubmittingForm] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [toasts, setToasts] = useState<AdminToast[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [placesData, catsData] = await Promise.all([
          adminService.getPlaces(),
          adminService.getCategories(),
        ]);
        setPlaces(placesData);
        setCategories(catsData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const showToast = (
    message: string,
    variant: AdminToast["variant"] = "success",
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  };

  const handleStatusChange = async (
    placeId: string,
    status: AdminPlace["status"],
  ) => {
    await adminService.updatePlaceStatus(placeId, status);
    setPlaces((prev) =>
      prev.map((p) => (p.id === placeId ? { ...p, status } : p)),
    );
    showToast(`Place status updated to ${status}.`);
  };

  const handleDelete = async (placeId: string, placeName: string) => {
    await adminService.deletePlace(placeId);
    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
    showToast(`"${placeName}" has been permanently deleted.`, "error");
  };

  const validateForm = (): boolean => {
    const errors: PlaceFormErrors = {};
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
        whyRecommend: form.whyRecommend.trim(),
        priceLevel: form.priceLevel,
        phone: form.phone.trim(),
        website: form.website.trim(),
      });
      setPlaces((prev) => [newPlace, ...prev]);
      setForm(EMPTY_FORM);
      setFormErrors({});
      setShowAddForm(false);
      showToast(
        `"${newPlace.name}" added successfully! Status: pending review.`,
      );
    } catch {
      showToast("Failed to add place. Please try again.", "error");
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
    handleStatusChange,
    handleDelete,
    handleAddPlace,
    toggleTag,
  };
};
